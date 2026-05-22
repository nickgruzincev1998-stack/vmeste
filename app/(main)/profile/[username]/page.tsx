"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Star, Users, Calendar, Trophy, MapPin, ArrowLeft, Edit2, Check, X } from "lucide-react";
import Link from "next/link";
import ActivityCard from "@/components/activity/ActivityCard";
import { cn } from "@/lib/utils";

const badges = [
  { icon: "🚴", label: "Cyclist",    desc: "5 велопрогулок" },
  { icon: "🔥", label: "On Fire",    desc: "Streak 7 дней" },
  { icon: "⭐", label: "5-Star Host", desc: "10 отзывов 5★" },
  { icon: "🤝", label: "Connector",  desc: "5 приглашений" },
];

export default function ProfilePage({ params }: { params: { username: string } }) {
  const { user: clerkUser } = useUser();
  const [dbUser, setDbUser] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", city: "", bio: "", age: "" });

  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) {
          setDbUser(data);
          setForm({
            name: data.name || "",
            city: data.city || "",
            bio: data.bio || "",
            age: data.age?.toString() || "",
          });
        }
      });

    fetch("/api/activities")
      .then((r) => r.json())
      .then((data) => setActivities(Array.isArray(data) ? data.slice(0, 3) : []));
  }, []);

  async function handleSave() {
    setLoading(true);
    const res = await fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!data.error) {
      setDbUser(data);
      setEditing(false);
    }
    setLoading(false);
  }

  const displayName = dbUser?.name || clerkUser?.fullName || "Пользователь";
  const displayCity = dbUser?.city || "Город не указан";
  const displayBio  = dbUser?.bio  || "Расскажи о себе…";

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-forest text-cream pb-20 pt-8 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-sage/10 blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          <Link href="/feed" className="flex items-center gap-2 text-cream/60 hover:text-cream text-sm mb-6 transition-colors font-golos">
            <ArrowLeft size={15} /> Назад
          </Link>

          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-3xl bg-mint flex items-center justify-center text-forest font-unbounded font-black text-4xl shadow-xl overflow-hidden">
              {clerkUser?.imageUrl ? (
                <img src={clerkUser.imageUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                displayName[0]?.toUpperCase()
              )}
            </div>

            <div className="flex-1">
              {editing ? (
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="font-unbounded font-black text-2xl bg-white/10 text-cream border-b-2 border-mint outline-none mb-2 w-full"
                />
              ) : (
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="font-unbounded font-black text-2xl">{displayName}</h1>
                  <span className="bg-mint/20 text-mint text-xs font-semibold px-2.5 py-1 rounded-full">
                    Уровень {dbUser?.level || 1}
                  </span>
                </div>
              )}

              {editing ? (
                <input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="Твой город"
                  className="bg-white/10 text-cream/80 border-b border-white/30 outline-none text-sm mb-2 w-full"
                />
              ) : (
                <div className="flex items-center gap-1.5 text-cream/60 text-sm mb-2">
                  <MapPin size={13} /> {displayCity}
                </div>
              )}

              <div className="flex items-center gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} fill={i < Math.round(dbUser?.rating || 5) ? "currentColor" : "none"} />
                ))}
                <span className="text-cream/60 text-xs ml-1">{dbUser?.rating?.toFixed(1) || "5.0"}</span>
              </div>
            </div>

            {/* Edit buttons */}
            {editing ? (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-mint text-forest font-golos font-semibold text-sm px-4 py-2.5 rounded-full hover:bg-cream transition-colors flex items-center gap-1.5"
                >
                  <Check size={15} /> {loading ? "Сохраняем…" : "Сохранить"}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="bg-white/10 text-cream font-golos text-sm px-4 py-2.5 rounded-full hover:bg-white/20 transition-colors flex items-center gap-1.5"
                >
                  <X size={15} /> Отмена
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="bg-mint text-forest font-golos font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-cream transition-colors flex items-center gap-2"
              >
                <Edit2 size={14} /> Редактировать
              </button>
            )}
          </div>

          {/* Bio */}
          {editing ? (
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Расскажи о себе…"
              rows={3}
              className="w-full bg-white/10 text-cream/80 border border-white/20 rounded-xl px-4 py-3 text-sm mt-4 outline-none resize-none font-golos"
            />
          ) : (
            <p className="text-cream/65 text-sm mt-4 max-w-lg leading-relaxed font-golos">{displayBio}</p>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-10 pb-12">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {[
            { icon: Calendar, num: activities.length.toString(), label: "событий" },
            { icon: Users,    num: "0",   label: "подписчиков" },
            { icon: Trophy,   num: `${dbUser?.xp || 0}`, label: "XP" },
            { icon: Star,     num: dbUser?.rating?.toFixed(1) || "5.0", label: "рейтинг" },
          ].map(({ icon: Icon, num, label }) => (
            <div key={label} className="bg-white rounded-2xl p-4 text-center shadow-sm border border-forest/8">
              <Icon size={18} className="text-sage mx-auto mb-2" />
              <div className="font-unbounded font-black text-forest text-lg">{num}</div>
              <div className="text-bark text-xs mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* XP Bar */}
        <div className="bg-white rounded-2xl p-5 mb-6 border border-forest/8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-golos font-semibold text-forest">
              Уровень {dbUser?.level || 1}
            </span>
            <span className="text-xs text-bark">{dbUser?.xp || 0} XP</span>
          </div>
          <div className="h-2.5 bg-sand rounded-full overflow-hidden">
            <div className="h-full bg-mint rounded-full" style={{ width: `${Math.min(((dbUser?.xp || 0) % 1000) / 10, 100)}%` }} />
          </div>
        </div>

        {/* Badges */}
        <div className="bg-white rounded-2xl p-5 mb-6 border border-forest/8">
          <h2 className="font-unbounded font-bold text-forest text-base mb-4">Достижения</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {badges.map((b) => (
              <div key={b.label} className="flex items-center gap-3 p-3 bg-sand rounded-xl opacity-40">
                <span className="text-2xl">{b.icon}</span>
                <div>
                  <div className="font-golos font-semibold text-forest text-xs">{b.label}</div>
                  <div className="text-bark text-xs">{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-bark mt-3">Создавай события чтобы разблокировать достижения</p>
        </div>

        {/* Activities */}
        <div>
          <h2 className="font-unbounded font-bold text-forest text-xl mb-5">Мои события</h2>
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
            <div className="text-center py-12 bg-white rounded-2xl border border-forest/8">
              <div className="text-5xl mb-3">🎯</div>
              <p className="text-bark text-sm mb-4">Ты ещё не создавал событий</p>
              <a href="/activities/create" className="btn-dark inline-flex text-sm">Создать первое событие</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}