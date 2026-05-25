"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Plus, Search, X, RefreshCw, ArrowRight } from "lucide-react";
import FeedCard, { type FeedActivity } from "@/components/activity/FeedCard";

interface Category {
  id: string;
  nameRu: string;
  icon: string;
}

interface Props {
  categories: Category[];
}

// ─── Status classification ──────────────────────────────────────────────────

const ONE_HOUR = 3_600_000;
const THREE_H  = 3 * ONE_HOUR;

function classify(dateStr: string): "now" | "soon" | "planned" {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff < 0 && diff > -THREE_H)  return "now";
  if (diff >= 0 && diff < ONE_HOUR) return "soon";
  return "planned";
}

// ─── Section header ─────────────────────────────────────────────────────────

function SectionHeader({
  emoji, label, count, accentCls,
}: {
  emoji?: string; label: string; count: number; accentCls: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-5">
      {emoji && <span className="text-lg leading-none">{emoji}</span>}
      <h2 className="font-unbounded font-black text-white text-xs uppercase tracking-widest">
        {label}
      </h2>
      <span className={`text-xs font-golos px-2.5 py-0.5 rounded-full border ${accentCls}`}>
        {count}
      </span>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function FeedClient({ categories }: Props) {
  const [activities, setActivities] = useState<FeedActivity[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [query, setQuery]             = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Fetch ────────────────────────────────────────────────────────────────

  const fetchActivities = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    try {
      const res = await fetch("/api/activities", { cache: "no-store" });
      if (res.ok) setActivities(await res.json());
    } catch {
      // silently ignore network errors on background refresh
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities(false);
    timerRef.current = setInterval(() => fetchActivities(true), 30_000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchActivities]);

  // ── Filter client-side (all data already loaded) ─────────────────────────

  const filtered = activities.filter((a) => {
    if (selectedCat && a.category.id !== selectedCat) return false;
    if (query) {
      const q = query.toLowerCase();
      if (!a.title.toLowerCase().includes(q) && !a.placeName.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const nowActs     = filtered.filter((a) => classify(a.date) === "now");
  const soonActs    = filtered.filter((a) => classify(a.date) === "soon");
  const plannedActs = filtered.filter((a) => classify(a.date) === "planned");

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0a0f0a]">

      {/* ── Sticky header ── */}
      <div className="sticky top-16 z-40 border-b border-white/10 bg-[#0d140d]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">

          {/* Top row */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2.5">
              <h1 className="font-unbounded font-black text-white text-lg leading-none">
                Лента событий
              </h1>
              {refreshing && (
                <RefreshCw size={13} className="text-mint/50 animate-spin" />
              )}
              {!loading && (
                <span className="text-xs font-golos text-white/30">
                  {activities.length} игр
                </span>
              )}
            </div>
            <Link
              href="/activities/create"
              className="inline-flex items-center gap-1.5 bg-mint text-forest font-unbounded font-bold
                         text-xs px-4 py-2.5 rounded-xl hover:bg-mint/90 transition-all hover:scale-105 active:scale-95"
            >
              <Plus size={13} />
              Создать
            </Link>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
            <input
              type="text"
              placeholder="Поиск по названию или месту..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl
                         pl-9 pr-9 py-2.5 text-sm text-white placeholder-white/25 font-golos
                         focus:outline-none focus:border-mint/40 transition-colors"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Category pills */}
          {categories.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <button
                onClick={() => setSelectedCat(null)}
                className={`flex-shrink-0 text-xs font-semibold px-4 py-2 rounded-full font-golos transition-all ${
                  !selectedCat
                    ? "bg-mint text-forest"
                    : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                Все
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCat(selectedCat === cat.id ? null : cat.id)}
                  className={`flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full font-golos transition-all ${
                    selectedCat === cat.id
                      ? "bg-mint text-forest"
                      : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span>{cat.icon}</span>
                  {cat.nameRu}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Skeleton */}
        {loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-forest/10 border border-white/5 rounded-3xl h-72 animate-pulse"
                style={{ animationDelay: `${i * 80}ms` }}
              />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="text-6xl mb-5">🎮</div>
            <h2 className="font-unbounded font-black text-white text-xl mb-3">
              {query || selectedCat ? "Ничего не найдено" : "Игр пока нет"}
            </h2>
            <p className="text-white/40 text-sm mb-8 font-golos max-w-xs">
              {query || selectedCat
                ? "Попробуй другой фильтр или поисковый запрос"
                : "Будь первым — создай игру и найди команду!"}
            </p>
            {!query && !selectedCat && (
              <Link
                href="/activities/create"
                className="inline-flex items-center gap-3 bg-mint text-forest
                           font-unbounded font-bold text-sm px-8 py-4 rounded-2xl
                           hover:bg-mint/90 transition-all hover:scale-105"
              >
                Создать игру <ArrowRight size={16} />
              </Link>
            )}
          </div>
        )}

        {/* Sections */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-12">

            {/* 🔴 Идёт сейчас */}
            {nowActs.length > 0 && (
              <section>
                <SectionHeader
                  label="Идёт сейчас"
                  count={nowActs.length}
                  accentCls="text-red-400 bg-red-500/10 border-red-500/20"
                />
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {nowActs.map((a) => <FeedCard key={a.id} activity={a} />)}
                </div>
              </section>
            )}

            {/* ⚡ Начинается скоро */}
            {soonActs.length > 0 && (
              <section>
                <SectionHeader
                  emoji="⚡"
                  label="Начинается скоро"
                  count={soonActs.length}
                  accentCls="text-orange-400 bg-orange-500/10 border-orange-500/20"
                />
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {soonActs.map((a) => <FeedCard key={a.id} activity={a} />)}
                </div>
              </section>
            )}

            {/* 📅 Запланировано */}
            {plannedActs.length > 0 && (
              <section>
                <SectionHeader
                  emoji="📅"
                  label="Запланировано"
                  count={plannedActs.length}
                  accentCls="text-white/30 bg-white/5 border-white/10"
                />
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {plannedActs.map((a) => <FeedCard key={a.id} activity={a} />)}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
