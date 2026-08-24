import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { resetPasswordWithToken } from "@/lib/auth/password-reset";
import { createAuditLog } from "@/lib/audit/audit-service";
import { db } from "@/lib/db";
import { rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";
import { getClientIp } from "@/lib/security/security";
import { resetPasswordSchema } from "@/lib/validation/auth";
import { parseRequestBody } from "@/lib/validation/parse";

export async function POST(request: Request) {
  try {
    const limited = await rateLimit(
      `reset:${getClientIp(request)}`,
      10,
      60 * 15,
      { failOpen: false },
    );

    if (!limited.success) {
      return rateLimitResponse(
        "Too many reset attempts. Please try again later.",
      );
    }

    const parsed = await parseRequestBody(request, resetPasswordSchema);

    if (!parsed.success) {
      return parsed.response;
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const user = await resetPasswordWithToken(parsed.data.token, passwordHash);

    if (!user) {
      return NextResponse.json(
        { error: "This reset link is invalid or has expired." },
        { status: 400 },
      );
    }

    const membership = await db.membership.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    });

    await createAuditLog({
      workspaceId: membership?.workspaceId,
      userId: user.id,
      action: "PASSWORD_CHANGED",
      entityType: "USER",
      entityId: user.id,
    });

    return NextResponse.json({
      message: "Password updated. You can now sign in.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Unable to reset password." },
      { status: 500 },
    );
  }
}
