import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendTelegramMessage, fmtDate } from "@/lib/telegram";

const SITE_URL = "https://vmeste-tau.vercel.app";

export async function GET(req: NextRequest) {
  // Vercel cron защищён заголовком Authorization: Bearer CRON_SECRET
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Forbidden" }, { status: 401 });
  }

  try {
    const now  = new Date();
    const from = new Date(now.getTime() + 20 * 60_000); // +20 мин
    const to   = new Date(now.getTime() + 35 * 60_000); // +35 мин

    // Найти активные события начинающиеся в диапазоне 20-35 минут
    const activities = await db.activity.findMany({
      where: {
        status: "active",
        date: { gte: from, lte: to },
      },
      include: {
        participants: {
          where: { status: "active" },
          include: {
            user: { select: { telegramChatId: true } },
          },
        },
      },
    });

    let sent = 0;
    for (const activity of activities) {
      const text =
`⚡ <b>Скоро старт!</b>

⚽ <b>${activity.title}</b> начинается через ~30 минут
📍 ${activity.placeName}

Не опаздывай! 🔥
${SITE_URL}/activities/${activity.id}`;

      for (const p of activity.participants) {
        const chatId = p.user.telegramChatId;
        if (chatId) {
          await sendTelegramMessage(chatId, text);
          sent++;
        }
      }
    }

    return NextResponse.json({
      ok: true,
      checked: activities.length,
      sent,
    });
  } catch (err) {
    console.error("[cron/reminders]", err);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
