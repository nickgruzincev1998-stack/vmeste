import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { grantXP, XP_REWARDS } from "@/lib/xp";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    // Support both `category` (slug) and `cat` (slug) params
    const categorySlag = searchParams.get("category") || searchParams.get("cat");
    const city   = searchParams.get("city");
    const q      = searchParams.get("q");
    const diff   = searchParams.get("diff");

    const activities = await db.activity.findMany({
      where: {
        status: "active",
        ...(categorySlag && { category: { slug: categorySlag } }),
        ...(city && { placeName: { contains: city, mode: "insensitive" } }),
        ...(q    && { title:     { contains: q,    mode: "insensitive" } }),
        ...(diff && { difficulty: diff }),
      },
      include: {
        creator: {
          select: { id: true, name: true, avatar: true, rating: true },
        },
        category: true,
        // First 3 participants for avatar stack
        participants: {
          take: 3,
          where: { status: "active" },
          include: { user: { select: { id: true, name: true, avatar: true } } },
        },
        _count: {
          select: { participants: { where: { status: "active" } } },
        },
      },
      orderBy: { date: "asc" }, // nearest first
      take: 100,
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error("[GET /api/activities]", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const user = await db.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }

    const body = await req.json();
    const { title, description, categoryId, date, placeName, lat, lng, difficulty, maxParticipants } = body;

    if (!title || !categoryId || !date || !placeName) {
      return NextResponse.json({ error: "Заполните все обязательные поля" }, { status: 400 });
    }

    const activity = await db.activity.create({
      data: {
        title,
        description,
        categoryId,
        creatorId: user.id,
        date: new Date(date),
        placeName,
        lat,
        lng,
        difficulty: difficulty ?? "beginner",
        maxParticipants: maxParticipants ?? 10,
      },
    });

    // +30 XP за создание события
    // +20 XP если первое событие в этой категории
    const prevInCategory = await db.activity.count({
      where: { creatorId: user.id, categoryId, id: { not: activity.id } },
    });

    await grantXP(user.id, XP_REWARDS.CREATE_ACTIVITY + (prevInCategory === 0 ? XP_REWARDS.NEW_CATEGORY : 0));

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error("[POST /api/activities]", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
