import { db } from "@/lib/db";

import {
  getActiveWorkspaceId,
} from "@/lib/workspace-context";

import { requireUser } from "@/lib/authz";

const DEV_USER_EMAIL = "john@nova.dev";

export async function getCurrentWorkspace() {
  let user;
  let userId;

  try {
    user = await requireUser();
    userId = user.id;
  } catch {
    const devUser = await db.user.findUnique({
      where: { email: DEV_USER_EMAIL },
    });

    if (!devUser) {
      throw new Error("NO_WORKSPACE");
    }

    userId = devUser.id;
  }

  const activeWorkspaceId =
    await getActiveWorkspaceId();

  let membership;

  if (activeWorkspaceId) {
    membership = await db.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId: activeWorkspaceId,
        },
      },

      include: {
        workspace: true,
      },
    });
  }

  if (!membership) {
    membership = await db.membership.findFirst({
      where: {
        userId,
      },

      include: {
        workspace: true,
      },

      orderBy: {
        createdAt: "asc",
      },
    });
  }

  if (!membership) {
    throw new Error("NO_WORKSPACE");
  }

  return {
    ...membership.workspace,

    userId,

    role: membership.role,
  };
}
