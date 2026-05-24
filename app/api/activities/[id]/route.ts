import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createNotification } from "@/lib/notifications";

// GET /api/activities/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const activity = await db.activity.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            rating: true,
            level: true,
            city: true,
          },
        },
        category: true,
        participants: {
          where: { status: "active" },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                name: true,
                avatar: true,
                level: true,
              },
            },
          },
        },
        _count: {
          select: { participants: { where: { status: "active" } } },
        },
      },
    });

    if (!activity) {
      return NextResponse.json({ error: "Событие не найдено" }, { status: 404 });
    }

    return NextResponse.json(activity);
  } catch (error) {
    console.error("[GET /api/activities/id]", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

// POST /api/activities/[id] — вступить / покинуть
export async function POST(
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
        _count: { select: { participants: { where: { status: "active" } } } },
      },
    });

    if (!activity) {
      return NextResponse.json({ error: "Событие не найдено" }, { status: 404 });
    }

    if (activity.status !== "active") {
      return NextResponse.json({ error: "Событие недоступно" }, { status: 400 });
    }

    const existing = await db.participation.findUnique({
      where: { userId_activityId: { userId: user.id, activityId: id } },
    });

    // Если уже активный участник — выходим
    if (existing && existing.status === "active") {
      await db.participation.update({
        where: { userId_activityId: { userId: user.id, activityId: id } },
        data: { status: "left" },
      });
      return NextResponse.json({ joined: false, message: "Вы покинули событие" });
    }

    // Проверяем лимит
    if (activity._count.participants >= activity.maxParticipants) {
      return NextResponse.json({ error: "Событие заполнено" }, { status: 400 });
    }

    // Вступаем или возвращаемся
    await db.participation.upsert({
      where: { userId_activityId: { userId: user.id, activityId: id } },
      update: { status: "active" },
      create: { userId: user.id, activityId: id, status: "active" },
    });

    await createNotification(
      activity.creatorId,
      "new_participant",
      "Новый участник!",
      `${user.name} записался на «${activity.title}»`
    );

    return NextResponse.json({ joined: true, message: "Вы вступили в событие" });
  } catch (error) {
    console.error("[POST /api/activities/id]", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

// DELETE /api/activities/[id] — удалить (только создатель)
export async function DELETE(
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
    });

    if (!activity) {
      return NextResponse.json({ error: "Событие не найдено" }, { status: 404 });
    }

    if (activity.creatorId !== user.id) {
      return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
    }

    await db.$transaction([
      db.participation.deleteMany({ where: { activityId: id } }),
      db.message.deleteMany({ where: { activityId: id } }),
      db.activity.delete({ where: { id } }),
    ]);

    return NextResponse.json({ success: true, message: "Событие удалено" });
  } catch (error) {
    console.error("[DELETE /api/activities/id]", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}