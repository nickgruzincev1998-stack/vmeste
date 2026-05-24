import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Single endpoint that returns friends + conversations + requests in one shot
export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

    const me = await db.user.findUnique({
      where: { clerkId },
      select: { id: true, username: true, name: true, avatar: true },
    });
    if (!me) return NextResponse.json({ error: "Не найден" }, { status: 404 });

    // All three DB queries in parallel
    const [friendships, recentMessages, pendingRequests] = await Promise.all([
      db.friendship.findMany({
        where: { status: "accepted", OR: [{ requesterId: me.id }, { addresseeId: me.id }] },
        include: {
          requester: { select: { id: true, username: true, name: true, avatar: true, city: true } },
          addressee: { select: { id: true, username: true, name: true, avatar: true, city: true } },
        },
      }),
      db.directMessage.findMany({
        where: { OR: [{ senderId: me.id }, { receiverId: me.id }] },
        orderBy: { sentAt: "desc" },
        take: 200,
        include: {
          sender:   { select: { id: true, username: true, name: true, avatar: true } },
          receiver: { select: { id: true, username: true, name: true, avatar: true } },
        },
      }),
      db.friendship.findMany({
        where: { addresseeId: me.id, status: "pending" },
        include: {
          requester: { select: { id: true, username: true, name: true, avatar: true, city: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // Map friends
    const friends = friendships.map((f) =>
      f.requesterId === me.id ? f.addressee : f.requester
    );

    // Group messages into conversations (O(n), n≤200)
    const convMap = new Map<string, { partner: any; lastMessage: any; unreadCount: number }>();
    for (const msg of recentMessages) {
      const partner = msg.senderId === me.id ? msg.receiver : msg.sender;
      if (!convMap.has(partner.id)) {
        convMap.set(partner.id, { partner, lastMessage: msg, unreadCount: 0 });
      }
      // Count unread from partner
      if (msg.senderId !== me.id && !msg.read) {
        convMap.get(partner.id)!.unreadCount++;
      }
    }
    const conversations = Array.from(convMap.values());

    return NextResponse.json({ me, friends, conversations, requests: pendingRequests });
  } catch (error) {
    console.error("[GET /api/messages/init]", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
