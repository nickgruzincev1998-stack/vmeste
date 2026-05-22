"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import ActivityCard from "@/components/activity/ActivityCard";
import { Search, MapPin, Loader2 } from "lucide-react";
import { YandexMapHandle } from "@/components/map/YandexMap";

const YandexMap = dynamic(() => import("@/components/map/YandexMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-moss/20 rounded-3xl flex items-center justify-center">
      <div className="text-forest font-golos text-sm">Загрузка карты…</div>
    </div>
  ),
});

function getDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function MapPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [radius, setRadius] = useState(10);
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef<YandexMapHandle>(null);

  useEffect(() => {
    fetch("/api/activities")
      .then((r) => r.json())
      .then((data) => setActivities(Array.isArray(data) ? data : []));
  }, []);

  async function handleSearch() {
    if (!query.trim() || !mapReady) return;
    setSearching(true);
    try {
      const coords = await mapRef.current?.searchAddress(query);
      if (coords) {
        setCenter(coords);
        mapRef.current?.setCenter(coords.lat, coords.lng, 12);
      } else {
        alert("Адрес не найден");
      }
    } finally {
      setSearching(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSearch();
  }

  const filtered = center
    ? activities.filter((a) => {
        if (!a.lat || !a.lng) return false;
        return getDistance(center.lat, center.lng, a.lat, a.lng) <= radius;
      })
    : activities;

  const mapActivities = filtered.map((a) => ({
    id: a.id,
    title: a.title,
    lat: a.lat ?? 55.751,
    lng: a.lng ?? 37.618,
    icon: a.category?.icon ?? "📍",
  }));

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-forest py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <span className="text-mint text-xs font-semibold uppercase tracking-widest">Карта</span>
          <h1 className="font-unbounded font-black text-cream text-3xl mt-2">События на карте</h1>

          {/* Поиск */}
          <div className="mt-6 flex gap-3 max-w-2xl">
            <div className="flex-1 flex items-center gap-2 bg-white/10 backdrop-blur rounded-2xl px-4 py-3">
              <MapPin size={18} className="text-mint flex-shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Введите адрес или город…"
                className="flex-1 bg-transparent text-cream placeholder:text-cream/50 font-golos text-sm outline-none"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={searching || !mapReady}
              className="px-6 py-3 bg-mint text-forest font-unbounded font-bold text-sm rounded-2xl hover:bg-sage transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              Найти
            </button>
          </div>

          {/* Радиус */}
          {center && (
            <div className="mt-3 flex items-center gap-3">
              <span className="text-cream/70 text-xs font-golos">Радиус поиска:</span>
              {[5, 10, 20, 50].map((r) => (
                <button
                  key={r}
                  onClick={() => setRadius(r)}
                  className={`px-3 py-1 rounded-full text-xs font-golos font-semibold transition-colors ${
                    radius === r ? "bg-mint text-forest" : "bg-white/10 text-cream/70 hover:bg-white/20"
                  }`}
                >
                  {r} км
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-3xl overflow-hidden border border-forest/10 mb-8" style={{ height: 500 }}>
          <YandexMap
            ref={mapRef}
            activities={mapActivities}
            onMapReady={() => setMapReady(true)}
          />
        </div>

        <div className="flex items-center justify-between mb-5">
          <h2 className="font-unbounded font-bold text-forest text-xl">
            {center ? `События поблизости (${filtered.length})` : `Все события (${activities.length})`}
          </h2>
          {center && (
            <button
              onClick={() => setCenter(null)}
              className="text-xs text-sage hover:text-forest font-golos transition-colors"
            >
              Сбросить фильтр
            </button>
          )}
        </div>

        {filtered.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((a) => (
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
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🗺️</div>
            <h3 className="font-unbounded font-bold text-forest text-xl mb-2">
              {center ? "Нет событий поблизости" : "Событий пока нет"}
            </h3>
            <p className="text-bark text-sm mb-6">
              {center ? `Попробуйте увеличить радиус поиска` : "Создай первое событие!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}