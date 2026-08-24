import {
  UserRole,
  WorkspaceRole,
  type Prisma,
} from "@prisma/client";

export function toUserRole(role: WorkspaceRole): UserRole {
  if (role === WorkspaceRole.OWNER) {
    return UserRole.OWNER;
  }

  if (role === WorkspaceRole.ADMIN) {
    return UserRole.ADMIN;
  }

  return UserRole.MEMBER;
}

export async function ensureWorkspaceAccess(
  tx: Prisma.TransactionClient,
  userId: string,
  workspaceId: string,
  role: WorkspaceRole,
) {
  const userRole = toUserRole(role);

  await tx.membership.upsert({
    where: {
      userId_workspaceId: {
        userId,
        workspaceId,
      },
    },
    create: {
      userId,
      workspaceId,
      role: userRole,
    },
    update: {
      role: userRole,
    },
  });

  await tx.workspaceMember.upsert({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
    create: {
      userId,
      workspaceId,
      role,
    },
    update: {
      role,
    },
  });
}
