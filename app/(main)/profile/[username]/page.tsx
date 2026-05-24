"use client";

import { useState, useEffect, useRef, use } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Star, Users, Calendar, MapPin, ArrowLeft,
  Edit2, Check, X, Camera, MessageCircle,
  Shield, Swords, Flame, Crown, Trophy,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import FriendButton from "@/components/shared/FriendButton";

// ── Level system ──────────────────────────────────────────────────────────────

const LEVELS = [
  { level: 1, name: "Салага",        icon: Shield,  xpNeeded: 1000,  color: "from-slate-400 to-slate-500" },
  { level: 2, name: "Активист",      icon: Swords,  xpNeeded: 2500,  color: "from-emerald-400 to-teal-500" },
  { level: 3, name: "Гроза района",  icon: Flame,   xpNeeded: 5000,  color: "from-orange-400 to-red-500" },
  { level: 4, name: "Легенда",       icon: Crown,   xpNeeded: 10000, color: "from-yellow-400 to-amber-500" },
  { level: 5, name: "Чемпион",       icon: Trophy,  xpNeeded: Infinity, color: "from-violet-400 to-purple-600" },
];

function getLevelInfo(level: number, xp: number) {
  const cur  = LEVELS[Math.min(level - 1, LEVELS.length - 1)];
  const next = LEVELS[Math.min(level, LEVELS.length - 1)];
  const prevXp = level <= 1 ? 0 : LEVELS[level - 2].xpNeeded;
  const range  = cur.xpNeeded === Infinity ? 1 : cur.xpNeeded - prevXp;
  const progress = cur.xpNeeded === Infinity ? 100 : Math.min(((xp - prevXp) / range) * 100, 100);
  const xpLeft   = cur.xpNeeded === Infinity ? 0 : Math.max(cur.xpNeeded - xp, 0);
  return { cur, next, progress, xpLeft };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5 text-amber-400">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={size} fill={i < Math.round(rating) ? "currentColor" : "none"} />
      ))}
    </div>
  );
}

const diffLabel: Record<string, { label: string; cls: string }> = {
  beginner:     { label: "Новичок",     cls: "bg-emerald-500/20 text-emerald-300" },
  intermediate: { label: "Средний",     cls: "bg-amber-500/20 text-amber-300" },
  advanced:     { label: "Продвинутый", cls: "bg-red-500/20 text-red-300" },
};

function ActivityCard({ a }: { a: any }) {
  const diff = diffLabel[a.difficulty] ?? { label: a.difficulty, cls: "bg-white/10 text-cream/60" };
  const spots = a.maxParticipants - (a._count?.participants ?? 0);
  const isDone = a.status === "completed";
  return (
    <Link href={`/activities/${a.id}`}>
      <div className="group bg-white rounded-2xl border border-forest/8 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer">
        <div className="h-32 bg-forest relative flex items-center justify-center">
          <span className="text-5xl">{a.category?.icon ?? "🎯"}</span>
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
            <span className="text-[11px] font-golos font-semibold px-2 py-0.5 rounded-full bg-white/15 text-cream backdrop-blur-sm">
              {a.category?.nameRu ?? "Активность"}
            </span>
            <span className={cn("text-[11px] font-golos font-semibold px-2 py-0.5 rounded-full", diff.cls)}>
              {diff.label}
            </span>
          </div>
          {isDone && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-cream text-xs font-golos font-bold tracking-wider uppercase">Завершено</span>
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="font-unbounded font-bold text-forest text-sm mb-2 line-clamp-1 group-hover:text-sage transition-colors">
            {a.title}
          </div>
          <div className="flex items-center gap-1.5 text-bark text-xs mb-3 font-golos">
            <Calendar size={11} />
            {new Date(a.date).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" })}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-bark font-golos">
              <Users size={11} />
              <span>{a._count?.participants ?? 0}/{a.maxParticipants}</span>
            </div>
            {!isDone && (
              <span className={cn("text-xs font-golos font-medium", spots <= 0 ? "text-red-500" : "text-sage")}>
                {spots <= 0 ? "Мест нет" : `${spots} свободно`}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function computeAchievements(u: any) {
  const ac      = u._count?.activities ?? 0;
  const played  = u._count?.played ?? 0;
  const reviews = u._count?.reviewsReceived ?? 0;
  const friends = u.friendCount ?? 0;
  return [
    { icon: "🎯", label: "Организатор",   desc: "Создай 5 событий",   unlocked: ac >= 5,       progress: Math.min(ac, 5), max: 5 },
    { icon: "🏃", label: "Участник",      desc: "Сыграй 10 игр",      unlocked: played >= 10,  progress: Math.min(played, 10), max: 10 },
    { icon: "⭐", label: "5-Star Host",   desc: "10 отзывов 5★",      unlocked: reviews >= 10 && (u.rating ?? 0) >= 4.5, progress: Math.min(reviews, 10), max: 10 },
    { icon: "🤝", label: "Коннектор",     desc: "5 друзей",            unlocked: friends >= 5,  progress: Math.min(friends, 5), max: 5 },
    { icon: "🔥", label: "Ветеран",       desc: "10+ событий создано", unlocked: ac >= 10,      progress: Math.min(ac, 10), max: 10 },
    { icon: "👑", label: "Легенда",       desc: "Уровень 4",           unlocked: (u.level ?? 1) >= 4, progress: Math.min((u.level ?? 1), 4), max: 4 },
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
  const [activeTab, setActiveTab] = useState<"created" | "played">("created");

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ name: "", city: "", bio: "", age: "" });
  const fileRef = useRef<HTMLInputElement>(null);

  const isOwn = !!myUsername && myUsername === username;

  useEffect(() => {
    if (!clerkUser) return;
    fetch("/api/users/me")
      .then(r => r.json())
      .then(d => { if (d.username) setMyUsername(d.username); });
  }, [clerkUser]);

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
        <div className="text-6xl">🤷</div>
        <p className="font-unbounded font-bold text-forest text-xl">Пользователь не найден</p>
        <Link href="/feed" className="btn-dark text-sm">На главную</Link>
      </div>
    );
  }

  const lvl = profile.level ?? 1;
  const xp  = profile.xp ?? 0;
  const { cur: curLevel, progress: xpProgress, xpLeft } = getLevelInfo(lvl, xp);
  const LevelIcon = curLevel.icon;
  const achievements = computeAchievements(profile);
  const actCount    = profile._count?.activities ?? 0;
  const playedCount = profile._count?.played ?? 0;
  const reviewCount = profile._count?.reviewsReceived ?? 0;
  const friendCount = profile.friendCount ?? 0;

  return (
    <div className="min-h-screen bg-[#f0ebe1]">

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <div className="bg-forest relative overflow-hidden">
        {/* decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-mint/8 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full bg-sage/10 blur-2xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-8 relative z-10">

          {/* Back */}
          <Link href="/feed" className="inline-flex items-center gap-1.5 text-cream/50 hover:text-cream text-sm transition-colors font-golos mb-6">
            <ArrowLeft size={14} /> Назад
          </Link>

          <div className="flex flex-col sm:flex-row gap-6 items-start">

            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-mint to-sage flex items-center justify-center text-forest font-unbounded font-black text-5xl overflow-hidden shadow-2xl ring-4 ring-white/10">
                {profile.avatar
                  ? <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                  : <span>{profile.name?.[0]?.toUpperCase()}</span>}
              </div>
              {/* Level badge */}
              <div className={cn(
                "absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1 rounded-full text-white text-xs font-golos font-bold shadow-lg bg-gradient-to-r whitespace-nowrap",
                curLevel.color
              )}>
                <LevelIcon size={11} />
                {curLevel.name}
              </div>
              {isOwn && (
                <>
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-mint rounded-full flex items-center justify-center shadow-lg hover:bg-cream transition-colors"
                  >
                    {uploading
                      ? <div className="w-3 h-3 border-2 border-forest border-t-transparent rounded-full animate-spin" />
                      : <Camera size={13} className="text-forest" />}
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 mt-2">
              {editing ? (
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="font-unbounded font-black text-2xl bg-white/10 text-cream border-b-2 border-mint outline-none mb-3 w-full"
                />
              ) : (
                <h1 className="font-unbounded font-black text-cream text-2xl sm:text-3xl leading-tight mb-2">
                  {profile.name}
                  {profile.age ? <span className="text-cream/40 font-golos font-normal text-base ml-3">{profile.age} лет</span> : null}
                </h1>
              )}

              {editing ? (
                <input
                  value={form.city}
                  onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                  placeholder="Твой город"
                  className="bg-white/10 text-cream/80 border-b border-white/30 outline-none text-sm mb-3 w-64 font-golos"
                />
              ) : (
                <div className="flex items-center gap-1.5 text-cream/50 text-sm mb-3 font-golos">
                  <MapPin size={13} />
                  {profile.city || "Город не указан"}
                </div>
              )}

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <StarRow rating={profile.rating ?? 5} size={16} />
                <span className="text-cream font-golos font-semibold">{profile.rating?.toFixed(1) ?? "5.0"}</span>
                {reviewCount > 0 && (
                  <span className="text-cream/40 text-xs font-golos">· {reviewCount} отзывов</span>
                )}
              </div>

              {/* Bio */}
              {editing ? (
                <div className="space-y-2">
                  <textarea
                    value={form.bio}
                    onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                    placeholder="Расскажи о себе, своём опыте в спорте, достижениях…"
                    rows={3}
                    className="w-full bg-white/10 text-cream/80 border border-white/20 rounded-xl px-4 py-3 text-sm outline-none resize-none font-golos"
                  />
                  <input
                    type="number"
                    value={form.age}
                    onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                    placeholder="Возраст"
                    className="w-28 bg-white/10 text-cream/80 border border-white/20 rounded-xl px-3 py-2 text-sm outline-none font-golos"
                  />
                </div>
              ) : profile.bio ? (
                <p className="text-cream/60 text-sm leading-relaxed font-golos max-w-xl">{profile.bio}</p>
              ) : isOwn ? (
                <button onClick={() => setEditing(true)} className="text-cream/30 text-sm font-golos hover:text-cream/60 transition-colors italic">
                  + Расскажи о себе и своём опыте в спорте…
                </button>
              ) : null}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 flex-wrap flex-shrink-0">
              {isOwn ? (
                editing ? (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-mint text-forest font-golos font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-cream transition-colors flex items-center gap-1.5"
                    >
                      <Check size={14} /> {saving ? "Сохранение…" : "Сохранить"}
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="bg-white/10 text-cream font-golos text-sm px-4 py-2.5 rounded-full hover:bg-white/20 transition-colors flex items-center gap-1.5"
                    >
                      <X size={14} /> Отмена
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditing(true)}
                    className="bg-mint text-forest font-golos font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-cream transition-colors flex items-center gap-2"
                  >
                    <Edit2 size={13} /> Редактировать
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

          {/* ── Stats strip ── */}
          <div className="mt-8 grid grid-cols-4 divide-x divide-white/10 border border-white/10 rounded-2xl overflow-hidden bg-white/5 backdrop-blur-sm">
            {[
              { num: actCount,      label: "создал" },
              { num: playedCount,   label: "сыграл" },
              { num: friendCount,   label: "друзей" },
              { num: reviewCount,   label: "отзывов" },
            ].map(({ num, label }) => (
              <div key={label} className="py-4 text-center">
                <div className="font-unbounded font-black text-cream text-xl sm:text-2xl leading-none">{num}</div>
                <div className="text-cream/45 text-xs mt-1.5 font-golos">{label}</div>
              </div>
            ))}
          </div>

          {/* ── XP bar ── */}
          <div className="mt-4 bg-white/5 border border-white/10 rounded-2xl px-5 py-4">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <div className={cn("w-7 h-7 rounded-full bg-gradient-to-br flex items-center justify-center", curLevel.color)}>
                  <LevelIcon size={14} className="text-white" />
                </div>
                <span className="font-golos font-bold text-cream text-sm">{curLevel.name}</span>
                <span className="text-cream/30 text-xs font-golos">ур. {lvl}</span>
              </div>
              <span className="text-cream/45 text-xs font-golos">
                {curLevel.xpNeeded === Infinity
                  ? `${xp} XP · Макс. уровень`
                  : `ещё ${xpLeft} XP до «${LEVELS[Math.min(lvl, LEVELS.length - 1)].name}»`}
              </span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-700", curLevel.color)}
                style={{ width: `${xpProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── BODY ─────────────────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-16 space-y-6">

        {/* ── Achievements ── */}
        <section className="bg-white rounded-3xl border border-forest/8 p-5 sm:p-6">
          <h2 className="font-unbounded font-bold text-forest text-base mb-4">Достижения</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {achievements.map((a) => (
              <div
                key={a.label}
                className={cn(
                  "relative p-4 rounded-2xl border transition-all",
                  a.unlocked
                    ? "bg-gradient-to-br from-mint/15 to-sage/10 border-mint/30 shadow-sm"
                    : "bg-[#f8f5ee] border-forest/6 opacity-60"
                )}
              >
                {a.unlocked && (
                  <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-mint" />
                )}
                <div className="text-2xl mb-2">{a.icon}</div>
                <div className="font-golos font-bold text-forest text-sm">{a.label}</div>
                <div className="text-bark text-xs mt-0.5 font-golos">{a.desc}</div>
                {!a.unlocked && (
                  <div className="mt-2.5 h-1 bg-forest/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sage/50 rounded-full"
                      style={{ width: `${(a.progress / a.max) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── Events (tabs) ── */}
        <section className="bg-white rounded-3xl border border-forest/8 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-unbounded font-bold text-forest text-base">События</h2>
            <div className="flex bg-[#f0ebe1] rounded-xl p-1 gap-1">
              {([
                { key: "created", label: `Создал (${actCount})` },
                { key: "played",  label: `Сыграл (${playedCount})` },
              ] as const).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-golos font-semibold transition-all",
                    activeTab === key
                      ? "bg-forest text-cream shadow-sm"
                      : "text-bark hover:text-forest"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {activeTab === "created" ? (
            profile.activities?.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {profile.activities.map((a: any) => <ActivityCard key={a.id} a={a} />)}
              </div>
            ) : (
              <EmptyEvents isOwn={isOwn} type="created" />
            )
          ) : (
            profile.playedActivities?.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {profile.playedActivities.map((a: any) => <ActivityCard key={a.id} a={a} />)}
              </div>
            ) : (
              <EmptyEvents isOwn={isOwn} type="played" />
            )
          )}
        </section>

        {/* ── Reviews ── */}
        {profile.reviewsReceived?.length > 0 && (
          <section className="bg-white rounded-3xl border border-forest/8 p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-unbounded font-bold text-forest text-base">Отзывы</h2>
              <div className="flex items-center gap-2">
                <StarRow rating={profile.rating ?? 5} size={15} />
                <span className="font-unbounded font-bold text-forest text-sm">{profile.rating?.toFixed(1)}</span>
              </div>
            </div>
            <div className="space-y-3">
              {profile.reviewsReceived.map((r: any) => (
                <div key={r.id} className="flex gap-3">
                  <Link href={`/profile/${r.reviewer.username}`} className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-sage overflow-hidden flex items-center justify-center text-cream font-bold text-sm ring-2 ring-forest/10">
                      {r.reviewer.avatar
                        ? <img src={r.reviewer.avatar} alt={r.reviewer.name} className="w-full h-full object-cover" />
                        : r.reviewer.name?.[0]}
                    </div>
                  </Link>
                  <div className="flex-1 bg-[#f8f5ee] rounded-2xl px-4 py-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <Link href={`/profile/${r.reviewer.username}`}>
                        <span className="font-golos font-semibold text-forest text-sm hover:underline">{r.reviewer.name}</span>
                      </Link>
                      <StarRow rating={r.rating} size={12} />
                    </div>
                    {r.comment && (
                      <p className="text-bark text-sm leading-relaxed font-golos">{r.comment}</p>
                    )}
                    <p className="text-bark/40 text-xs font-golos mt-1.5">
                      {new Date(r.createdAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function EmptyEvents({ isOwn, type }: { isOwn: boolean; type: "created" | "played" }) {
  return (
    <div className="text-center py-12">
      <div className="text-5xl mb-3">{type === "created" ? "🎯" : "🏃"}</div>
      <p className="text-bark text-sm font-golos mb-4">
        {type === "created"
          ? isOwn ? "Ты ещё не создавал событий" : "Пользователь ещё не создавал событий"
          : isOwn ? "Ты ещё не участвовал в событиях" : "Пользователь ещё не участвовал в событиях"}
      </p>
      {isOwn && type === "created" && (
        <Link href="/activities/create" className="btn-dark inline-flex text-sm">
          Создать первое событие
        </Link>
      )}
    </div>
  );
}
