"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { MessageCircle, UserCheck, Clock, X, Search, ArrowLeft, MapPin } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import DirectChat from "@/components/chat/DirectChat";
import FriendButton from "@/components/shared/FriendButton";

interface Friend {
  id: string;
  username: string;
  name: string;
  avatar: string | null;
  city: string | null;
}

interface Conversation {
  partner: Friend;
  lastMessage: { content: string; sentAt: string; senderId: string };
  unreadCount: number;
}

interface FriendRequest {
  id: string;
  requester: Friend;
  createdAt: string;
}

interface SearchResult {
  id: string;
  username: string;
  name: string;
  avatar: string | null;
  city: string | null;
  friendshipStatus: string | null;
  friendshipId: string | null;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "только что";
  if (mins < 60) return `${mins} мин`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ч`;
  return `${Math.floor(hrs / 24)} д`;
}

function Avatar({ user, size = 48, onClick }: { user: { name: string; avatar: string | null }; size?: number; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{ width: size, height: size }}
      className={cn(
        "rounded-full bg-sage flex-shrink-0 overflow-hidden flex items-center justify-center text-cream font-bold",
        onClick && "cursor-pointer"
      )}
    >
      {user.avatar
        ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
        : <span style={{ fontSize: size * 0.38 }}>{user.name[0]}</span>}
    </div>
  );
}

export default function MessagesPage() {
  const { user: clerkUser, isLoaded } = useUser();
  const [dbUser, setDbUser] = useState<any>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [activePartner, setActivePartner] = useState<Friend | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [tab, setTab] = useState<"chats" | "requests">("chats");
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/users/me").then(r => r.json()).then(d => { if (!d.error) setDbUser(d); });
    fetchFriends();
    fetchConversations();
    fetchRequests();
  }, []);

  function fetchFriends() {
    fetch("/api/friends").then(r => r.json()).then(d => setFriends(Array.isArray(d) ? d : []));
  }

  function fetchConversations() {
    fetch("/api/dm").then(r => r.json()).then(d => setConversations(Array.isArray(d) ? d : []));
  }

  function fetchRequests() {
    fetch("/api/friends/requests").then(r => r.json()).then(d => setRequests(Array.isArray(d) ? d : []));
  }

  function handleSearchInput(value: string) {
    setSearchQuery(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!value.trim()) { setSearchResults([]); return; }
    setSearching(true);
    searchTimeout.current = setTimeout(async () => {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(value.trim())}`);
      const data = await res.json();
      setSearchResults(Array.isArray(data) ? data : []);
      setSearching(false);
    }, 300);
  }

  async function handleRequest(id: string, action: "accept" | "reject") {
    setLoadingAction(id);
    await fetch(`/api/friends/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    fetchRequests();
    fetchFriends();
    fetchConversations();
    setLoadingAction(null);
  }

  function openChat(partner: Friend) {
    setActivePartner(partner);
    setSearchQuery("");
    setSearchResults([]);
    setTimeout(fetchConversations, 1000);
  }

  if (!isLoaded) return null;

  if (!clerkUser) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <p className="text-bark mb-4">Войди чтобы видеть сообщения</p>
          <Link href="/sign-in" className="btn-dark">Войти</Link>
        </div>
      </div>
    );
  }

  const totalUnread = conversations.reduce((s, c) => s + c.unreadCount, 0);

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Page header */}
        <div className="flex items-center gap-4 mb-6">
          <h1 className="font-unbounded font-black text-forest text-2xl flex-1">Сообщения</h1>
          {requests.length > 0 && (
            <button
              onClick={() => setTab(tab === "requests" ? "chats" : "requests")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-golos font-semibold transition-colors",
                tab === "requests"
                  ? "bg-forest text-cream"
                  : "bg-white border border-forest/10 text-forest hover:border-forest/30"
              )}
            >
              <UserCheck size={15} />
              Заявки
              <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {requests.length}
              </span>
            </button>
          )}
        </div>

        {/* ── Friend requests panel ── */}
        {tab === "requests" && (
          <div className="bg-white rounded-2xl border border-forest/8 mb-6 overflow-hidden">
            <div className="px-5 py-3 border-b border-forest/8 flex items-center justify-between">
              <span className="font-golos font-semibold text-forest text-sm">Входящие заявки</span>
              <button onClick={() => setTab("chats")} className="text-bark/50 hover:text-bark"><X size={16} /></button>
            </div>
            {requests.map((req) => (
              <div key={req.id} className="flex items-center gap-3 p-4 border-b border-forest/5 last:border-0">
                <Link href={`/profile/${req.requester.username}`}>
                  <Avatar user={req.requester} size={44} />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/profile/${req.requester.username}`}>
                    <span className="font-golos font-semibold text-forest text-sm hover:underline">{req.requester.name}</span>
                  </Link>
                  <p className="text-xs text-bark"><Clock size={10} className="inline mr-1" />{timeAgo(req.createdAt)} назад</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRequest(req.id, "accept")}
                    disabled={loadingAction === req.id}
                    className="px-4 py-2 bg-forest text-cream rounded-full text-xs font-golos font-semibold hover:bg-moss transition-colors disabled:opacity-50"
                  >
                    Принять
                  </button>
                  <button
                    onClick={() => handleRequest(req.id, "reject")}
                    disabled={loadingAction === req.id}
                    className="px-4 py-2 bg-sand text-bark rounded-full text-xs font-golos font-semibold hover:bg-sand/70 transition-colors disabled:opacity-50"
                  >
                    Отклонить
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-4 h-[calc(100vh-200px)] min-h-[520px]">

          {/* ── Left panel ── */}
          <div className="w-80 flex-shrink-0 flex flex-col gap-3">

            {/* Search */}
            <div className="bg-white rounded-2xl border border-forest/8 p-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-bark/50" />
                <input
                  ref={searchRef}
                  value={searchQuery}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  placeholder="Найти людей или друзей…"
                  className="w-full pl-8 pr-8 py-2.5 bg-sand rounded-xl text-sm font-golos outline-none focus:ring-2 focus:ring-mint/30"
                />
                {searchQuery && (
                  <button
                    onClick={() => { setSearchQuery(""); setSearchResults([]); }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-bark/40 hover:text-bark"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* Search results OR friends + chats */}
            {searchQuery ? (
              <div className="bg-white rounded-2xl border border-forest/8 flex-1 overflow-y-auto">
                <div className="px-4 py-2.5 border-b border-forest/8">
                  <span className="text-xs font-golos font-semibold text-bark uppercase tracking-wide">
                    {searching ? "Ищем…" : `Результаты · ${searchResults.length}`}
                  </span>
                </div>
                {searching ? (
                  <div className="py-8 text-center text-bark text-sm">Поиск…</div>
                ) : searchResults.length === 0 ? (
                  <div className="py-8 text-center text-bark text-sm">Никого не найдено</div>
                ) : (
                  searchResults.map((u) => (
                    <div key={u.id} className="flex items-center gap-3 px-4 py-3 border-b border-forest/5 last:border-0 hover:bg-sand/30 transition-colors">
                      <button onClick={() => {
                        if (u.friendshipStatus === "accepted") openChat(u as any);
                        else { /* just show the profile link */ }
                      }}>
                        <Avatar user={u} size={40} />
                      </button>
                      <div className="flex-1 min-w-0">
                        <Link href={`/profile/${u.username}`}>
                          <span className="font-golos font-semibold text-forest text-sm hover:underline block truncate">{u.name}</span>
                        </Link>
                        {u.city && <p className="text-xs text-bark flex items-center gap-0.5"><MapPin size={9} />{u.city}</p>}
                      </div>
                      {u.friendshipStatus === "accepted" ? (
                        <button
                          onClick={() => openChat(u as any)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-forest text-cream rounded-full text-xs font-golos font-semibold hover:bg-moss transition-colors"
                        >
                          <MessageCircle size={11} /> Написать
                        </button>
                      ) : (
                        <FriendButton
                          userId={u.id}
                          initialStatus={u.friendshipStatus}
                          initialFriendshipId={u.friendshipId}
                          size="sm"
                        />
                      )}
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-forest/8 flex-1 overflow-hidden flex flex-col">

                {/* Friends horizontal scroll */}
                {friends.length > 0 && (
                  <div className="border-b border-forest/8">
                    <div className="px-4 pt-3 pb-1">
                      <span className="text-xs font-golos font-semibold text-bark uppercase tracking-wide">
                        Друзья · {friends.length}
                      </span>
                    </div>
                    <div className="flex gap-3 px-4 py-3 overflow-x-auto scrollbar-hide">
                      {friends.map((f) => (
                        <button
                          key={f.id}
                          onClick={() => openChat(f)}
                          className="flex flex-col items-center gap-1.5 flex-shrink-0 group"
                        >
                          <div className={cn(
                            "rounded-full p-0.5 transition-all",
                            activePartner?.id === f.id
                              ? "bg-gradient-to-br from-mint to-forest"
                              : "bg-transparent group-hover:bg-gradient-to-br group-hover:from-mint/50 group-hover:to-sage/50"
                          )}>
                            <div className="w-12 h-12 rounded-full bg-sage overflow-hidden flex items-center justify-center text-cream font-bold text-lg border-2 border-white">
                              {f.avatar
                                ? <img src={f.avatar} alt={f.name} className="w-full h-full object-cover" />
                                : f.name[0]}
                            </div>
                          </div>
                          <span className="text-xs font-golos text-forest w-14 text-center truncate leading-tight">
                            {f.name.split(" ")[0]}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Conversations list */}
                <div className="flex-1 overflow-y-auto">
                  {conversations.length === 0 && friends.length === 0 ? (
                    <div className="text-center py-12 px-4">
                      <MessageCircle size={32} className="text-bark/30 mx-auto mb-3" />
                      <p className="text-bark text-sm mb-1">Нет чатов</p>
                      <p className="text-bark/60 text-xs">Добавь друзей чтобы начать общаться</p>
                    </div>
                  ) : conversations.length === 0 ? (
                    <div className="text-center py-8 px-4">
                      <p className="text-bark text-sm">Нажми на друга выше чтобы написать</p>
                    </div>
                  ) : (
                    <>
                      <div className="px-4 pt-3 pb-1">
                        <span className="text-xs font-golos font-semibold text-bark uppercase tracking-wide">Недавние</span>
                      </div>
                      {conversations.map(({ partner, lastMessage, unreadCount }) => (
                        <button
                          key={partner.id}
                          onClick={() => openChat(partner)}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 border-b border-forest/5 last:border-0 hover:bg-sand/40 transition-colors text-left",
                            activePartner?.id === partner.id && "bg-mint/10"
                          )}
                        >
                          <div className="relative flex-shrink-0">
                            <Avatar user={partner} size={42} />
                            {unreadCount > 0 && (
                              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-forest text-cream text-[10px] font-bold rounded-full flex items-center justify-center">
                                {unreadCount > 9 ? "9+" : unreadCount}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline justify-between gap-1">
                              <span className={cn("font-golos text-forest text-sm truncate", unreadCount > 0 ? "font-bold" : "font-semibold")}>
                                {partner.name}
                              </span>
                              <span className="text-[11px] text-bark/50 flex-shrink-0">{timeAgo(lastMessage.sentAt)}</span>
                            </div>
                            <p className={cn("text-xs truncate mt-0.5", unreadCount > 0 ? "text-forest font-medium" : "text-bark")}>
                              {lastMessage.senderId === dbUser?.id ? "Ты: " : ""}{lastMessage.content}
                            </p>
                          </div>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Chat area ── */}
          <div className="flex-1 bg-white rounded-2xl border border-forest/8 overflow-hidden flex flex-col">
            {activePartner && dbUser ? (
              <>
                {/* Chat header */}
                <div className="px-5 py-3.5 border-b border-forest/8 flex items-center gap-3 bg-white">
                  <button
                    onClick={() => setActivePartner(null)}
                    className="text-bark/50 hover:text-forest transition-colors md:hidden"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <Link href={`/profile/${activePartner.username}`}>
                    <Avatar user={activePartner} size={36} />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/profile/${activePartner.username}`}>
                      <span className="font-unbounded font-bold text-forest text-sm hover:underline block truncate">
                        {activePartner.name}
                      </span>
                    </Link>
                    {activePartner.city && (
                      <p className="text-xs text-bark/60 flex items-center gap-0.5">
                        <MapPin size={9} />{activePartner.city}
                      </p>
                    )}
                  </div>
                </div>

                <DirectChat
                  partnerId={activePartner.id}
                  currentUserId={dbUser.id}
                  partnerName={activePartner.name}
                />
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 text-bark px-8 text-center">
                <div className="w-16 h-16 rounded-full bg-sand flex items-center justify-center">
                  <MessageCircle size={28} className="text-bark/40" />
                </div>
                <div>
                  <p className="font-golos font-semibold text-forest text-sm mb-1">Выбери с кем поговорить</p>
                  <p className="text-xs text-bark/60">Нажми на друга слева или найди кого-то через поиск</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
