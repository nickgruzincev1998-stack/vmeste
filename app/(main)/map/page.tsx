"use client";

import dynamic from "next/dynamic";
import ActivityCard from "@/components/activity/ActivityCard";
import { MOCK_ACTIVITIES } from "@/types";

const YandexMap = dynamic(() => import("@/components/map/YandexMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-moss/20 rounded-3xl flex items-center justify-center">
      <div className="text-forest font-golos text-sm">Загрузка карты…</div>
    </div>
  ),
});

// Координаты для событий (Москва)
const activityCoords: Record<string, [number, number]> = {
  "1": [55.751, 37.628],
  "2": [55.763, 37.589],
  "3": [55.748, 37.542],
  "4": [55.794, 37.678],
  "5": [55.731, 37.601],
  "6": [55.788, 37.745],
};

export default function MapPage() {
  const mapActivities = MOCK_ACTIVITIES.map((a) => ({
    id: a.id,
    title: a.title,
    lat: activityCoords[a.id]?.[0] ?? 55.751,
    lng: activityCoords[a.id]?.[1] ?? 37.618,
    icon: a.category.icon,
  }));

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-forest py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <span className="text-mint text-xs font-semibold uppercase tracking-widest">Карта</span>
          <h1 className="font-unbounded font-black text-cream text-3xl mt-2">События на карте</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-3xl overflow-hidden border border-forest/10 mb-8" style={{ height: 500 }}>
          <YandexMap activities={mapActivities} />
        </div>

        <h2 className="font-unbounded font-bold text-forest text-xl mb-5">Все события</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {MOCK_ACTIVITIES.map((a) => (
            <ActivityCard key={a.id} activity={a} />
          ))}
        </div>
      </div>
    </div>
  );
}