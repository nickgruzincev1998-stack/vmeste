"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, Users, Star, ChevronRight } from "lucide-react";
import { MOCK_ACTIVITIES, CATEGORIES } from "@/types";
import { cn } from "@/lib/utils";

const diffLabel: Record<string, { label: string; cls: string }> = {
  beginner:     { label: "Новичок",     cls: "bg-green-100 text-green-800" },
  intermediate: { label: "Средний",    cls: "bg-yellow-100 text-yellow-800" },
  advanced:     { label: "Продвинутый", cls: "bg-red-100 text-red-800" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", {
    weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
  });
}

// Mock avatars for participants
const mockParticipants = [
  { name: "Алёна К.", initial: "А", color: "bg-sage" },
  { name: "Дмитрий В.", initial: "Д", color: "bg-ember" },
  { name: "Маша Т.", initial: "М", color: "bg-moss" },
  { name: "Петр С.", initial: "П", color: "bg-bark" },
  { name: "Юля Н.", initial: "Ю", color: "bg-mint text-forest" },
];

export default function ActivityDetailPage({ params }: { params: { id: string } }) {
  const activity = MOCK_ACTIVITIES.find((a) => a.id === params.id) ?? MOCK_ACTIVITIES[0];
  const [joined, setJoined] = useState(false);
  const spotsLeft = activity.maxParticipants - activity.currentParticipants;
  const isFull = spotsLeft <= 0;
  const diff = diffLabel[activity.difficulty];
  const related = MOCK_ACTIVITIES.filter((a) => a.id !== activity.id && a.category.slug === activity.category.slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-cream">
      {/* Back */}
      <div className="bg-forest py-4 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/feed" className="flex items-center gap-2 text-cream/70 hover:text-cream text-sm transition-colors font-golos">
            <ArrowLeft size={16} /> Назад к ленте
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cover */}
            <div className="h-64 rounded-3xl bg-forest flex items-center justify-center relative overflow-hidden">
              <span className="text-8xl">{activity.category.icon}</span>
              <div className="absolute top-4 left-4 flex gap-2">
                <span className={cn("text-xs font-golos font-semibold px-3 py-1.5 rounded-full", activity.category.color)}>
                  {activity.category.nameRu}
                </span>
                <span className={cn("text-xs font-golos font-semibold px-3 py-1.5 rounded-full", diff.cls)}>
                  {diff.label}
                </span>
              </div>
            </div>

            {/* Title */}
            <div>
              <h1 className="font-unbounded font-black text-forest text-2xl md:text-3xl leading-tight mb-4">
                {activity.title}
              </h1>
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-sm text-bark">
                  <Calendar size={18} className="mt-0.5 flex-shrink-0 text-sage" />
                  <span className="capitalize">{formatDate(activity.date)}</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-bark">
                  <MapPin size={18} className="mt-0.5 flex-shrink-0 text-sage" />
                  <span>{activity.placeName}</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-bark">
                  <Users size={18} className="mt-0.5 flex-shrink-0 text-sage" />
                  <span>{activity.currentParticipants} из {activity.maxParticipants} участников · {isFull ? "мест нет" : `осталось ${spotsLeft}`}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 border border-forest/8">
              <h2 className="font-unbounded font-bold text-forest text-base mb-3">Описание</h2>
              <p className="text-bark leading-relaxed text-sm">{activity.description}</p>
            </div>

            {/* Participants */}
            <div className="bg-white rounded-2xl p-6 border border-forest/8">
              <h2 className="font-unbounded font-bold text-forest text-base mb-4">Участники</h2>
              <div className="space-y-3">
                {mockParticipants.slice(0, activity.currentParticipants).map((p) => (
                  <div key={p.name} className="flex items-center gap-3">
                    <div className={cn("w-9 h-9 rounded-full flex items-center justify-center text-cream text-sm font-bold", p.color)}>
                      {p.initial}
                    </div>
                    <div>
                      <div className="text-sm font-golos font-medium text-forest">{p.name}</div>
                      <div className="text-xs text-bark">Участник</div>
                    </div>
                    <div className="ml-auto flex items-center gap-1 text-amber-500 text-xs">
                      <Star size={12} fill="currentColor" />
                      <span className="text-bark">4.{Math.floor(Math.random() * 2) + 8}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Join card */}
            <div className="bg-white rounded-3xl border border-forest/10 p-6 sticky top-24">
              {/* Progress */}
              <div className="mb-5">
                <div className="flex justify-between text-xs text-bark mb-2">
                  <span className="flex items-center gap-1"><Users size={12} /> {activity.currentParticipants} участников</span>
                  <span className={isFull ? "text-red-600 font-semibold" : "text-sage font-semibold"}>
                    {isFull ? "Мест нет" : `${spotsLeft} свободных`}
                  </span>
                </div>
                <div className="h-2 bg-sand rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", isFull ? "bg-red-400" : "bg-mint")}
                    style={{ width: `${Math.round((activity.currentParticipants / activity.maxParticipants) * 100)}%` }}
                  />
                </div>
              </div>

              <button
                onClick={() => !isFull && setJoined(!joined)}
                className={cn(
                  "w-full py-4 rounded-2xl font-unbounded font-bold text-sm transition-all duration-200 active:scale-95",
                  joined
                    ? "bg-mint/20 text-sage border-2 border-mint"
                    : isFull
                    ? "bg-sand text-bark cursor-not-allowed"
                    : "bg-forest text-cream hover:bg-moss"
                )}
              >
                {joined ? "✓ Ты записан" : isFull ? "Мест нет" : "Записаться"}
              </button>

              {joined && (
                <p className="text-center text-xs text-sage mt-3 font-golos">
                  Организатор получил уведомление 🎉
                </p>
              )}
            </div>

            {/* Organizer */}
            <div className="bg-white rounded-3xl border border-forest/10 p-5">
              <div className="text-xs font-semibold text-bark uppercase tracking-wide mb-4">Организатор</div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-sage flex items-center justify-center text-cream font-bold text-lg">
                  {activity.creator.name[0]}
                </div>
                <div className="flex-1">
                  <div className="font-golos font-semibold text-forest text-sm">{activity.creator.name}</div>
                  <div className="flex items-center gap-1 text-amber-500 text-xs mt-0.5">
                    <Star size={11} fill="currentColor" />
                    <span className="text-bark">{activity.creator.rating.toFixed(1)}</span>
                  </div>
                </div>
                <Link
                  href={`/profile/${activity.creator.username}`}
                  className="text-xs text-sage hover:text-forest font-semibold flex items-center gap-0.5 transition-colors"
                >
                  Профиль <ChevronRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="font-unbounded font-bold text-forest text-xl mb-6">Похожие события</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((a) => (
                <Link key={a.id} href={`/activities/${a.id}`} className="card block group">
                  <div className="h-28 bg-forest flex items-center justify-center text-5xl">
                    {a.category.icon}
                  </div>
                  <div className="p-4">
                    <div className="font-unbounded font-bold text-forest text-sm group-hover:text-sage transition-colors line-clamp-2">{a.title}</div>
                    <div className="text-xs text-bark mt-2">{a.placeName}</div>
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
