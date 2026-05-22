import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const activity = await db.activity.findUnique({
      where: { id },
      include: {
        category: true,
        creator: true,
        _count: { select: { participants: true } },
      },
    });

    if (!activity) {
      return NextResponse.json({ error: "Не найдено" }, { status: 404 });
    }

    return NextResponse.json(activity);
  } catch (error) {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const user = await db.user.findUnique({ where: { clerkId: clerkUser.id } });
    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }

    const activity = await db.activity.findUnique({
      where: { id },
      include: { creator: true, _count: { select: { participants: true } } },
    });

    if (!activity) {
      return NextResponse.json({ error: "Событие не найдено" }, { status: 404 });
    }

    const existing = await db.participation.findUnique({
      where: { userId_activityId: { userId: user.id, activityId: id } },
    });

    if (existing) {
      return NextResponse.json({ error: "Уже записан" }, { status: 400 });
    }

    if (activity._count.participants >= activity.maxParticipants) {
      return NextResponse.json({ error: "Мест нет" }, { status: 400 });
    }

    await db.participation.create({
      data: { userId: user.id, activityId: id },
    });

    if (activity.creatorId !== user.id) {
      await db.notification.create({
        data: {
          userId: activity.creatorId,
          type: "join",
          title: "Новый участник!",
          body: `${user.name} записался на твоё событие «${activity.title}»`,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
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
    if (!clerkUser) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const user = await db.user.findUnique({ where: { clerkId: clerkUser.id } });
    if (!user) {
      return NextResponse.json({ error: "Не найден" }, { status: 404 });
    }

    await db.participation.delete({
      where: { userId_activityId: { userId: user.id, activityId: id } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}