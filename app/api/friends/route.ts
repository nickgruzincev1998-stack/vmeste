import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createNotification } from "@/lib/notifications";

export async function GET() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

    const me = await db.user.findUnique({ where: { clerkId: clerkUser.id } });
    if (!me) return NextResponse.json({ error: "Не найден" }, { status: 404 });

    const friendships = await db.friendship.findMany({
      where: {
        status: "accepted",
        OR: [{ requesterId: me.id }, { addresseeId: me.id }],
      },
      include: {
        requester: { select: { id: true, username: true, name: true, avatar: true, city: true } },
        addressee: { select: { id: true, username: true, name: true, avatar: true, city: true } },
      },
    });

    const friends = friendships.map((f) =>
      f.requesterId === me.id ? f.addressee : f.requester
    );

    return NextResponse.json(friends);
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

    const me = await db.user.findUnique({ where: { clerkId: clerkUser.id } });
    if (!me) return NextResponse.json({ error: "Не найден" }, { status: 404 });

    const { toUserId } = await req.json();
    if (!toUserId || toUserId === me.id) {
      return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
    }

    const existing = await db.friendship.findFirst({
      where: {
        OR: [
          { requesterId: me.id, addresseeId: toUserId },
          { requesterId: toUserId, addresseeId: me.id },
        ],
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Заявка уже существует" }, { status: 409 });
    }

    const friendship = await db.friendship.create({
      data: { requesterId: me.id, addresseeId: toUserId },
    });

    await createNotification(
      toUserId,
      "friend_request",
      "Новый запрос в друзья",
      `${me.name} хочет добавить тебя в друзья`
    );

    return NextResponse.json(friendship);
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
