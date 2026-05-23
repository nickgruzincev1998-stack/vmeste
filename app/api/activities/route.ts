import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/activities — получить список событий
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const city = searchParams.get("city");

    const activities = await db.activity.findMany({
      where: {
        status: "active",
        ...(category && { category: { slug: category } }),
        ...(city && { placeName: { contains: city, mode: "insensitive" } }),
      },
      include: {
        creator: {
          select: { id: true, name: true, avatar: true, rating: true },
        },
        category: true,
        _count: {
          select: { participants: { where: { status: "active" } } },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error("[GET /api/activities]", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

// POST /api/activities — создать событие
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

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error("[POST /api/activities]", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}