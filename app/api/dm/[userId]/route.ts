import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { pusherServer } from "@/lib/pusher-server";
import { createNotification } from "@/lib/notifications";
import { NextResponse } from "next/server";

function dmChannel(a: string, b: string) {
  return `dm-${[a, b].sort().join("-")}`;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

    const me = await db.user.findUnique({ where: { clerkId }, select: { id: true } });
    if (!me) return NextResponse.json({ error: "Не найден" }, { status: 404 });

    const [areFriends, messages] = await Promise.all([
      db.friendship.findFirst({
        where: {
          status: "accepted",
          OR: [
            { requesterId: me.id, addresseeId: userId },
            { requesterId: userId, addresseeId: me.id },
          ],
        },
        select: { id: true },
      }),
      db.directMessage.findMany({
        where: {
          OR: [
            { senderId: me.id, receiverId: userId },
            { senderId: userId, receiverId: me.id },
          ],
        },
        include: { sender: { select: { id: true, name: true, avatar: true } } },
        orderBy: { sentAt: "asc" },
        take: 100,
      }),
    ]);

    if (!areFriends) {
      return NextResponse.json({ error: "Только друзья могут переписываться" }, { status: 403 });
    }

    // Пометить входящие прочитанными — не блокируем ответ
    db.directMessage.updateMany({
      where: { senderId: userId, receiverId: me.id, read: false },
      data: { read: true },
    }).catch(() => {});

    return NextResponse.json(messages);
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

    const { content } = await req.json();
    if (!content?.trim()) {
      return NextResponse.json({ error: "Пустое сообщение" }, { status: 400 });
    }

    const me = await db.user.findUnique({
      where: { clerkId },
      select: { id: true, name: true },
    });
    if (!me) return NextResponse.json({ error: "Не найден" }, { status: 404 });

    // Проверка дружбы + создание сообщения параллельно
    const [areFriends, message] = await Promise.all([
      db.friendship.findFirst({
        where: {
          status: "accepted",
          OR: [
            { requesterId: me.id, addresseeId: userId },
            { requesterId: userId, addresseeId: me.id },
          ],
        },
        select: { id: true },
      }),
      db.directMessage.create({
        data: { senderId: me.id, receiverId: userId, content: content.trim() },
        include: { sender: { select: { id: true, name: true, avatar: true } } },
      }),
    ]);

    if (!areFriends) {
      return NextResponse.json({ error: "Только друзья могут переписываться" }, { status: 403 });
    }

    // Pusher + уведомление — не блокируют ответ
    const payload = {
      id: message.id,
      content: message.content,
      sentAt: message.sentAt,
      read: message.read,
      sender: message.sender,
    };

    Promise.all([
      pusherServer.trigger(dmChannel(me.id, userId), "new-dm", payload),
      createNotification(
        userId,
        "new_dm",
        `Новое сообщение от ${me.name}`,
        message.content.length > 60 ? message.content.slice(0, 60) + "…" : message.content
      ),
    ]).catch(console.error);

    return NextResponse.json(message);
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
