"use client";

import dynamic from "next/dynamic";
import ActivityCard from "@/components/activity/ActivityCard";
import { MOCK_ACTIVITIES } from "@/types";

// Загружаем карту динамически (без SSR)
const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-moss/20 rounded-3xl flex items-center justify-center">
      <div className="text-forest font-golos">Загрузка карты...</div>
    </div>
  ),
});

export default function MapPage() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-forest py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <span className="text-mint text-xs font-semibold uppercase tracking-widest">Карта</span>
          <h1 className="font-unbounded font-black text-cream text-3xl mt-2">События на карте</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Карта */}
        <div className="rounded-3xl overflow-hidden border border-forest/10 mb-8" style={{ height: 480 }}>
          <MapView />
        </div>

        {/* Список */}
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