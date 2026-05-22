import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/activities/[id] — получить одно событие
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const activity = await prisma.activity.findUnique({
      where: { id: params.id },
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

// POST /api/activities/[id] — вступить / покинуть событие
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }

    const activity = await prisma.activity.findUnique({
      where: { id: params.id },
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

    // Проверяем — уже участвует?
    const existing = await prisma.participation.findUnique({
      where: { userId_activityId: { userId: user.id, activityId: params.id } },
    });

    if (existing) {
      // Если уже участвует — выходим
      await prisma.participation.update({
        where: { userId_activityId: { userId: user.id, activityId: params.id } },
        data: { status: "left" },
      });
      return NextResponse.json({ joined: false, message: "Вы покинули событие" });
    }

    // Проверяем лимит участников
    if (activity._count.participants >= activity.maxParticipants) {
      return NextResponse.json({ error: "Событие заполнено" }, { status: 400 });
    }

    // Вступаем
    await prisma.participation.upsert({
      where: { userId_activityId: { userId: user.id, activityId: params.id } },
      update: { status: "active" },
      create: { userId: user.id, activityId: params.id, status: "active" },
    });

    return NextResponse.json({ joined: true, message: "Вы вступили в событие" });
  } catch (error) {
    console.error("[POST /api/activities/id]", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

// DELETE /api/activities/[id] — удалить событие (только создатель)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }

    const activity = await prisma.activity.findUnique({
      where: { id: params.id },
    });

    if (!activity) {
      return NextResponse.json({ error: "Событие не найдено" }, { status: 404 });
    }

    if (activity.creatorId !== user.id) {
      return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
    }

    // Удаляем связанные данные, затем само событие
    await prisma.$transaction([
      prisma.participation.deleteMany({ where: { activityId: params.id } }),
      prisma.message.deleteMany({ where: { activityId: params.id } }),
      prisma.activity.delete({ where: { id: params.id } }),
    ]);

    return NextResponse.json({ success: true, message: "Событие удалено" });
  } catch (error) {
    console.error("[DELETE /api/activities/id]", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}