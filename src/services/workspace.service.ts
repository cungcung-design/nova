import { db } from "@/lib/db";

export async function getUserWorkspaces(userId: string) {
  return db.workspace.findMany({
    where: {
      memberships: {
        some: {
          userId,
        },
      },
    },
    include: {
      memberships: {
        where: {
          userId,
        },
        select: {
          role: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

export async function getWorkspaceForUser(
  userId: string,
  workspaceId: string,
) {
  return db.workspace.findFirst({
    where: {
      id: workspaceId,
      memberships: {
        some: {
          userId,
        },
      },
    },
    include: {
      memberships: {
        where: {
          userId,
        },
        select: {
          role: true,
        },
      },
    },
  });
}
