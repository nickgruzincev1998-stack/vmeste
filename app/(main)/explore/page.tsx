"use client";

import { useState, useEffect } from "react";
import { Search, Users, Calendar } from "lucide-react";
import ActivityCard from "@/components/activity/ActivityCard";
import { cn } from "@/lib/utils";
import { CATEGORIES } from "@/types";
import Link from "next/link";

type Tab = "activities" | "users";

export default function ExplorePage() {
  const [query, setQuery]       = useState("");
  const [tab, setTab]           = useState<Tab>("activities");
  const [results, setResults]   = useState<any[]>([]);
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) search();
      else setResults([]);
    }, 400);
    return () => clearTimeout(timer);
  }, [query, tab]);

  async function search() {
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${tab}`);
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-forest py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <span className="text-mint text-xs font-semibold uppercase tracking-widest">Поиск</span>
          <h1 className="font-unbounded font-black text-cream text-3xl mt-2 mb-6">Найди своих</h1>

          {/* Search input */}
          <div className="relative">
            <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-bark" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск событий и людей…"
              autoFocus
              className="w-full bg-white rounded-2xl pl-14 pr-5 py-4 text-base font-golos outline-none shadow-lg"
            />
            {loading && (
              <div className="absolute right-5 top-1/2 -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-sage border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setTab("activities")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-golos font-medium transition-all",
                tab === "activities"
                  ? "bg-mint text-forest"
                  : "bg-white/10 text-cream/70 hover:text-cream"
              )}
            >
              <Calendar size={15} />
              События
            </button>
            <button
              onClick={() => setTab("users")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-golos font-medium transition-all",
                tab === "users"
                  ? "bg-mint text-forest"
                  : "bg-white/10 text-cream/70 hover:text-cream"
              )}
            >
              <Users size={15} />
              Люди
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Empty state — начальный */}
        {query.length < 2 && (
          <div>
            <div className="text-xs font-semibold text-bark uppercase tracking-wide mb-4">
              Популярные категории
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
              {CATEGORIES.slice(0, 6).map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/feed?cat=${cat.slug}`}
                  className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-forest/8 hover:border-sage transition-all hover:-translate-y-0.5"
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="font-golos font-semibold text-forest text-sm">{cat.nameRu}</span>
                </Link>
              ))}
            </div>
            <div className="text-center py-12">
              <div className="text-5xl mb-3">🔍</div>
              <p className="text-bark text-sm">Введи минимум 2 символа для поиска</p>
            </div>
          </div>
        )}

        {/* Results */}
        {query.length >= 2 && !loading && results.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">😕</div>
            <h3 className="font-unbounded font-bold text-forest text-lg mb-2">Ничего не найдено</h3>
            <p className="text-bark text-sm">Попробуй другой запрос</p>
          </div>
        )}

        {/* Activities results */}
        {tab === "activities" && results.length > 0 && (
          <div>
            <div className="text-sm text-bark mb-4">{results.length} событий</div>
            <div className="grid sm:grid-cols-2 gap-5">
              {results.map((a) => (
                <ActivityCard key={a.id} activity={{
                  id: a.id,
                  title: a.title,
                  description: a.description,
                  category: a.category,
                  date: a.date,
                  placeName: a.placeName,
                  difficulty: a.difficulty,
                  maxParticipants: a.maxParticipants,
                  currentParticipants: a._count?.participants ?? 0,
                  creator: a.creator,
                }} />
              ))}
            </div>
          </div>
        )}

        {/* Users results */}
        {tab === "users" && results.length > 0 && (
          <div>
            <div className="text-sm text-bark mb-4">{results.length} пользователей</div>
            <div className="space-y-3">
              {results.map((user) => (
                <Link
                  key={user.id}
                  href={`/profile/${user.username}`}
                  className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-forest/8 hover:border-sage transition-all hover:-translate-y-0.5"
                >
                  <div className="w-12 h-12 rounded-2xl bg-sage flex items-center justify-center text-cream font-bold text-lg overflow-hidden flex-shrink-0">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name?.[0]?.toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-golos font-semibold text-forest">{user.name}</div>
                    <div className="text-bark text-sm">@{user.username}</div>
                    {user.city && (
                      <div className="text-bark text-xs mt-0.5">📍 {user.city}</div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-unbounded font-bold text-forest text-sm">Ур. {user.level}</div>
                    <div className="text-bark text-xs">{user.xp} XP</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}