import { NextResponse } from "next/server";

import { WorkspaceRole } from "@prisma/client";

import { getCurrentWorkspace } from "@/lib/current-workspace";
import { requireRole } from "@/lib/authz";
import { permissions } from "@/lib/permissions";
import { requireWorkspaceRole } from "@/lib/workspace-permissions";
import { createInvitation, getTeam } from "@/services/team.service";
import { apiErrorResponse } from "@/lib/api-error";
import { createAuditLog } from "@/lib/audit/audit-service";
import { appBaseUrl, sendMail } from "@/lib/mail";
import { emailSchema } from "@/lib/validation/auth";

export async function GET() {
  try {
    const workspace = await getCurrentWorkspace();

    await requireRole(workspace.id, [...permissions.team.view]);

    const team = await getTeam(workspace.id);

    return NextResponse.json(team);
  } catch (error) {
    return apiErrorResponse(error, "Unable to load team.");
  }
}

export async function POST(request: Request) {
  try {
    const workspace = await getCurrentWorkspace();

    await requireWorkspaceRole(
      workspace.id,
      workspace.userId,
      WorkspaceRole.ADMIN,
    );

    const body = await request.json();

    const email = String(body.email ?? "").trim().toLowerCase();

    const role =
      body.role === "ADMIN"
        ? WorkspaceRole.ADMIN
        : WorkspaceRole.MEMBER;

    const parsedEmail = emailSchema.safeParse(email);

    if (!parsedEmail.success) {
      return NextResponse.json(
        {
          error: "A valid email is required.",
          message: "A valid email is required.",
        },
        {
          status: 400,
        },
      );
    }

    const invitation = await createInvitation({
      workspaceId: workspace.id,
      email: parsedEmail.data,
      role,
      actorId: workspace.userId,
    });

    await createAuditLog({
      workspaceId: workspace.id,
      userId: workspace.userId,
      action: "INVITE_MEMBER",
      entityType: "USER",
      entityId: invitation.id,
      metadata: {
        email: parsedEmail.data,
        role,
        type: "invite",
      },
    });

    const inviteUrl = `${appBaseUrl()}/invite/${invitation.token}`;

    try {
      await sendMail({
        to: parsedEmail.data,
        subject: `You've been invited to ${workspace.name} on NOVA`,
        text: `You've been invited to join ${workspace.name} as ${role}. Accept the invitation:\n${inviteUrl}\n\nThis link expires in 7 days.`,
        html: `<p>You've been invited to join <strong>${workspace.name}</strong> as ${role}.</p><p><a href="${inviteUrl}">Accept the invitation</a></p><p>This link expires in 7 days.</p>`,
      });
    } catch (error) {
      console.error("Invitation email failed:", error);
    }

    return NextResponse.json(
      {
        invitation,
        inviteUrl,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    return apiErrorResponse(error, "Unable to invite member.");
  }
}
