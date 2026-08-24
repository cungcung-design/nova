import { AuditAction, type Prisma } from "@prisma/client";

import { db } from "@/lib/db";

type CreateAuditLogInput = {
  workspaceId?: string;

  userId?: string;

  action: AuditAction;

  entity?: string;

  entityId?: string;

  description?: string;

  metadata?: unknown;

  ipAddress?: string;

  userAgent?: string;
};

export async function createAuditLog(
  input: CreateAuditLogInput,
) {
  return db.auditLog.create({
    data: {
      workspaceId:
        input.workspaceId,

      userId:
        input.userId,

      action:
        input.action,

      entity:
        input.entity,

      entityId:
        input.entityId,

      description:
        input.description,

      metadata:
        input.metadata as Prisma.InputJsonValue | undefined,

      ipAddress:
        input.ipAddress,

      userAgent:
        input.userAgent,
    },
  });
}

export async function getAuditLogs(
  workspaceId: string,
  options?: {
    action?: AuditAction;

    search?: string;

    page?: number;

    limit?: number;
  },
) {
  const page =
    options?.page ?? 1;

  const limit =
    options?.limit ?? 25;

  const skip =
    (page - 1) * limit;

  const where = {
    workspaceId,

    ...(options?.action
      ? {
          action:
            options.action,
        }
      : {}),

    ...(options?.search
      ? {
          OR: [
            {
              description: {
                contains:
                  options.search,
                mode: "insensitive" as const,
              },
            },
            {
              entity: {
                contains:
                  options.search,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),
  };

  const [logs, total] =
    await Promise.all([
      db.auditLog.findMany({
        where,

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
          createdAt: "desc",
        },

        skip,

        take: limit,
      }),

      db.auditLog.count({
        where,
      }),
    ]);

  return {
    logs,

    total,

    page,

    limit,

    totalPages: Math.ceil(
      total / limit,
    ),
  };
}