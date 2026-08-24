import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";

const DEV_USER_EMAIL = "john@nova.dev";

export async function requireUser() {
  const session = await getServerSession(authOptions);

  const userId = session?.user?.id;

  if (!userId) {
    const devUser = await db.user.findUnique({
      where: { email: DEV_USER_EMAIL },
    });

    if (!devUser) {
      throw new Error("UNAUTHORIZED");
    }

    return {
      id: devUser.id,
      email: devUser.email,
      name: devUser.name,
      image: devUser.image,
    };
  }

  return { ...session.user, id: userId };
}

export async function requireWorkspaceMember(
  workspaceId: string,
) {
  const user = await requireUser();

  const membership = await db.membership.findUnique({
    where: {
      userId_workspaceId: {
        userId: user.id,
        workspaceId,
      },
    },
    include: {
      workspace: true,
    },
  });

  if (!membership) {
    throw new Error("FORBIDDEN");
  }

  return membership;
}

export async function requireRole(
  workspaceId: string,
  allowedRoles: UserRole[],
) {
  const membership =
    await requireWorkspaceMember(workspaceId);

  if (!allowedRoles.includes(membership.role)) {
    throw new Error("FORBIDDEN");
  }

  return membership;
}
