"use client";

import { useState } from "react";
import { X, Copy, Check, Download, Send, MessageCircle } from "lucide-react";

interface Props {
  activityId: string;
  title: string;
  emoji: string;
  place: string;
  dateFormatted: string; // already formatted date string
  spotsLeft: number;
  onClose: () => void;
}

const SITE_URL = "https://vmeste-tau.vercel.app";

function buildShareText(
  emoji: string,
  title: string,
  place: string,
  date: string,
  spots: number
): string {
  let spotsStr = "";
  if (spots <= 0) {
    spotsStr = "Места закончились";
  } else {
    const mod10  = spots % 10;
    const mod100 = spots % 100;
    const verb   = mod10 === 1 && mod100 !== 11 ? "Нужен" : "Нужны";
    const noun   =
      mod100 >= 11 && mod100 <= 19 ? "игроков" :
      mod10 === 1 ? "игрок" :
      mod10 >= 2 && mod10 <= 4 ? "игрока" :
      "игроков";
    spotsStr = `${verb} ${spots} ${noun}`;
  }
  return `${emoji} ${title} — ${place} — ${date}. ${spotsStr}! Присоединяйся 👇`;
}

export default function ShareModal({
  activityId,
  title,
  emoji,
  place,
  dateFormatted,
  spotsLeft,
  onClose,
}: Props) {
  const [copied, setCopied]     = useState(false);
  const [imgError, setImgError] = useState(false);

  const pageUrl    = `${SITE_URL}/activities/${activityId}`;
  const ogImageUrl = `/api/activities/${activityId}/share`;
  const shareText  = buildShareText(emoji, title, place, dateFormatted, spotsLeft);

  const telegramUrl  = `https://t.me/share/url?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(shareText)}`;
  const whatsappUrl  = `https://wa.me/?text=${encodeURIComponent(shareText + "\n" + pageUrl)}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for insecure contexts
      const el = document.createElement("textarea");
      el.value = pageUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleDownload() {
    const a = document.createElement("a");
    a.href = ogImageUrl;
    a.download = `vmeste-${activityId}.png`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative w-full sm:max-w-md bg-[#0d1a0d] border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden">

        {/* Drag handle (mobile) */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        <div className="p-6 pt-4 sm:pt-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-unbounded font-black text-white text-base">
              Поделиться
            </h2>
            <button
              onClick={onClose}
              className="text-white/40 hover:text-white transition-colors p-1 rounded-xl hover:bg-white/10"
            >
              <X size={18} />
            </button>
          </div>

          {/* OG image preview */}
          <div className="rounded-2xl overflow-hidden border border-white/10 mb-5 bg-black/30">
            {imgError ? (
              <div
                className="w-full flex items-center justify-center bg-forest/20 text-white/30 text-sm font-golos"
                style={{ aspectRatio: "1200/630" }}
              >
                <span>{emoji} {title}</span>
              </div>
            ) : (
              <img
                src={ogImageUrl}
                alt="Превью карточки"
                className="w-full"
                style={{ aspectRatio: "1200/630", objectFit: "cover" }}
                onError={() => setImgError(true)}
              />
            )}
          </div>

          {/* Share buttons */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#229ED9]/15 hover:bg-[#229ED9]/25
                         border border-[#229ED9]/30 text-[#229ED9] font-unbounded font-bold
                         text-xs py-3.5 rounded-2xl transition-all hover:scale-[1.02] active:scale-95"
            >
              <Send size={14} />
              Telegram
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#25D366]/15 hover:bg-[#25D366]/25
                         border border-[#25D366]/30 text-[#25D366] font-unbounded font-bold
                         text-xs py-3.5 rounded-2xl transition-all hover:scale-[1.02] active:scale-95"
            >
              <MessageCircle size={14} />
              WhatsApp
            </a>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10
                         border border-white/10 text-white/70 hover:text-white font-unbounded font-bold
                         text-xs py-3.5 rounded-2xl transition-all hover:scale-[1.02] active:scale-95"
            >
              {copied
                ? <Check size={14} className="text-mint" />
                : <Copy size={14} />}
              {copied ? "Скопировано!" : "Скопировать"}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 bg-mint/10 hover:bg-mint/20
                         border border-mint/20 text-mint font-unbounded font-bold
                         text-xs py-3.5 rounded-2xl transition-all hover:scale-[1.02] active:scale-95"
            >
              <Download size={14} />
              Скачать
            </button>
          </div>

          {/* URL pill */}
          <div className="px-4 py-2.5 bg-white/[0.04] border border-white/8 rounded-xl
                          text-xs text-white/25 font-golos truncate select-all cursor-text">
            {pageUrl}
          </div>
        </div>
      </div>
    </div>
  );
}
