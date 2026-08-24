import { cookies } from "next/headers";

import { db } from "@/lib/db";

const WORKSPACE_COOKIE = "active_workspace_id";

export async function getActiveWorkspaceId() {
  const cookieStore = await cookies();

  return cookieStore.get(WORKSPACE_COOKIE)?.value;
}

export async function setActiveWorkspaceId(
  workspaceId: string,
) {
  const cookieStore = await cookies();

  cookieStore.set(WORKSPACE_COOKIE, workspaceId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearActiveWorkspace() {
  const cookieStore = await cookies();

  cookieStore.delete(WORKSPACE_COOKIE);
}

export async function getUserWorkspaces(
  userId: string,
) {
  return db.membership.findMany({
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