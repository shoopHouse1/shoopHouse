import { prisma } from '../lib/prisma';

export interface NotificationData {
  userId: string;
  title: string;
  message: string;
  type: string;
}

export async function createNotification(data: NotificationData): Promise<void> {
  await prisma.notification.create({
    data: {
      userId: data.userId,
      title: data.title,
      message: data.message,
      type: data.type,
    },
  });
}

export async function getUserNotifications(userId: string) {
  return await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function markNotificationAsRead(notificationId: string, userId: string) {
  await prisma.notification.update({
    where: { id: notificationId, userId },
    data: { read: true },
  });
}

export async function markAllNotificationsAsRead(userId: string) {
  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}