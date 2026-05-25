"use client";

import { useState, useEffect } from "react";

// Иконка Telegram (SVG, без внешней библиотеки)
function TelegramIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.88 13.67l-2.98-.924c-.648-.204-.66-.648.135-.96l11.66-4.498c.54-.194 1.016.131.84.933z" />
    </svg>
  );
}

interface TelegramStatus {
  connected: boolean;
  url: string;
}

export default function TelegramConnect() {
  const [status, setStatus]   = useState<TelegramStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    fetch("/api/telegram/connect")
      .then((r) => r.json())
      .then((data) => {
        if (data.url !== undefined) setStatus(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Не рендерим пока грузится или если бот не настроен
  if (loading || !status) return null;

  // ── Уже подключён ──────────────────────────────────────────────────────────
  if (status.connected) {
    return (
      <div className="flex items-center gap-3 bg-[#229ED9]/10 border border-[#229ED9]/25
                      rounded-2xl px-5 py-3.5">
        <div className="w-8 h-8 rounded-full bg-[#229ED9] flex items-center justify-center
                        text-white flex-shrink-0">
          <TelegramIcon size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-golos font-semibold text-forest text-sm leading-tight">
            ✅ Telegram подключён
          </p>
          <p className="font-golos text-bark text-xs mt-0.5">
            Уведомления о событиях приходят в Telegram
          </p>
        </div>
      </div>
    );
  }

  // ── Не подключён ───────────────────────────────────────────────────────────
  function handleConnect() {
    if (!status?.url) return;
    setOpening(true);
    window.open(status.url, "_blank", "noopener,noreferrer");
    // После открытия через 3 сек проверяем статус снова
    setTimeout(() => {
      fetch("/api/telegram/connect")
        .then((r) => r.json())
        .then((data) => { if (data.url !== undefined) setStatus(data); })
        .catch(() => {})
        .finally(() => setOpening(false));
    }, 3000);
  }

  return (
    <div className="bg-gradient-to-r from-forest to-[#1e3d2a] border border-white/10
                    rounded-2xl p-5 shadow-lg">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="w-11 h-11 rounded-2xl bg-[#229ED9] flex items-center justify-center
                        text-white flex-shrink-0 shadow-md">
          <TelegramIcon size={22} />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="font-unbounded font-bold text-cream text-sm mb-1">
            Подключи Telegram
          </p>
          <p className="font-golos text-cream/55 text-xs leading-relaxed">
            Получай уведомления когда кто-то записывается, за 30 мин до старта и итоги игр
          </p>
        </div>
      </div>

      <button
        onClick={handleConnect}
        disabled={opening}
        className="mt-4 w-full flex items-center justify-center gap-2
                   bg-mint hover:bg-mint/90 active:scale-95
                   text-forest font-unbounded font-bold text-xs
                   py-3 rounded-xl transition-all disabled:opacity-60"
      >
        <TelegramIcon size={15} />
        {opening ? "Открываем бот…" : "Подключить Telegram"}
      </button>

      <p className="text-center font-golos text-cream/30 text-[10px] mt-2.5">
        Откроется бот @{process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? "vmeste_bot"} в Telegram
      </p>
    </div>
  );
}
