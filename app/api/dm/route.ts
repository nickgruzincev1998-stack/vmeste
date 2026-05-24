import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

    const me = await db.user.findUnique({ where: { clerkId }, select: { id: true } });
    if (!me) return NextResponse.json({ error: "Не найден" }, { status: 404 });

    const messages = await db.directMessage.findMany({
      where: { OR: [{ senderId: me.id }, { receiverId: me.id }] },
      include: {
        sender:   { select: { id: true, username: true, name: true, avatar: true } },
        receiver: { select: { id: true, username: true, name: true, avatar: true } },
      },
      orderBy: { sentAt: "desc" },
      take: 200,
    });

    const conversationMap = new Map<string, any>();
    for (const msg of messages) {
      const partner = msg.senderId === me.id ? msg.receiver : msg.sender;
      if (!conversationMap.has(partner.id)) {
        conversationMap.set(partner.id, { partner, lastMessage: msg, unreadCount: 0 });
      }
      if (msg.senderId !== me.id && !msg.read) {
        conversationMap.get(partner.id).unreadCount++;
      }
    }

    return NextResponse.json(Array.from(conversationMap.values()));
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
