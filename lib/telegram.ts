const TELEGRAM_API = "https://api.telegram.org";

export async function sendTelegramMessage(
  chatId: string,
  text: string
): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !chatId) return;

  try {
    await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
  } catch (err) {
    console.error("[telegram] sendMessage failed:", err);
  }
}

/** Отправить сообщение нескольким пользователям (fire-and-forget) */
export function sendTelegramToMany(
  chatIds: (string | null | undefined)[],
  text: string
): void {
  const valid = chatIds.filter(Boolean) as string[];
  valid.forEach((id) => sendTelegramMessage(id, text).catch(console.error));
}

export function fmtDate(date: Date): string {
  return date.toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}
