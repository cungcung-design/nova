import {
  ActivityType,
} from "@prisma/client";

import { db } from "@/lib/db";

type CreateActivityInput = {
  workspaceId: string;
  userId?: string;
  type: ActivityType;
  title: string;
  description?: string;
  metadata?: unknown;
};

export async function createActivity(
  input: CreateActivityInput,
) {
  return db.activity.create({
    data: {
      workspaceId: input.workspaceId,
      userId: input.userId,
      type: input.type,
      title: input.title,
      description: input.description,
      metadata: input.metadata as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    },
  });
}

export async function getActivities(workspaceId: string) {
  return db.activity.findMany({
    where: {
      workspaceId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
  });
}
