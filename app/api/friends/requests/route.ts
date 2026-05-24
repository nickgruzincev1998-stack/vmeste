import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

    const me = await db.user.findUnique({ where: { clerkId: clerkUser.id } });
    if (!me) return NextResponse.json({ error: "Не найден" }, { status: 404 });

    const requests = await db.friendship.findMany({
      where: { addresseeId: me.id, status: "pending" },
      include: {
        requester: { select: { id: true, username: true, name: true, avatar: true, city: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(requests);
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
