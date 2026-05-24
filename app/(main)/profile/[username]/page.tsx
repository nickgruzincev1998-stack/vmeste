"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Star, Users, Calendar, Trophy, MapPin, ArrowLeft,
  Edit2, Check, X, Camera, UserPlus, UserCheck, Clock,
  MessageCircle, UserMinus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ActivityCard from "@/components/activity/ActivityCard";
import { cn } from "@/lib/utils";

const badges = [
  { icon: "🚴", label: "Cyclist",     desc: "5 велопрогулок" },
  { icon: "🔥", label: "On Fire",     desc: "Streak 7 дней" },
  { icon: "⭐", label: "5-Star Host", desc: "10 отзывов 5★" },
  { icon: "🤝", label: "Connector",  desc: "5 приглашений" },
];

export default function ProfilePage({ params }: { params: { username: string } }) {
  const { user: clerkUser } = useUser();
  const router = useRouter();
  const [dbUser, setDbUser]     = useState<any>(null);
  const [profileUser, setProfileUser] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [friends, setFriends]   = useState<any[]>([]);
  const [editing, setEditing]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatar, setAvatar]     = useState<string | null>(null);
  const [form, setForm]         = useState({ name: "", city: "", bio: "", age: "" });
  const [friendLoading, setFriendLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"events" | "friends">("events");
  const fileInputRef            = useRef<HTMLInputElement>(null);

  const isOwn = clerkUser && profileUser && dbUser?.username === params.username;

  useEffect(() => {
    // Always load current user for edit check
    fetch("/api/users/me")
      .then((r) => r.json())
      .then((data) => { if (!data.error) setDbUser(data); });

    // Load profile by username
    fetch(`/api/users/${params.username}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) return;
        setProfileUser(data);
        setAvatar(data.avatar || null);
        setForm({
          name: data.name || "",
          city: data.city || "",
          bio:  data.bio  || "",
          age:  data.age?.toString() || "",
        });
      });

    fetch("/api/activities")
      .then((r) => r.json())
      .then((data) => setActivities(Array.isArray(data) ? data.slice(0, 6) : []));
  }, [params.username]);

  useEffect(() => {
    if (isOwn) {
      fetch("/api/friends")
        .then((r) => r.json())
        .then((data) => setFriends(Array.isArray(data) ? data : []));
    }
  }, [isOwn]);

  async function handleSave() {
    setLoading(true);
    const res = await fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!data.error) {
      setProfileUser((prev: any) => ({ ...prev, ...data }));
      setDbUser(data);
      setEditing(false);
    }
    setLoading(false);
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/users/avatar", { method: "POST", body: formData });
      const data = await res.json();
      if (data.avatarUrl) setAvatar(data.avatarUrl);
      else alert("Ошибка загрузки: " + (data.error || "Неизвестная ошибка"));
    } catch {
      alert("Ошибка загрузки фото");
    } finally {
      setUploading(false);
    }
  }

  async function handleFriendAction() {
    if (!profileUser || !dbUser) return;
    setFriendLoading(true);
    const { friendshipStatus, friendshipId } = profileUser;

    try {
      if (!friendshipStatus) {
        // Send request
        const res = await fetch("/api/friends", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toUserId: profileUser.id }),
        });
        const data = await res.json();
        if (!data.error) setProfileUser((p: any) => ({ ...p, friendshipStatus: "pending", friendshipId: data.id }));
      } else if (friendshipStatus === "incoming") {
        // Accept
        await fetch(`/api/friends/${friendshipId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "accept" }),
        });
        setProfileUser((p: any) => ({ ...p, friendshipStatus: "accepted" }));
      } else if (friendshipStatus === "accepted" || friendshipStatus === "pending") {
        // Remove / cancel
        await fetch(`/api/friends/${friendshipId}`, { method: "DELETE" });
        setProfileUser((p: any) => ({ ...p, friendshipStatus: null, friendshipId: null }));
      }
    } finally {
      setFriendLoading(false);
    }
  }

  const displayName   = profileUser?.name  || "Пользователь";
  const displayCity   = profileUser?.city  || "Город не указан";
  const displayBio    = profileUser?.bio   || (isOwn ? "Расскажи о себе…" : "");
  const displayAvatar = avatar || clerkUser?.imageUrl;

  function FriendButton() {
    if (!profileUser || isOwn) return null;
    const { friendshipStatus } = profileUser;

    if (friendshipStatus === "accepted") {
      return (
        <div className="flex gap-2">
          <Link
            href={`/messages`}
            className="bg-mint text-forest font-golos font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-cream transition-colors flex items-center gap-2"
          >
            <MessageCircle size={14} /> Написать
          </Link>
          <button
            onClick={handleFriendAction}
            disabled={friendLoading}
            className="bg-white/10 text-cream font-golos text-sm px-4 py-2.5 rounded-full hover:bg-white/20 transition-colors flex items-center gap-2"
          >
            <UserMinus size={14} /> Удалить
          </button>
        </div>
      );
    }

    if (friendshipStatus === "pending") {
      return (
        <button
          onClick={handleFriendAction}
          disabled={friendLoading}
          className="bg-white/10 text-cream/60 font-golos text-sm px-5 py-2.5 rounded-full flex items-center gap-2 cursor-pointer hover:bg-white/20 transition-colors"
        >
          <Clock size={14} /> Заявка отправлена
        </button>
      );
    }

    if (friendshipStatus === "incoming") {
      return (
        <button
          onClick={handleFriendAction}
          disabled={friendLoading}
          className="bg-mint text-forest font-golos font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-cream transition-colors flex items-center gap-2"
        >
          <UserCheck size={14} /> Принять заявку
        </button>
      );
    }

    return (
      <button
        onClick={handleFriendAction}
        disabled={friendLoading}
        className="bg-mint text-forest font-golos font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-cream transition-colors flex items-center gap-2"
      >
        <UserPlus size={14} /> Добавить в друзья
      </button>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
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
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-mint flex items-center justify-center text-forest font-unbounded font-black text-4xl shadow-xl overflow-hidden">
                {displayAvatar ? (
                  <img src={displayAvatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  displayName[0]?.toUpperCase()
                )}
              </div>
              {isOwn && (
                <>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute -bottom-2 -right-2 w-8 h-8 bg-mint rounded-full flex items-center justify-center shadow-lg hover:bg-cream transition-colors"
                  >
                    {uploading ? (
                      <div className="w-3 h-3 border-2 border-forest border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Camera size={14} className="text-forest" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </>
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
                    Уровень {profileUser?.level || 1}
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
                  <Star key={i} size={14} fill={i < Math.round(profileUser?.rating || 5) ? "currentColor" : "none"} />
                ))}
                <span className="text-cream/60 text-xs ml-1">{profileUser?.rating?.toFixed(1) || "5.0"}</span>
              </div>
            </div>

            <div>
              {isOwn ? (
                editing ? (
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
                )
              ) : (
                <FriendButton />
              )}
            </div>
          </div>

          {editing ? (
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Расскажи о себе…"
              rows={3}
              className="w-full bg-white/10 text-cream/80 border border-white/20 rounded-xl px-4 py-3 text-sm mt-4 outline-none resize-none font-golos"
            />
          ) : displayBio ? (
            <p className="text-cream/65 text-sm mt-4 max-w-lg leading-relaxed font-golos">{displayBio}</p>
          ) : null}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-10 pb-12">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {[
            { icon: Calendar, num: activities.length.toString(), label: "событий" },
            { icon: Users,    num: `${(profileUser?._count?.friendsInitiated || 0) + (profileUser?._count?.friendsReceived || 0)}`, label: "друзей" },
            { icon: Trophy,   num: `${profileUser?.xp || 0}`, label: "XP" },
            { icon: Star,     num: profileUser?.rating?.toFixed(1) || "5.0", label: "рейтинг" },
          ].map(({ icon: Icon, num, label }) => (
            <div key={label} className="bg-white rounded-2xl p-4 text-center shadow-sm border border-forest/8">
              <Icon size={18} className="text-sage mx-auto mb-2" />
              <div className="font-unbounded font-black text-forest text-lg">{num}</div>
              <div className="text-bark text-xs mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* XP bar (own only) */}
        {isOwn && (
          <div className="bg-white rounded-2xl p-5 mb-6 border border-forest/8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-golos font-semibold text-forest">Уровень {profileUser?.level || 1}</span>
              <span className="text-xs text-bark">{profileUser?.xp || 0} XP</span>
            </div>
            <div className="h-2.5 bg-sand rounded-full overflow-hidden">
              <div className="h-full bg-mint rounded-full" style={{ width: `${Math.min(((profileUser?.xp || 0) % 1000) / 10, 100)}%` }} />
            </div>
          </div>
        )}

        {/* Achievements */}
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

        {/* Tabs: Events / Friends (own only) */}
        {isOwn && (
          <div className="flex gap-2 mb-5">
            <button
              onClick={() => setActiveTab("events")}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-golos font-semibold transition-colors",
                activeTab === "events" ? "bg-forest text-cream" : "bg-white text-bark border border-forest/10 hover:border-forest/30"
              )}
            >
              Мои события
            </button>
            <button
              onClick={() => setActiveTab("friends")}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-golos font-semibold transition-colors",
                activeTab === "friends" ? "bg-forest text-cream" : "bg-white text-bark border border-forest/10 hover:border-forest/30"
              )}
            >
              Друзья · {friends.length}
            </button>
          </div>
        )}

        {/* Events */}
        {(!isOwn || activeTab === "events") && (
          <div>
            {!isOwn && <h2 className="font-unbounded font-bold text-forest text-xl mb-5">События</h2>}
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
                <p className="text-bark text-sm mb-4">
                  {isOwn ? "Ты ещё не создавал событий" : "Пользователь ещё не создавал событий"}
                </p>
                {isOwn && (
                  <a href="/activities/create" className="btn-dark inline-flex text-sm">Создать первое событие</a>
                )}
              </div>
            )}
          </div>
        )}

        {/* Friends list */}
        {isOwn && activeTab === "friends" && (
          <div>
            {friends.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-forest/8">
                <Users size={40} className="text-bark/30 mx-auto mb-3" />
                <p className="text-bark text-sm">У тебя пока нет друзей. Добавляй людей через их профиль!</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {friends.map((friend) => (
                  <div key={friend.id} className="bg-white rounded-2xl p-4 border border-forest/8 flex items-center gap-3">
                    <Link href={`/profile/${friend.username}`}>
                      <div className="w-12 h-12 rounded-full bg-sage overflow-hidden flex-shrink-0 flex items-center justify-center text-cream font-bold">
                        {friend.avatar
                          ? <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" />
                          : friend.name[0]}
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/profile/${friend.username}`}>
                        <span className="font-golos font-semibold text-forest text-sm hover:underline">{friend.name}</span>
                      </Link>
                      {friend.city && (
                        <p className="text-xs text-bark flex items-center gap-1"><MapPin size={10} />{friend.city}</p>
                      )}
                    </div>
                    <Link
                      href="/messages"
                      className="w-8 h-8 bg-sand rounded-full flex items-center justify-center hover:bg-mint/20 transition-colors"
                      title="Написать"
                    >
                      <MessageCircle size={14} className="text-forest" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
