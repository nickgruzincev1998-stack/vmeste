"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import ActivityCard from "@/components/activity/ActivityCard";

const YandexMap = dynamic(() => import("@/components/map/YandexMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-moss/20 rounded-3xl flex items-center justify-center">
      <div className="text-forest font-golos text-sm">Загрузка карты…</div>
    </div>
  ),
});

export default function MapPage() {
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/activities")
      .then((r) => r.json())
      .then((data) => setActivities(Array.isArray(data) ? data : []));
  }, []);

  const mapActivities = activities.map((a) => ({
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
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-3xl overflow-hidden border border-forest/10 mb-8" style={{ height: 500 }}>
          <YandexMap activities={mapActivities} />
        </div>

        <h2 className="font-unbounded font-bold text-forest text-xl mb-5">Все события</h2>
        {activities.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {activities.map((a) => (
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
            <h3 className="font-unbounded font-bold text-forest text-xl mb-2">Событий пока нет</h3>
            <p className="text-bark text-sm mb-6">Создай первое событие!</p>
            <a href="/activities/create" className="btn-dark inline-flex">Создать событие</a>
          </div>
        )}
      </div>
    </div>
  );
}