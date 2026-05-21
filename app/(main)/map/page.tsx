"use client";

import Link from "next/link";
import { MapPin, ExternalLink } from "lucide-react";
import ActivityCard from "@/components/activity/ActivityCard";
import { MOCK_ACTIVITIES } from "@/types";

export default function MapPage() {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Header */}
      <div className="bg-forest py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <span className="text-mint text-xs font-semibold uppercase tracking-widest">Карта</span>
          <h1 className="font-unbounded font-black text-cream text-3xl mt-2">События на карте</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Map placeholder */}
        <div className="rounded-3xl overflow-hidden border border-forest/10 mb-8 bg-moss/10 relative"
             style={{ height: 420 }}>
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-10"
               style={{ backgroundImage: "linear-gradient(#1a3a2a 1px,transparent 1px),linear-gradient(90deg,#1a3a2a 1px,transparent 1px)", backgroundSize: "40px 40px" }} />

          {/* Pins */}
          {MOCK_ACTIVITIES.map((a, i) => {
            const positions = [
              { top: "28%", left: "22%" },
              { top: "45%", left: "55%" },
              { top: "20%", left: "68%" },
              { top: "65%", left: "35%" },
              { top: "55%", left: "72%" },
              { top: "38%", left: "40%" },
            ];
            const pos = positions[i % positions.length];
            return (
              <Link
                key={a.id}
                href={`/activities/${a.id}`}
                className="absolute -translate-x-1/2 -translate-y-full group"
                style={pos}
              >
                <div className="bg-forest text-cream rounded-xl px-3 py-2 text-xs font-unbounded font-bold shadow-lg transition-transform group-hover:-translate-y-1 whitespace-nowrap flex items-center gap-1.5">
                  <span>{a.category.icon}</span>
                  <span className="max-w-[120px] truncate">{a.title}</span>
                </div>
                <div className="w-3 h-3 bg-forest rotate-45 mx-auto -mt-1.5 shadow" />
              </Link>
            );
          })}

          {/* Center notice */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-full px-5 py-2.5 flex items-center gap-2 text-sm text-forest font-golos font-medium shadow">
            <MapPin size={15} className="text-sage" />
            Подключите Mapbox для интерактивной карты
            <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer"
               className="text-sage hover:text-forest transition-colors">
              <ExternalLink size={13} />
            </a>
          </div>
        </div>

        {/* List below map */}
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
