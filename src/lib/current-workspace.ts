import { db } from "@/lib/db";
import { getActiveWorkspaceId } from "@/lib/workspace-context";
import { requireUser } from "@/lib/authz";

export async function getCurrentWorkspace() {
  const user = await requireUser();
  const userId = user.id;

  const activeWorkspaceId = await getActiveWorkspaceId();

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
