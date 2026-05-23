"use client";

import { useState, useEffect } from "react";
import { Search, X, MapPin, ChevronRight } from "lucide-react";
import ActivityCard from "@/components/activity/ActivityCard";
import CitySelector from "@/components/shared/CitySelector";
import { CATEGORIES } from "@/types";
import { cn } from "@/lib/utils";

const difficulties = [
  { value: "all",          label: "Любой" },
  { value: "beginner",     label: "Новичок" },
  { value: "intermediate", label: "Средний" },
  { value: "advanced",     label: "Продвинутый" },
];

type Step = "city" | "category" | "results";

export default function FeedPage() {
  const [step, setStep] = useState<Step>("city");
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [diff, setDiff] = useState("all");
  const [city, setCity] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("selectedCity") || "";
    }
    return "";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedCity", city);
    }
  }, [city]);

  useEffect(() => {
    if (step === "results") fetchActivities();
  }, [step, selectedCats, diff, search, city]);

  async function fetchActivities() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCats.length === 1) params.set("cat", selectedCats[0]);
      if (diff !== "all") params.set("diff", diff);
      if (search) params.set("q", search);
      if (city) params.set("city", city);
      const res = await fetch(`/api/activities?${params}`);
      const data = await res.json();
      let result = Array.isArray(data) ? data : [];
      if (selectedCats.length > 1) {
        result = result.filter((a: any) =>
          selectedCats.includes(a.category?.slug)
        );
      }
      setActivities(result);
    } catch {
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }

  function toggleCat(slug: string) {
    setSelectedCats((prev) =>
      prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]
    );
  }

  function handleCityNext() {
    setStep("category");
  }

  function handleCategoryNext() {
    setStep("results");
  }

  function reset() {
    setStep("city");
    setSelectedCats([]);
    setDiff("all");
    setSearch("");
  }

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

  // STEP 1 — ГОРОД
  if (step === "city") {
    return (
      <div className="min-h-screen bg-forest flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-mint/15 border border-mint/30 text-mint text-xs font-semibold px-4 py-2 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
              Шаг 1 из 2
            </div>
            <h1 className="font-unbounded font-black text-cream text-3xl md:text-4xl mb-3">
              Выбери город
            </h1>
            <p className="text-cream/50 font-golos text-sm">
              Найдём игры рядом с тобой
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-3xl p-6 mb-4">
            <div className="flex items-center gap-2 text-cream/60 text-xs font-golos mb-3">
              <MapPin size={14} />
              Твой город
            </div>
            <CitySelector value={city} onChange={setCity} />
          </div>

          <button
            onClick={handleCityNext}
            className="w-full py-4 bg-mint text-forest font-unbounded font-bold text-sm rounded-2xl hover:bg-sage transition-colors flex items-center justify-center gap-2"
          >
            {city ? `Ищем в ${city}` : "Искать везде"}
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  // STEP 2 — КАТЕГОРИИ
  if (step === "category") {
    return (
      <div className="min-h-screen bg-forest px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-mint/15 border border-mint/30 text-mint text-xs font-semibold px-4 py-2 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
              Шаг 2 из 2
            </div>
            <h1 className="font-unbounded font-black text-cream text-3xl md:text-4xl mb-3">
              Выбери досуг
            </h1>
            <p className="text-cream/50 font-golos text-sm">
              Можно выбрать несколько
            </p>
          </div>

          {/* Категории */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCats.includes(cat.slug);
              return (
                <button
                  key={cat.slug}
                  onClick={() => toggleCat(cat.slug)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all text-center",
                    isSelected
                      ? "border-mint bg-mint/20 text-cream"
                      : "border-white/10 bg-white/5 text-cream/70 hover:border-white/30 hover:bg-white/10"
                  )}
                >
                  <span className="text-4xl">{cat.icon}</span>
                  <span className="font-unbounded font-bold text-xs">{cat.nameRu}</span>
                  {isSelected && (
                    <span className="text-mint text-xs font-golos">✓ Выбрано</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Сложность */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
            <div className="text-cream/60 text-xs font-golos uppercase tracking-wide mb-3">Уровень</div>
            <div className="flex flex-wrap gap-2">
              {difficulties.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDiff(d.value)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-golos font-medium transition-all",
                    diff === d.value
                      ? "bg-mint text-forest"
                      : "bg-white/10 text-cream/60 hover:bg-white/20"
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep("city")}
              className="px-6 py-4 rounded-2xl border border-white/20 text-cream/60 hover:text-cream font-golos text-sm transition-colors"
            >
              ← Назад
            </button>
            <button
              onClick={handleCategoryNext}
              className="flex-1 py-4 bg-mint text-forest font-unbounded font-bold text-sm rounded-2xl hover:bg-sage transition-colors flex items-center justify-center gap-2"
            >
              {selectedCats.length > 0
                ? `Найти игры (${selectedCats.length} категор.)`
                : "Найти все игры"}
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STEP 3 — РЕЗУЛЬТАТЫ
  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-forest text-cream py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setStep("category")}
              className="text-cream/60 hover:text-cream text-sm font-golos transition-colors"
            >
              ← Назад
            </button>
            <button
              onClick={reset}
              className="ml-auto flex items-center gap-1.5 text-cream/60 hover:text-cream text-xs font-golos transition-colors"
            >
              <X size={14} /> Сначала
            </button>
          </div>

          <h1 className="font-unbounded font-black text-2xl md:text-3xl mb-1">
            {city ? `Игры в ${city}` : "Все игры"}
          </h1>
          <p className="text-cream/50 text-sm font-golos">
            {selectedCats.length > 0
              ? selectedCats.map(s => CATEGORIES.find(c => c.slug === s)?.nameRu).join(", ")
              : "Все категории"}
            {diff !== "all" && ` · ${difficulties.find(d => d.value === diff)?.label}`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Поиск */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-bark" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по названию…"
              className="w-full bg-white border border-forest/15 rounded-full pl-11 pr-4 py-3 text-sm font-golos outline-none focus:border-sage transition-colors"
            />
          </div>
        </div>

        {/* Выбранные категории */}
        {selectedCats.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {selectedCats.map((slug) => {
              const cat = CATEGORIES.find((c) => c.slug === slug);
              return (
                <span key={slug} className="flex items-center gap-1.5 px-3 py-1.5 bg-forest text-cream text-xs font-golos rounded-full">
                  {cat?.icon} {cat?.nameRu}
                  <button onClick={() => toggleCat(slug)} className="ml-1 hover:text-red-300">×</button>
                </span>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between mb-5">
          <span className="text-sm text-bark">
            {loading ? "Загрузка..." : `${activities.length} игр найдено`}
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
            <h3 className="font-unbounded font-bold text-forest text-xl mb-2">Игр не найдено</h3>
            <p className="text-bark text-sm mb-6">Попробуй изменить фильтры или создай свою игру</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setStep("category")} className="px-6 py-3 rounded-full border border-forest/20 text-forest text-sm font-golos hover:border-forest transition-colors">
                Изменить фильтры
              </button>
              <a href="/activities/create" className="btn-dark inline-flex">Создать игру</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}