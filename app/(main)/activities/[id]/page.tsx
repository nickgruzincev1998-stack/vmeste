"use client";

import ChatRoom from "@/components/chat/ChatRoom";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, Users, Star, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { use } from "react";

const diffLabel: Record<string, { label: string; cls: string }> = {
  beginner:     { label: "Новичок",     cls: "bg-green-100 text-green-800" },
  intermediate: { label: "Средний",     cls: "bg-yellow-100 text-yellow-800" },
  advanced:     { label: "Продвинутый", cls: "bg-red-100 text-red-800" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", {
    weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
  });
}

export default function ActivityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [activity, setActivity] = useState<any>(null);
  const [loading, setLoading]   = useState(true);
  const [joined, setJoined]     = useState(false);
  const [joining, setJoining]   = useState(false);
  const [dbUserId, setDbUserId] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetch(`/api/activities/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) router.push("/feed");
        else setActivity(data);
      })
      .catch(() => router.push("/feed"))
      .finally(() => setLoading(false));

    if (isSignedIn) {
      fetch("/api/users/me")
        .then((r) => r.json())
        .then((data) => {
          if (data.id) setDbUserId(data.id);
        });
    }
  }, [id, isSignedIn]);

  async function handleJoin() {
    if (!isSignedIn) { router.push("/sign-in"); return; }
    if (!activity) return;

    setJoining(true);
    try {
      if (joined) {
        await fetch(`/api/activities/${id}`, { method: "POST" });
        setJoined(false);
        setActivity((prev: any) => ({
          ...prev,
          _count: { ...prev._count, participants: prev._count.participants - 1 },
        }));
      } else {
        const res = await fetch(`/api/activities/${id}`, { method: "POST" });
        const data = await res.json();
        if (data.joined !== undefined) {
          setJoined(data.joined);
          setActivity((prev: any) => ({
            ...prev,
            _count: { ...prev._count, participants: prev._count.participants + (data.joined ? 1 : -1) },
          }));
        } else {
          alert(data.error || "Ошибка");
        }
      }
    } finally {
      setJoining(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-sage border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-bark font-golos">Загрузка…</p>
        </div>
      </div>
    );
  }

  if (!activity) return null;

  const currentParticipants = activity._count?.participants ?? 0;
  const spotsLeft = activity.maxParticipants - currentParticipants;
  const isFull = spotsLeft <= 0;
  const diff = diffLabel[activity.difficulty] ?? { label: activity.difficulty, cls: "bg-gray-100 text-gray-800" };

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-forest py-4 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/feed" className="flex items-center gap-2 text-cream/70 hover:text-cream text-sm transition-colors font-golos">
            <ArrowLeft size={16} /> Назад к ленте
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 rounded-3xl bg-forest flex items-center justify-center relative overflow-hidden">
              <span className="text-8xl">{activity.category?.icon ?? "🎯"}</span>
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="text-xs font-golos font-semibold px-3 py-1.5 rounded-full bg-mint/20 text-sage">
                  {activity.category?.nameRu ?? "Активность"}
                </span>
                <span className={cn("text-xs font-golos font-semibold px-3 py-1.5 rounded-full", diff.cls)}>
                  {diff.label}
                </span>
              </div>
            </div>

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
                  <span>{currentParticipants} из {activity.maxParticipants} · {isFull ? "мест нет" : `осталось ${spotsLeft}`}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-forest/8">
              <h2 className="font-unbounded font-bold text-forest text-base mb-3">Описание</h2>
              <p className="text-bark leading-relaxed text-sm">{activity.description || "Описание не указано"}</p>
            </div>

            <ChatRoom
              activityId={activity.id}
              currentUserId={dbUserId}
              isParticipant={joined}
            />
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-3xl border border-forest/10 p-6 sticky top-24">
              <div className="mb-5">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-1 text-xs text-bark">
                    <Users size={12} /> {currentParticipants} участников
                  </div>
                  <span className={cn("text-xs font-golos font-semibold", isFull ? "text-red-600" : "text-sage")}>
                    {isFull ? "Мест нет" : `${spotsLeft} свободных`}
                  </span>
                </div>
                <div className="h-2 bg-sand rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", isFull ? "bg-red-400" : "bg-mint")}
                    style={{ width: `${Math.round((currentParticipants / activity.maxParticipants) * 100)}%` }}
                  />
                </div>
              </div>

              <button
                onClick={handleJoin}
                disabled={joining || (isFull && !joined)}
                className={cn(
                  "w-full py-4 rounded-2xl font-unbounded font-bold text-sm transition-all duration-200 active:scale-95 disabled:opacity-50",
                  joined
                    ? "bg-mint/20 text-sage border-2 border-mint"
                    : isFull
                    ? "bg-sand text-bark cursor-not-allowed"
                    : "bg-forest text-cream hover:bg-moss"
                )}
              >
                {joining ? "Загрузка…" : joined ? "✓ Ты записан" : isFull ? "Мест нет" : isSignedIn ? "Записаться" : "Войти чтобы записаться"}
              </button>

              {joined && (
                <p className="text-center text-xs text-sage mt-3 font-golos">
                  Организатор получил уведомление 🎉
                </p>
              )}
            </div>

            {activity.creator && (
              <div className="bg-white rounded-3xl border border-forest/10 p-5">
                <div className="text-xs font-semibold text-bark uppercase tracking-wide mb-4">Организатор</div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-sage flex items-center justify-center text-cream font-bold text-lg overflow-hidden">
                    {activity.creator.avatar ? (
                      <img src={activity.creator.avatar} alt={activity.creator.name} className="w-full h-full object-cover" />
                    ) : (
                      activity.creator.name[0]
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-golos font-semibold text-forest text-sm">{activity.creator.name}</div>
                    <div className="flex items-center gap-1 text-amber-500 text-xs mt-0.5">
                      <Star size={11} fill="currentColor" />
                      <span className="text-bark">{activity.creator.rating?.toFixed(1) ?? "5.0"}</span>
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}