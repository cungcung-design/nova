import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

import { createAuditLog } from "@/lib/audit/audit-service";
import { rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";
import { getClientIp } from "@/lib/security/security";
import { signupSchema } from "@/lib/validation/auth";
import { parseRequestBody } from "@/lib/validation/parse";

export async function POST(request: Request) {
  try {
    const limited = await rateLimit(`signup:${getClientIp(request)}`, 10, 60, {
      failOpen: false,
    });

    if (!limited.success) {
      return rateLimitResponse(
        "Too many signup attempts. Please try again later.",
      );
    }

    const parsed = await parseRequestBody(request, signupSchema);

    if (!parsed.success) {
      return parsed.response;
    }

    const name = parsed.data.name;
    const email = parsed.data.email.trim().toLowerCase();
    const password = parsed.data.password;

    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: "An account with this email already exists.",
        },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await db.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
        },
      });

      const workspace = await tx.workspace.create({
        data: {
          name: `${name}'s Workspace`,
          slug: `${name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")}-${Date.now()}`,
          plan: "FREE",
        },
      });

      await tx.membership.create({
        data: {
          userId: newUser.id,
          workspaceId: workspace.id,
          role: "OWNER",
        },
      });

      await tx.workspaceMember.create({
        data: {
          userId: newUser.id,
          workspaceId: workspace.id,
          role: "OWNER",
        },
      });

      await tx.subscription.create({
        data: {
          workspaceId: workspace.id,
          stripeCustomerId: `pending_${workspace.id}`,
          plan: "FREE",
          status: "ACTIVE",
        },
      });

      return { user: newUser, workspaceId: workspace.id };
    });

    await createAuditLog({
      workspaceId: user.workspaceId,
      userId: user.user.id,
      action: "USER_CREATED",
      entityType: "USER",
      entityId: user.user.id,
      metadata: {
        method: "signup",
      },
    });

    return NextResponse.json(
      {
        id: user.user.id,
        name: user.user.name,
        email: user.user.email,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Signup error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong.",
      },
      { status: 500 },
    );
  }
}
