"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Calendar, MapPin, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Activity, Difficulty } from "@/types";

const difficultyLabel: Record<Difficulty, { label: string; cls: string }> = {
  beginner:     { label: "Новичок",     cls: "bg-green-100 text-green-800" },
  intermediate: { label: "Средний",     cls: "bg-yellow-100 text-yellow-800" },
  advanced:     { label: "Продвинутый", cls: "bg-red-100 text-red-800" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric", month: "long", weekday: "short",
  });
}

interface Props {
  activity: Activity;
  className?: string;
}

export default function ActivityCard({ activity, className }: Props) {
  const router = useRouter();
  const { isSignedIn } = useAuth();

  const spotsLeft = activity.maxParticipants - activity.currentParticipants;
  const isFull = spotsLeft <= 0;
  const pct = Math.round((activity.currentParticipants / activity.maxParticipants) * 100);
  const diff = difficultyLabel[activity.difficulty];

  function handleJoin(e: React.MouseEvent) {
    e.preventDefault();
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }
    router.push(`/activities/${activity.id}`);
  }

  return (
    <Link href={`/activities/${activity.id}`} className={cn("card block group", className)}>
      {/* Cover */}
      <div className="h-36 flex items-center justify-center bg-forest/90 relative overflow-hidden">
        <span className="text-6xl select-none">{activity.category.icon}</span>
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={cn("text-xs font-golos font-semibold px-2.5 py-1 rounded-full", activity.category.color)}>
            {activity.category.nameRu}
          </span>
          <span className={cn("text-xs font-golos font-semibold px-2.5 py-1 rounded-full", diff.cls)}>
            {diff.label}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="font-unbounded font-bold text-sm text-forest leading-snug mb-3 group-hover:text-sage transition-colors line-clamp-2">
          {activity.title}
        </h3>

        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-xs text-bark">
            <Calendar size={13} className="flex-shrink-0" />
            <span>{formatDate(activity.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-bark">
            <MapPin size={13} className="flex-shrink-0" />
            <span className="truncate">{activity.placeName}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-1 text-xs text-bark">
              <Users size={12} />
              <span>{activity.currentParticipants} из {activity.maxParticipants}</span>
            </div>
            <span className={cn("text-xs font-golos font-semibold", isFull ? "text-red-600" : "text-sage")}>
              {isFull ? "Мест нет" : `${spotsLeft} мест`}
            </span>
          </div>
          <div className="h-1.5 bg-sand rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", isFull ? "bg-red-400" : "bg-mint")}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-sage flex items-center justify-center text-cream text-xs font-bold">
              {activity.creator.name[0]}
            </div>
            <span className="text-xs text-bark truncate max-w-[100px]">{activity.creator.name}</span>
          </div>
          <button
            onClick={handleJoin}
            className={cn(
              "text-xs font-golos font-semibold px-3 py-1.5 rounded-full transition-colors",
              isFull
                ? "bg-sand text-bark cursor-not-allowed"
                : "bg-forest text-cream group-hover:bg-moss"
            )}
          >
            {isFull ? "Занято" : isSignedIn ? "Записаться" : "Войти"}
          </button>
        </div>
      </div>
    </Link>
  );
}