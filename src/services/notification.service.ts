import {
  NotificationType,
} from "@prisma/client";

import { db } from "@/lib/db";

type CreateNotificationInput = {
  userId: string;
  workspaceId?: string;
  title: string;
  message: string;
  type?: NotificationType;
  link?: string;
};

export async function createNotification(
  input: CreateNotificationInput,
) {
  return db.notification.create({
    data: {
      userId: input.userId,
      workspaceId: input.workspaceId,
      title: input.title,
      message: input.message,
      type: input.type ?? NotificationType.INFO,
      link: input.link,
    },
  });
}

export async function getNotifications(
  userId: string,
  workspaceId?: string,
) {
  return db.notification.findMany({
    where: {
      userId,
      ...(workspaceId
        ? { workspaceId }
        : {}),
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
  });
}

export async function getUnreadCount(
  userId: string,
  workspaceId?: string,
) {
  return db.notification.count({
    where: {
      userId,
      isRead: false,
      ...(workspaceId
        ? { workspaceId }
        : {}),
    },
  });
}

export async function markNotificationRead(
  notificationId: string,
  userId: string,
  workspaceId?: string,
) {
  return db.notification.updateMany({
    where: {
      id: notificationId,
      userId,
      ...(workspaceId ? { workspaceId } : {}),
    },
    data: {
      isRead: true,
    },
  });
}

export async function markAllNotificationsRead(
  userId: string,
  workspaceId?: string,
) {
  return db.notification.updateMany({
    where: {
      userId,
      isRead: false,
      ...(workspaceId
        ? { workspaceId }
        : {}),
    },
    data: {
      isRead: true,
    },
  });
}
