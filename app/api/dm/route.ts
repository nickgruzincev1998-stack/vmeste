import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

    const me = await db.user.findUnique({ where: { clerkId: clerkUser.id } });
    if (!me) return NextResponse.json({ error: "Не найден" }, { status: 404 });

    const messages = await db.directMessage.findMany({
      where: { OR: [{ senderId: me.id }, { receiverId: me.id }] },
      include: {
        sender:   { select: { id: true, username: true, name: true, avatar: true } },
        receiver: { select: { id: true, username: true, name: true, avatar: true } },
      },
      orderBy: { sentAt: "desc" },
    });

    // Group by conversation partner, keep latest message
    const conversationMap = new Map<string, any>();
    for (const msg of messages) {
      const partner = msg.senderId === me.id ? msg.receiver : msg.sender;
      if (!conversationMap.has(partner.id)) {
        const unreadCount = messages.filter(
          (m) => m.senderId === partner.id && m.receiverId === me.id && !m.read
        ).length;
        conversationMap.set(partner.id, {
          partner,
          lastMessage: msg,
          unreadCount,
        });
      }
    }

    return NextResponse.json(Array.from(conversationMap.values()));
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
