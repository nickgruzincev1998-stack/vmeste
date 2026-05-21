import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("cat");
    const difficulty = searchParams.get("diff");
    const search = searchParams.get("q");

    const activities = await db.activity.findMany({
      where: {
        status: "active",
        ...(category && { category: { slug: category } }),
        ...(difficulty && { difficulty }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { placeName: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      include: {
        category: true,
        creator: true,
        _count: { select: { participants: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(activities);
  } catch (error) {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, categoryId, date, time, placeName, maxParticipants, difficulty } = body;

    const user = await db.user.findUnique({ where: { clerkId: clerkUser.id } });
    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }

    const activity = await db.activity.create({
      data: {
        title,
        description: description || "",
        categoryId,
        creatorId: user.id,
        date: new Date(`${date}T${time || "12:00"}`),
        placeName,
        maxParticipants: Number(maxParticipants),
        difficulty,
      },
      include: {
        category: true,
        creator: true,
      },
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}