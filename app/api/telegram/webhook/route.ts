import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendTelegramMessage } from "@/lib/telegram";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Telegram sends updates as { message: { ... } }
    const message = body?.message;
    if (!message) return NextResponse.json({ ok: true });

    const chatId  = String(message.chat?.id ?? "");
    const text    = (message.text ?? "") as string;

    // Обрабатываем только /start USER_DB_ID
    if (!text.startsWith("/start")) {
      return NextResponse.json({ ok: true });
    }

    const parts  = text.trim().split(" ");
    const userId = parts[1]; // DB user ID переданный через deep-link

    if (!userId) {
      await sendTelegramMessage(chatId,
        "Привет! Открой бота через кнопку в профиле на <b>вместе</b> чтобы привязать аккаунт."
      );
      return NextResponse.json({ ok: true });
    }

    // Ищем пользователя по DB id
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      await sendTelegramMessage(chatId, "❌ Пользователь не найден. Попробуй снова через профиль.");
      return NextResponse.json({ ok: true });
    }

    // Сохраняем chatId
    await db.user.update({
      where: { id: userId },
      data: { telegramChatId: chatId },
    });

    await sendTelegramMessage(chatId, `✅ <b>Telegram подключён к Вместе!</b>

Привет, ${user.name}! Теперь ты будешь получать:
⚡ Напоминания о играх за 30 минут до старта
👥 Уведомления когда кто-то записался на твоё событие
🏆 Итоги завершённых событий

Удачи на поле! ⚽`);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/telegram/webhook]", err);
    // Telegram ждёт 200 даже при ошибке, иначе будет ретраить
    return NextResponse.json({ ok: true });
  }
}
