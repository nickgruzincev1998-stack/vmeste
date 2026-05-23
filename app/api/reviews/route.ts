import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

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

    const { revieweeId, activityId, rating, comment } = await req.json();

    if (!revieweeId || !activityId || !rating) {
      return NextResponse.json({ error: "Заполните все поля" }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Рейтинг от 1 до 5" }, { status: 400 });
    }

    if (revieweeId === user.id) {
      return NextResponse.json({ error: "Нельзя оценить себя" }, { status: 400 });
    }

    // Проверяем что оба были участниками
    const activity = await db.activity.findUnique({
      where: { id: activityId },
      include: {
        participants: { where: { status: "active" } },
      },
    });

    if (!activity || activity.status !== "completed") {
      return NextResponse.json({ error: "Событие не завершено" }, { status: 400 });
    }

    // Проверяем что отзыв ещё не оставлен
    const existing = await db.review.findFirst({
      where: { reviewerId: user.id, revieweeId, },
    });

    if (existing) {
      return NextResponse.json({ error: "Отзыв уже оставлен" }, { status: 400 });
    }

    // Создаём отзыв
    const review = await db.review.create({
      data: {
        reviewerId: user.id,
        revieweeId,
        rating,
        comment: comment?.trim() || null,
      },
    });

    // Обновляем рейтинг пользователя
    const allReviews = await db.review.findMany({
      where: { revieweeId },
      select: { rating: true },
    });

    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await db.user.update({
      where: { id: revieweeId },
      data: { rating: Math.round(avgRating * 10) / 10 },
    });

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error("[POST /api/reviews]", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}