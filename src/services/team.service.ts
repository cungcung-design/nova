import { randomBytes } from "crypto";

import {
  ActivityType,
  InvitationStatus,
  NotificationType,
  WorkspaceRole,
} from "@prisma/client";

import { db } from "@/lib/db";
import { ensureWorkspaceAccess, toUserRole } from "@/lib/membership";
import { canAddTeamMember } from "@/lib/billing-limits";

import { createActivity } from "./activity.service";
import { createNotification } from "./notification.service";

export async function getTeam(workspaceId: string) {
  const [members, invitations] = await Promise.all([
    db.workspaceMember.findMany({
      where: {
        workspaceId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    }),

    db.workspaceInvitation.findMany({
      where: {
        workspaceId,
        status: InvitationStatus.PENDING,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  return {
    members,
    invitations,
  };
}

export async function createInvitation({
  workspaceId,
  email,
  role,
  actorId,
}: {
  workspaceId: string;
  email: string;
  role: WorkspaceRole;
  actorId: string;
}) {
  const normalizedEmail = email.trim().toLowerCase();

  const memberCount = await db.workspaceMember.count({
    where: { workspaceId },
  });

  const subscription = await db.subscription.findUnique({
    where: { workspaceId },
    select: { plan: true },
  });

  if (!(await canAddTeamMember(subscription?.plan ?? "FREE", memberCount))) {
    throw new Error("PLAN_LIMIT");
  }

  const existingUser = await db.user.findUnique({
    where: {
      email: normalizedEmail,
    },
    select: {
      id: true,
    },
  });

  if (existingUser) {
    const existingMember = await db.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: existingUser.id,
        },
      },
    });

    if (existingMember) {
      throw new Error("This user is already a member of the workspace.");
    }
  }

  const existingInvitation = await db.workspaceInvitation.findFirst({
    where: {
      workspaceId,
      email: normalizedEmail,
      status: InvitationStatus.PENDING,
    },
  });

  if (existingInvitation) {
    throw new Error("An invitation has already been sent to this email.");
  }

  const token = randomBytes(32).toString("hex");

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const invitation = await db.workspaceInvitation.create({
    data: {
      workspaceId,
      email: normalizedEmail,
      role,
      token,
      expiresAt,
    },
  });

  await createActivity({
    workspaceId,
    userId: actorId,
    type: ActivityType.USER_INVITED,
    title: "Team member invited",
    description: `${normalizedEmail} was invited to the workspace.`,
  });

  await createNotification(
    {
      userId: actorId,
      workspaceId,
      title: "Invitation sent",
      message: `${normalizedEmail} was invited to the workspace.`,
      type: NotificationType.SUCCESS,
    },
  );

  return invitation;
}

export async function cancelInvitation(
  workspaceId: string,
  invitationId: string,
) {
  return db.workspaceInvitation.updateMany({
    where: {
      id: invitationId,
      workspaceId,
      status: InvitationStatus.PENDING,
    },
    data: {
      status: InvitationStatus.CANCELLED,
    },
  });
}

export async function updateMemberRole(
  workspaceId: string,
  memberId: string,
  role: WorkspaceRole,
  actorId: string,
) {
  const member = await db.workspaceMember.findUnique({
    where: {
      id: memberId,
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  const result = await db.workspaceMember.updateMany({
    where: {
      id: memberId,
      workspaceId,
    },
    data: {
      role,
    },
  });

  if (result.count > 0 && member) {
    await db.membership.updateMany({
      where: {
        userId: member.userId,
        workspaceId,
      },
      data: {
        role: toUserRole(role),
      },
    });
    await createActivity({
      workspaceId,
      userId: actorId,
      type: ActivityType.ROLE_CHANGED,
      title: "Member role updated",
      description: `${member.user.name ?? "A team member"}'s role was changed to ${role}.`,
    });

    await createNotification(
      {
        userId: actorId,
        workspaceId,
        title: "Role updated",
        message: `${member.user.name ?? "A team member"}'s role was changed to ${role}.`,
        type: NotificationType.INFO,
      },
    );
  }

  return result;
}

export async function removeMember(
  workspaceId: string,
  memberId: string,
  actorId: string,
) {
  const member = await db.workspaceMember.findUnique({
    where: {
      id: memberId,
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  const result = await db.workspaceMember.deleteMany({
    where: {
      id: memberId,
      workspaceId,
      role: {
        not: WorkspaceRole.OWNER,
      },
    },
  });

  if (result.count > 0 && member) {
    await db.membership.deleteMany({
      where: {
        userId: member.userId,
        workspaceId,
      },
    });
    await createActivity({
      workspaceId,
      userId: actorId,
      type: ActivityType.USER_REMOVED,
      title: "Team member removed",
      description: `${member.user.name ?? "A team member"} was removed from the workspace.`,
    });

    await createNotification(
      {
        userId: actorId,
        workspaceId,
        title: "Member removed",
        message: `${member.user.name ?? "A team member"} was removed from the workspace.`,
        type: NotificationType.WARNING,
      },
    );
  }

  return result;
}

export async function acceptInvitation(
  token: string,
  userId: string,
  email: string,
) {
  const invitation = await db.workspaceInvitation.findUnique({
    where: { token },
  });

  if (!invitation || invitation.status !== InvitationStatus.PENDING) {
    throw new Error("Invalid invitation.");
  }

  if (invitation.expiresAt < new Date()) {
    await db.workspaceInvitation.update({
      where: { id: invitation.id },
      data: { status: InvitationStatus.EXPIRED },
    });
    throw new Error("This invitation has expired.");
  }

  if (invitation.email !== email.trim().toLowerCase()) {
    throw new Error("This invitation was sent to a different email address.");
  }

  await db.$transaction(async (tx) => {
    await ensureWorkspaceAccess(
      tx,
      userId,
      invitation.workspaceId,
      invitation.role,
    );

    await tx.workspaceInvitation.update({
      where: { id: invitation.id },
      data: { status: InvitationStatus.ACCEPTED },
    });
  });

  return invitation;
}
