import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const clerkUser = await currentUser();
    if (!clerkUser) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

    const me = await db.user.findUnique({ where: { clerkId: clerkUser.id } });
    if (!me) return NextResponse.json({ error: "Не найден" }, { status: 404 });

    const { action } = await req.json();
    if (!["accept", "reject"].includes(action)) {
      return NextResponse.json({ error: "Некорректное действие" }, { status: 400 });
    }

    const friendship = await db.friendship.findUnique({ where: { id } });
    if (!friendship || friendship.addresseeId !== me.id) {
      return NextResponse.json({ error: "Не найдено" }, { status: 404 });
    }

    const updated = await db.friendship.update({
      where: { id },
      data: { status: action === "accept" ? "accepted" : "rejected" },
    });

    if (action === "accept") {
      await db.notification.create({
        data: {
          userId: friendship.requesterId,
          type: "friend_accepted",
          title: "Запрос принят",
          body: `${me.name} принял(а) твой запрос в друзья`,
        },
      });
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const clerkUser = await currentUser();
    if (!clerkUser) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

    const me = await db.user.findUnique({ where: { clerkId: clerkUser.id } });
    if (!me) return NextResponse.json({ error: "Не найден" }, { status: 404 });

    const friendship = await db.friendship.findUnique({ where: { id } });
    if (!friendship || (friendship.requesterId !== me.id && friendship.addresseeId !== me.id)) {
      return NextResponse.json({ error: "Не найдено" }, { status: 404 });
    }

    await db.friendship.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
