"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";

export interface FeedActivity {
  id: string;
  title: string;
  date: string;
  placeName: string;
  maxParticipants: number;
  difficulty: string;
  category: { id: string; icon: string; nameRu: string };
  creator: { name: string; avatar: string | null };
  participants: Array<{ user: { id: string; name: string; avatar: string | null } }>;
  _count: { participants: number };
}

// ─── Countdown logic ───────────────────────────────────────────────────────

const ONE_HOUR  = 3_600_000;
const THREE_H   = 3 * ONE_HOUR;
const ONE_DAY   = 24 * ONE_HOUR;

type CountdownInfo =
  | { type: "now" }
  | { type: "soon"; mins: number }
  | { type: "countdown"; h: number; m: number }
  | { type: "date"; date: Date };

function getCountdownInfo(dateStr: string): CountdownInfo {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff < 0 && diff > -THREE_H)   return { type: "now" };
  if (diff >= 0 && diff < ONE_HOUR)  return { type: "soon",      mins: Math.ceil(diff / 60_000) };
  if (diff >= ONE_HOUR && diff < ONE_DAY) {
    return { type: "countdown", h: Math.floor(diff / ONE_HOUR), m: Math.floor((diff % ONE_HOUR) / 60_000) };
  }
  return { type: "date", date: new Date(dateStr) };
}

function StatusBadge({ dateStr }: { dateStr: string }) {
  const [info, setInfo] = useState<CountdownInfo>(() => getCountdownInfo(dateStr));

  useEffect(() => {
    const id = setInterval(() => setInfo(getCountdownInfo(dateStr)), 10_000);
    return () => clearInterval(id);
  }, [dateStr]);

  if (info.type === "now") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-unbounded font-bold px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        СЕЙЧАС
      </span>
    );
  }
  if (info.type === "soon") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-unbounded font-bold px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
        ⚡ через {info.mins} мин
      </span>
    );
  }
  if (info.type === "countdown") {
    return (
      <span className="text-xs font-golos font-medium text-white/50">
        через {info.h}ч {info.m}мин
      </span>
    );
  }
  return (
    <span className="text-xs font-golos font-medium text-white/40">
      {info.date.toLocaleDateString("ru-RU", { weekday: "short", day: "numeric", month: "short" })}
    </span>
  );
}

// ─── Difficulty ─────────────────────────────────────────────────────────────

const DIFF_CONFIG = {
  beginner:     { label: "Новичок",     cls: "bg-green-500/15  text-green-400"  },
  intermediate: { label: "Средний",     cls: "bg-yellow-500/15 text-yellow-400" },
  advanced:     { label: "Продвинутый", cls: "bg-red-500/15    text-red-400"    },
} as const;

// ─── Avatar helper ──────────────────────────────────────────────────────────

function Avatar({ src, name, ring }: { src: string | null; name: string; ring?: string }) {
  return (
    <div
      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold overflow-hidden
        ${ring ?? "ring-2 ring-[#0d1a0d]"}
        ${src ? "" : "bg-mint/20 text-mint"}`}
    >
      {src
        ? <img src={src} alt={name} className="w-full h-full object-cover" />
        : name[0]?.toUpperCase()}
    </div>
  );
}

// ─── Card ───────────────────────────────────────────────────────────────────

interface Props {
  activity: FeedActivity;
}

export default function FeedCard({ activity }: Props) {
  const count     = activity._count.participants;
  const spotsLeft = activity.maxParticipants - count;
  const pct       = Math.min(100, Math.round((count / activity.maxParticipants) * 100));
  const diff      = DIFF_CONFIG[activity.difficulty as keyof typeof DIFF_CONFIG] ?? DIFF_CONFIG.beginner;

  const barColor =
    pct >= 90 ? "bg-red-500"    :
    pct >= 70 ? "bg-orange-400" :
    "bg-mint";

  const spotBadgeCls =
    spotsLeft === 0 ? "bg-red-500/20 text-red-400"    :
    spotsLeft <= 2  ? "bg-orange-500/20 text-orange-400" :
    "bg-white/10 text-white/60";

  return (
    <Link
      href={`/activities/${activity.id}`}
      className="group block bg-[#0d1a0d] border border-white/10 rounded-3xl overflow-hidden
                 hover:border-mint/40 hover:shadow-[0_0_30px_rgba(74,222,128,0.06)]
                 transition-all duration-200 hover:scale-[1.015]"
    >
      {/* ── Cover ── */}
      <div className="h-32 flex items-center justify-center bg-forest/40 relative overflow-hidden">
        <span className="text-5xl select-none group-hover:scale-110 transition-transform duration-300">
          {activity.category.icon}
        </span>

        {/* Category */}
        <div className="absolute top-3 left-3">
          <span className="text-[11px] font-golos font-semibold px-2.5 py-1 rounded-full bg-mint/15 text-mint border border-mint/20">
            {activity.category.nameRu}
          </span>
        </div>

        {/* Spots */}
        <div className="absolute top-3 right-3">
          <span className={`text-[11px] font-golos font-bold px-2.5 py-1 rounded-full ${spotBadgeCls}`}>
            {spotsLeft === 0 ? "Мест нет" : `${spotsLeft} мест`}
          </span>
        </div>

        {/* Difficulty */}
        <div className="absolute bottom-3 left-3">
          <span className={`text-[10px] font-golos font-semibold px-2 py-0.5 rounded-full ${diff.cls}`}>
            {diff.label}
          </span>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="p-5">
        {/* Title */}
        <h3 className="font-unbounded font-bold text-sm text-white leading-snug mb-2 group-hover:text-mint transition-colors line-clamp-2">
          {activity.title}
        </h3>

        {/* Status badge */}
        <div className="mb-3">
          <StatusBadge dateStr={activity.date} />
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-xs text-white/35 mb-4 font-golos">
          <MapPin size={11} className="flex-shrink-0 text-mint/40" />
          <span className="truncate">{activity.placeName}</span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-4">
          <div
            className={`h-full rounded-full transition-all ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Footer: avatar stack + join */}
        <div className="flex items-center justify-between">
          {/* Avatar stack */}
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {/* Creator */}
              <div className="relative z-10">
                <Avatar src={activity.creator.avatar} name={activity.creator.name} />
              </div>
              {/* Up to 2 participants */}
              {activity.participants.slice(0, 2).map((p, i) => (
                <div key={p.user.id} className="relative" style={{ zIndex: 9 - i }}>
                  <Avatar src={p.user.avatar} name={p.user.name} />
                </div>
              ))}
            </div>
            <span className="text-xs text-white/35 font-golos">
              {count}/{activity.maxParticipants}
            </span>
          </div>

          {/* CTA */}
          <span className="text-xs font-semibold text-mint bg-mint/10 px-3 py-1 rounded-full group-hover:bg-mint/20 transition-colors">
            Войти →
          </span>
        </div>
      </div>
    </Link>
  );
}
