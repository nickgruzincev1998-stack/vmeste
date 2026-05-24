import { db } from "./db";
import { pusherServer } from "./pusher-server";

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  body: string
) {
  const notification = await db.notification.create({
    data: { userId, type, title, body },
  });

  await pusherServer.trigger(`notifications-${userId}`, "new-notification", {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    read: false,
    createdAt: notification.createdAt,
  });

  return notification;
}
