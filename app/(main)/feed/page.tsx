"use client";

import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import ActivityCard from "@/components/activity/ActivityCard";
import { CATEGORIES } from "@/types";
import { cn } from "@/lib/utils";

const difficulties = [
  { value: "all",          label: "Любой" },
  { value: "beginner",     label: "Новичок" },
  { value: "intermediate", label: "Средний" },
  { value: "advanced",     label: "Продвинутый" },
];

export default function FeedPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [cat, setCat]               = useState("all");
  const [diff, setDiff]             = useState("all");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, [cat, diff, search]);

  async function fetchActivities() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (cat !== "all")  params.set("cat", cat);
      if (diff !== "all") params.set("diff", diff);
      if (search)         params.set("q", search);

      const res = await fetch(`/api/activities?${params}`);
      const data = await res.json();
      setActivities(Array.isArray(data) ? data : []);
    } catch (e) {
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setSearch(""); setCat("all"); setDiff("all");
  }

  const hasFilters = cat !== "all" || diff !== "all" || search !== "";

  // Преобразуем данные из БД в формат ActivityCard
  function mapActivity(a: any) {
    return {
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
    };
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-forest text-cream py-14 px-4">
        <div className="max-w-7xl mx-auto">
          <span className="text-mint text-xs font-semibold uppercase tracking-widest">Лента событий</span>
          <h1 className="font-unbounded font-black text-3xl md:text-4xl mt-2 mb-2">Найди активность</h1>
          <p className="text-cream/60 text-base">Свежие события рядом с тобой</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-bark" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по названию или месту…"
              className="w-full bg-white border border-forest/15 rounded-full pl-11 pr-4 py-3 text-sm font-golos outline-none focus:border-sage transition-colors"
            />
          </div>
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 rounded-full border text-sm font-golos font-medium transition-all",
              filtersOpen || hasFilters
                ? "bg-forest text-cream border-forest"
                : "bg-white border-forest/15 text-forest hover:border-sage"
            )}
          >
            <SlidersHorizontal size={16} />
            Фильтры
            {hasFilters && <span className="w-2 h-2 rounded-full bg-mint" />}
          </button>
          {hasFilters && (
            <button
              onClick={reset}
              className="flex items-center gap-1.5 px-4 py-3 rounded-full bg-sand border border-forest/10 text-sm text-bark hover:text-forest transition-colors"
            >
              <X size={14} /> Сбросить
            </button>
          )}
        </div>

        {/* Filters */}
        {filtersOpen && (
          <div className="bg-white rounded-2xl border border-forest/10 p-5 mb-6 space-y-5">
            <div>
              <div className="text-xs font-semibold text-bark uppercase tracking-wide mb-3">Категория</div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCat("all")}
                  className={cn("px-3.5 py-1.5 rounded-full text-sm font-golos font-medium border transition-all",
                    cat === "all" ? "bg-forest text-cream border-forest" : "bg-sand border-forest/10 text-bark hover:border-sage"
                  )}
                >
                  Все
                </button>
                {CATEGORIES.map((c) => (
                  <button
                    key={c.slug}
                    onClick={() => setCat(c.slug)}
                    className={cn("px-3.5 py-1.5 rounded-full text-sm font-golos font-medium border transition-all flex items-center gap-1.5",
                      cat === c.slug ? "bg-forest text-cream border-forest" : "bg-sand border-forest/10 text-bark hover:border-sage"
                    )}
                  >
                    <span>{c.icon}</span>{c.nameRu}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-bark uppercase tracking-wide mb-3">Сложность</div>
              <div className="flex flex-wrap gap-2">
                {difficulties.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setDiff(d.value)}
                    className={cn("px-3.5 py-1.5 rounded-full text-sm font-golos font-medium border transition-all",
                      diff === d.value ? "bg-forest text-cream border-forest" : "bg-sand border-forest/10 text-bark hover:border-sage"
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="flex items-center justify-between mb-5">
          <span className="text-sm text-bark">
            {loading ? "Загрузка..." : `${activities.length} событий`}
          </span>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-sand rounded-2xl h-72 animate-pulse" />
            ))}
          </div>
        ) : activities.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {activities.map((a) => (
              <ActivityCard key={a.id} activity={mapActivity(a)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="font-unbounded font-bold text-forest text-xl mb-2">
              {hasFilters ? "Ничего не нашлось" : "Событий пока нет"}
            </h3>
            <p className="text-bark text-sm mb-6">
              {hasFilters ? "Попробуй сбросить фильтры" : "Будь первым — создай событие!"}
            </p>
            {hasFilters
              ? <button onClick={reset} className="btn-dark inline-flex">Сбросить фильтры</button>
              : <a href="/activities/create" className="btn-dark inline-flex">Создать событие</a>
            }
          </div>
        )}
      </div>
    </div>
  );
}