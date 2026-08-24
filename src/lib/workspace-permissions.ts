import { db } from "@/lib/db";

import { WorkspaceRole } from "@prisma/client";

const roleRank: Record<WorkspaceRole, number> = {
  OWNER: 3,
  ADMIN: 2,
  MEMBER: 1,
};

export async function getWorkspaceMember(
  workspaceId: string,
  userId: string,
) {
  return db.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  });
}

export async function requireWorkspaceRole(
  workspaceId: string,
  userId: string,
  requiredRole: WorkspaceRole,
) {
  const member = await getWorkspaceMember(workspaceId, userId);

  if (!member) {
    throw new Error("Workspace membership required.");
  }

  if (roleRank[member.role] < roleRank[requiredRole]) {
    throw new Error("Insufficient workspace permissions.");
  }

  return member;
}
