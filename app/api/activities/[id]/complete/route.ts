import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const user = await db.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }

    const activity = await db.activity.findUnique({
      where: { id },
      include: {
        participants: {
          where: { status: "active" },
          include: { user: { select: { id: true, name: true, avatar: true } } },
        },
      },
    });

    if (!activity) {
      return NextResponse.json({ error: "Событие не найдено" }, { status: 404 });
    }

    if (activity.creatorId !== user.id) {
      return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
    }

    if (activity.status === "completed") {
      return NextResponse.json({ error: "Событие уже завершено" }, { status: 400 });
    }

    const updated = await db.activity.update({
      where: { id },
      data: { status: "completed" },
    });

    return NextResponse.json({ success: true, activity: updated });
  } catch (error) {
    console.error("[PATCH /api/activities/id/complete]", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}