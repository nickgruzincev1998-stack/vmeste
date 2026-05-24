import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { pusherServer } from "@/lib/pusher-server";
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
    const clerkUser = await currentUser();
    if (!clerkUser) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

    const me = await db.user.findUnique({ where: { clerkId: clerkUser.id } });
    if (!me) return NextResponse.json({ error: "Не найден" }, { status: 404 });

    const areFriends = await db.friendship.findFirst({
      where: {
        status: "accepted",
        OR: [
          { requesterId: me.id, addresseeId: userId },
          { requesterId: userId, addresseeId: me.id },
        ],
      },
    });
    if (!areFriends) {
      return NextResponse.json({ error: "Только друзья могут переписываться" }, { status: 403 });
    }

    const messages = await db.directMessage.findMany({
      where: {
        OR: [
          { senderId: me.id, receiverId: userId },
          { senderId: userId, receiverId: me.id },
        ],
      },
      include: { sender: { select: { id: true, name: true, avatar: true } } },
      orderBy: { sentAt: "asc" },
      take: 100,
    });

    // Mark received messages as read
    await db.directMessage.updateMany({
      where: { senderId: userId, receiverId: me.id, read: false },
      data: { read: true },
    });

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
    const clerkUser = await currentUser();
    if (!clerkUser) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

    const me = await db.user.findUnique({ where: { clerkId: clerkUser.id } });
    if (!me) return NextResponse.json({ error: "Не найден" }, { status: 404 });

    const areFriends = await db.friendship.findFirst({
      where: {
        status: "accepted",
        OR: [
          { requesterId: me.id, addresseeId: userId },
          { requesterId: userId, addresseeId: me.id },
        ],
      },
    });
    if (!areFriends) {
      return NextResponse.json({ error: "Только друзья могут переписываться" }, { status: 403 });
    }

    const { content } = await req.json();
    if (!content?.trim()) {
      return NextResponse.json({ error: "Пустое сообщение" }, { status: 400 });
    }

    const message = await db.directMessage.create({
      data: { senderId: me.id, receiverId: userId, content: content.trim() },
      include: { sender: { select: { id: true, name: true, avatar: true } } },
    });

    await pusherServer.trigger(dmChannel(me.id, userId), "new-dm", {
      id: message.id,
      content: message.content,
      sentAt: message.sentAt,
      read: message.read,
      sender: message.sender,
    });

    return NextResponse.json(message);
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
