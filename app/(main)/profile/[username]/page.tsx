"use client";

import { useState, useEffect, useRef, use } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Star, Users, Calendar, Trophy, MapPin, ArrowLeft,
  Edit2, Check, X, Camera, UserPlus, UserCheck, Clock,
  MessageCircle, UserMinus, Quote, ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import FriendButton from "@/components/shared/FriendButton";

// ── helpers ──────────────────────────────────────────────────────────────────

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5 text-amber-400">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={size} fill={i < Math.round(rating) ? "currentColor" : "none"} />
      ))}
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

const diffLabel: Record<string, { label: string; cls: string }> = {
  beginner:     { label: "Новичок",     cls: "bg-green-100 text-green-700" },
  intermediate: { label: "Средний",     cls: "bg-yellow-100 text-yellow-700" },
  advanced:     { label: "Продвинутый", cls: "bg-red-100 text-red-700" },
};

// Dynamic achievements based on real stats
function computeAchievements(u: any) {
  const ac = u._count?.activities ?? 0;
  const reviews = u._count?.reviewsReceived ?? 0;
  const friends = u.friendCount ?? 0;

  return [
    {
      icon: "🎯", label: "Организатор",
      desc: `${ac} событий создано`,
      unlocked: ac >= 1,
      progress: Math.min(ac, 5), max: 5,
    },
    {
      icon: "⭐", label: "5-Star Host",
      desc: "10 отзывов 5★",
      unlocked: reviews >= 10 && (u.rating ?? 0) >= 4.5,
      progress: Math.min(reviews, 10), max: 10,
    },
    {
      icon: "🤝", label: "Коннектор",
      desc: "5 друзей",
      unlocked: friends >= 5,
      progress: Math.min(friends, 5), max: 5,
    },
    {
      icon: "🔥", label: "Ветеран",
      desc: "10+ событий",
      unlocked: ac >= 10,
      progress: Math.min(ac, 10), max: 10,
    },
  ];
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const { user: clerkUser } = useUser();
  const [myUsername, setMyUsername] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Edit state (own profile only)
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ name: "", city: "", bio: "", age: "" });
  const fileRef = useRef<HTMLInputElement>(null);

  const isOwn = !!myUsername && myUsername === username;

  // Load my username (to know if this is own profile)
  useEffect(() => {
    if (!clerkUser) return;
    fetch("/api/users/me")
      .then(r => r.json())
      .then(d => { if (d.username) setMyUsername(d.username); });
  }, [clerkUser]);

  // Load the viewed profile
  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    fetch(`/api/users/${username}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setNotFound(true); return; }
        setProfile(d);
        setForm({ name: d.name ?? "", city: d.city ?? "", bio: d.bio ?? "", age: d.age?.toString() ?? "" });
      })
      .finally(() => setLoading(false));
  }, [username]);

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!data.error) {
      setProfile((p: any) => ({ ...p, ...data }));
      setEditing(false);
    }
    setSaving(false);
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/users/avatar", { method: "POST", body: fd });
    const data = await res.json();
    if (data.avatarUrl) setProfile((p: any) => ({ ...p, avatar: data.avatarUrl }));
    setUploading(false);
  }

  // ── loading / not found ──────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-sage border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-4">
        <div className="text-5xl">🤷</div>
        <p className="font-unbounded font-bold text-forest text-xl">Пользователь не найден</p>
        <Link href="/feed" className="btn-dark text-sm">На главную</Link>
      </div>
    );
  }

  const achievements = computeAchievements(profile);
  const friendCount = profile.friendCount ?? 0;
  const actCount = profile._count?.activities ?? 0;

  // ── render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-cream">

      {/* ── Hero ── */}
      <div className="bg-forest text-cream pb-24 pt-8 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-sage/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-mint/5 blur-2xl" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <Link href="/feed" className="inline-flex items-center gap-2 text-cream/60 hover:text-cream text-sm mb-8 transition-colors font-golos">
            <ArrowLeft size={15} /> Назад
          </Link>

          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">

            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-28 h-28 rounded-3xl bg-mint flex items-center justify-center text-forest font-unbounded font-black text-5xl shadow-2xl overflow-hidden ring-4 ring-white/10">
                {profile.avatar
                  ? <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                  : profile.name?.[0]?.toUpperCase()}
              </div>
              {isOwn && (
                <>
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="absolute -bottom-2 -right-2 w-9 h-9 bg-mint rounded-full flex items-center justify-center shadow-lg hover:bg-cream transition-colors"
                  >
                    {uploading
                      ? <div className="w-3.5 h-3.5 border-2 border-forest border-t-transparent rounded-full animate-spin" />
                      : <Camera size={15} className="text-forest" />}
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              {editing ? (
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="font-unbounded font-black text-2xl bg-white/10 text-cream border-b-2 border-mint outline-none mb-2 w-full"
                />
              ) : (
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <h1 className="font-unbounded font-black text-2xl leading-tight">{profile.name}</h1>
                  <span className="bg-mint/20 text-mint text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">
                    Уровень {profile.level}
                  </span>
                  {profile.age && (
                    <span className="text-cream/50 text-sm font-golos">{profile.age} лет</span>
                  )}
                </div>
              )}

              {editing ? (
                <input
                  value={form.city}
                  onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                  placeholder="Твой город"
                  className="bg-white/10 text-cream/80 border-b border-white/30 outline-none text-sm mb-2 w-full font-golos"
                />
              ) : (
                <div className="flex items-center gap-1.5 text-cream/60 text-sm mb-3 font-golos">
                  <MapPin size={13} />
                  {profile.city || "Город не указан"}
                </div>
              )}

              <div className="flex items-center gap-2">
                <StarRow rating={profile.rating ?? 5} />
                <span className="text-cream/50 text-sm font-golos">{profile.rating?.toFixed(1) ?? "5.0"}</span>
                {profile._count?.reviewsReceived > 0 && (
                  <span className="text-cream/40 text-xs font-golos">· {profile._count.reviewsReceived} отзывов</span>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 flex-wrap">
              {isOwn ? (
                editing ? (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-mint text-forest font-golos font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-cream transition-colors flex items-center gap-1.5"
                    >
                      <Check size={15} /> {saving ? "Сохранение…" : "Сохранить"}
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="bg-white/10 text-cream font-golos text-sm px-4 py-2.5 rounded-full hover:bg-white/20 transition-colors flex items-center gap-1.5"
                    >
                      <X size={15} /> Отмена
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditing(true)}
                    className="bg-mint text-forest font-golos font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-cream transition-colors flex items-center gap-2"
                  >
                    <Edit2 size={14} /> Редактировать
                  </button>
                )
              ) : (
                <>
                  {profile.friendshipStatus === "accepted" && (
                    <Link
                      href="/messages"
                      className="bg-mint text-forest font-golos font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-cream transition-colors flex items-center gap-2"
                    >
                      <MessageCircle size={14} /> Написать
                    </Link>
                  )}
                  {clerkUser && (
                    <FriendButton
                      userId={profile.id}
                      initialStatus={profile.friendshipStatus}
                      initialFriendshipId={profile.friendshipId}
                      size="md"
                    />
                  )}
                </>
              )}
            </div>
          </div>

          {/* Bio */}
          {editing ? (
            <div className="mt-5 space-y-3">
              <textarea
                value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                placeholder="Расскажи о себе, своём опыте в спорте, достижениях…"
                rows={4}
                className="w-full bg-white/10 text-cream/80 border border-white/20 rounded-xl px-4 py-3 text-sm outline-none resize-none font-golos"
              />
              <input
                type="number"
                value={form.age}
                onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                placeholder="Возраст"
                className="w-32 bg-white/10 text-cream/80 border border-white/20 rounded-xl px-4 py-2 text-sm outline-none font-golos"
              />
            </div>
          ) : profile.bio ? (
            <p className="text-cream/65 text-sm mt-5 max-w-2xl leading-relaxed font-golos whitespace-pre-wrap">{profile.bio}</p>
          ) : isOwn ? (
            <button onClick={() => setEditing(true)} className="mt-5 text-cream/40 text-sm font-golos hover:text-cream/70 transition-colors italic">
              + Расскажи о себе и своём опыте в спорте…
            </button>
          ) : null}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-14 pb-16 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: Calendar, num: actCount.toString(), label: "событий" },
            { icon: Users,    num: friendCount.toString(), label: "друзей" },
            { icon: Trophy,   num: `${profile.xp ?? 0}`, label: "XP" },
            { icon: Star,     num: profile.rating?.toFixed(1) ?? "5.0", label: "рейтинг" },
          ].map(({ icon: Icon, num, label }) => (
            <div key={label} className="bg-white rounded-2xl p-4 text-center shadow-sm border border-forest/8">
              <Icon size={18} className="text-sage mx-auto mb-2" />
              <div className="font-unbounded font-black text-forest text-xl">{num}</div>
              <div className="text-bark text-xs mt-0.5 font-golos">{label}</div>
            </div>
          ))}
        </div>

        {/* XP bar (own only) */}
        {isOwn && (
          <div className="bg-white rounded-2xl p-5 border border-forest/8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-golos font-semibold text-forest">Уровень {profile.level}</span>
              <span className="text-xs text-bark font-golos">{profile.xp ?? 0} / {((profile.level ?? 1)) * 1000} XP</span>
            </div>
            <div className="h-2.5 bg-sand rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-mint to-sage rounded-full transition-all"
                style={{ width: `${Math.min(((profile.xp ?? 0) % 1000) / 10, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Achievements */}
        <div className="bg-white rounded-2xl p-5 border border-forest/8">
          <h2 className="font-unbounded font-bold text-forest text-base mb-4">Достижения</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {achievements.map((a) => (
              <div
                key={a.label}
                className={cn(
                  "p-4 rounded-2xl border transition-all",
                  a.unlocked
                    ? "bg-mint/10 border-mint/30"
                    : "bg-sand border-transparent opacity-50"
                )}
              >
                <div className="text-2xl mb-2">{a.icon}</div>
                <div className="font-golos font-bold text-forest text-sm">{a.label}</div>
                <div className="text-bark text-xs mt-0.5">{a.desc}</div>
                {!a.unlocked && (
                  <div className="mt-2 h-1 bg-white/60 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sage/40 rounded-full"
                      style={{ width: `${(a.progress / a.max) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Reviews */}
        {profile.reviewsReceived?.length > 0 && (
          <div className="bg-white rounded-2xl p-5 border border-forest/8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-unbounded font-bold text-forest text-base">Отзывы</h2>
              <div className="flex items-center gap-2">
                <StarRow rating={profile.rating ?? 5} size={16} />
                <span className="font-unbounded font-bold text-forest text-sm">{profile.rating?.toFixed(1)}</span>
              </div>
            </div>
            <div className="space-y-4">
              {profile.reviewsReceived.map((r: any) => (
                <div key={r.id} className="flex gap-3">
                  <Link href={`/profile/${r.reviewer.username}`} className="flex-shrink-0">
                    <div className="w-9 h-9 rounded-full bg-sage overflow-hidden flex items-center justify-center text-cream font-bold text-sm">
                      {r.reviewer.avatar
                        ? <img src={r.reviewer.avatar} alt={r.reviewer.name} className="w-full h-full object-cover" />
                        : r.reviewer.name[0]}
                    </div>
                  </Link>
                  <div className="flex-1 bg-sand rounded-2xl px-4 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <Link href={`/profile/${r.reviewer.username}`}>
                        <span className="font-golos font-semibold text-forest text-sm hover:underline">{r.reviewer.name}</span>
                      </Link>
                      <StarRow rating={r.rating} size={12} />
                    </div>
                    {r.comment && (
                      <p className="text-bark text-sm leading-relaxed font-golos">{r.comment}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Events */}
        <div>
          <h2 className="font-unbounded font-bold text-forest text-xl mb-5">
            {isOwn ? "Мои события" : "События"}
          </h2>

          {profile.activities?.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {profile.activities.map((a: any) => {
                const diff = diffLabel[a.difficulty] ?? { label: a.difficulty, cls: "bg-gray-100 text-gray-600" };
                const spots = a.maxParticipants - (a._count?.participants ?? 0);
                return (
                  <Link key={a.id} href={`/activities/${a.id}`}>
                    <div className="bg-white rounded-2xl border border-forest/8 overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer">
                      <div className="h-28 bg-forest flex items-center justify-center relative">
                        <span className="text-5xl">{a.category?.icon ?? "🎯"}</span>
                        <div className="absolute top-3 left-3 flex gap-1.5">
                          <span className="text-xs font-golos font-semibold px-2.5 py-1 rounded-full bg-white/20 text-cream">
                            {a.category?.nameRu ?? "Активность"}
                          </span>
                          <span className={cn("text-xs font-golos font-semibold px-2.5 py-1 rounded-full", diff.cls)}>
                            {diff.label}
                          </span>
                        </div>
                        {a.status === "completed" && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="text-white text-xs font-golos font-semibold">Завершено</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="font-unbounded font-bold text-forest text-sm mb-2 line-clamp-1">{a.title}</div>
                        <div className="flex items-center gap-1.5 text-bark text-xs mb-1 font-golos">
                          <Calendar size={11} />
                          {new Date(a.date).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1 text-xs text-bark font-golos">
                            <Users size={11} />
                            {a._count?.participants ?? 0}/{a.maxParticipants}
                          </div>
                          <span className={cn("text-xs font-golos", spots <= 0 ? "text-red-500" : "text-sage")}>
                            {spots <= 0 ? "Мест нет" : `${spots} мест`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-14 bg-white rounded-2xl border border-forest/8">
              <div className="text-5xl mb-3">🎯</div>
              <p className="text-bark text-sm mb-4 font-golos">
                {isOwn ? "Ты ещё не создавал событий" : "Пользователь ещё не создавал событий"}
              </p>
              {isOwn && (
                <Link href="/activities/create" className="btn-dark inline-flex text-sm">
                  Создать первое событие
                </Link>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
