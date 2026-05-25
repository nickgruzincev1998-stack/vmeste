import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkId },
      select: { id: true, telegramChatId: true },
    });
    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }

    const botUsername = process.env.TELEGRAM_BOT_USERNAME;
    if (!botUsername) {
      return NextResponse.json({ error: "Бот не настроен" }, { status: 500 });
    }

    // Deep-link: t.me/BOT?start=USER_DB_ID
    const url = `https://t.me/${botUsername}?start=${user.id}`;

    return NextResponse.json({
      url,
      connected: !!user.telegramChatId,
    });
  } catch (err) {
    console.error("[GET /api/telegram/connect]", err);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
