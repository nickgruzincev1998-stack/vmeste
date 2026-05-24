"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { MessageCircle, UserCheck, Clock, X, Search } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import DirectChat from "@/components/chat/DirectChat";
import FriendButton from "@/components/shared/FriendButton";

interface Partner {
  id: string;
  username: string;
  name: string;
  avatar: string | null;
}

interface Conversation {
  partner: Partner;
  lastMessage: { content: string; sentAt: string; senderId: string };
  unreadCount: number;
}

interface FriendRequest {
  id: string;
  requester: Partner;
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

export default function MessagesPage() {
  const { user: clerkUser, isLoaded } = useUser();
  const [dbUser, setDbUser] = useState<any>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [activePartnerId, setActivePartnerId] = useState<string | null>(null);
  const [activePartner, setActivePartner] = useState<Partner | null>(null);
  const [tab, setTab] = useState<"messages" | "requests">("messages");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => r.json())
      .then((data) => { if (!data.error) setDbUser(data); });
    fetchConversations();
    fetchRequests();
  }, []);

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

  function fetchConversations() {
    fetch("/api/dm")
      .then((r) => r.json())
      .then((data) => setConversations(Array.isArray(data) ? data : []));
  }

  function fetchRequests() {
    fetch("/api/friends/requests")
      .then((r) => r.json())
      .then((data) => setRequests(Array.isArray(data) ? data : []));
  }

  async function handleRequest(id: string, action: "accept" | "reject") {
    setLoadingAction(id);
    await fetch(`/api/friends/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    fetchRequests();
    fetchConversations();
    setLoadingAction(null);
  }

  function openChat(partner: Partner) {
    setActivePartnerId(partner.id);
    setActivePartner(partner);
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

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="font-unbounded font-black text-forest text-2xl mb-6">Сообщения</h1>

        <div className="flex gap-4 h-[calc(100vh-180px)] min-h-[500px]">

          {/* ── Sidebar ── */}
          <div className="w-80 flex-shrink-0 bg-white rounded-2xl border border-forest/8 overflow-hidden flex flex-col">

            {/* Search bar */}
            <div className="p-3 border-b border-forest/8">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-bark/50" />
                <input
                  value={searchQuery}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  placeholder="Найти людей…"
                  className="w-full pl-8 pr-3 py-2 bg-sand rounded-xl text-sm font-golos outline-none focus:ring-2 focus:ring-mint/30"
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

            {/* Search results */}
            {searchQuery ? (
              <div className="flex-1 overflow-y-auto">
                {searching ? (
                  <div className="text-center py-8 text-bark text-sm">Поиск…</div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-8 text-bark text-sm">Никого не найдено</div>
                ) : (
                  searchResults.map((u) => (
                    <div key={u.id} className="flex items-center gap-3 p-3 border-b border-forest/5">
                      <Link href={`/profile/${u.username}`} className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-sage overflow-hidden flex items-center justify-center text-cream font-bold text-sm">
                          {u.avatar
                            ? <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                            : u.name[0]}
                        </div>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link href={`/profile/${u.username}`}>
                          <span className="font-golos font-semibold text-forest text-sm hover:underline block truncate">{u.name}</span>
                        </Link>
                        {u.city && <p className="text-xs text-bark truncate">{u.city}</p>}
                      </div>
                      <FriendButton
                        userId={u.id}
                        initialStatus={u.friendshipStatus}
                        initialFriendshipId={u.friendshipId}
                        size="sm"
                      />
                    </div>
                  ))
                )}
              </div>
            ) : (
              /* Tabs + conversations/requests */
              <div className="flex flex-col flex-1 overflow-hidden">
                <div className="flex border-b border-forest/8">
                  <button
                    onClick={() => setTab("messages")}
                    className={cn(
                      "flex-1 py-3 text-sm font-golos font-medium transition-colors flex items-center justify-center gap-2",
                      tab === "messages" ? "text-forest border-b-2 border-forest" : "text-bark hover:text-forest"
                    )}
                  >
                    <MessageCircle size={15} />
                    Чаты
                  </button>
                  <button
                    onClick={() => setTab("requests")}
                    className={cn(
                      "flex-1 py-3 text-sm font-golos font-medium transition-colors flex items-center justify-center gap-2 relative",
                      tab === "requests" ? "text-forest border-b-2 border-forest" : "text-bark hover:text-forest"
                    )}
                  >
                    <UserCheck size={15} />
                    Заявки
                    {requests.length > 0 && (
                      <span className="absolute top-2 right-4 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {requests.length}
                      </span>
                    )}
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {tab === "messages" && (
                    <>
                      {conversations.length === 0 ? (
                        <div className="text-center py-12 px-4">
                          <MessageCircle size={32} className="text-bark/40 mx-auto mb-3" />
                          <p className="text-bark text-sm">Нет чатов. Добавь друзей и начни общаться!</p>
                        </div>
                      ) : (
                        conversations.map(({ partner, lastMessage, unreadCount }) => (
                          <button
                            key={partner.id}
                            onClick={() => openChat(partner)}
                            className={cn(
                              "w-full flex items-center gap-3 p-3 border-b border-forest/5 hover:bg-sand/50 transition-colors text-left",
                              activePartnerId === partner.id && "bg-mint/10"
                            )}
                          >
                            <div className="w-10 h-10 rounded-full bg-sage flex-shrink-0 overflow-hidden flex items-center justify-center text-cream font-bold text-sm">
                              {partner.avatar
                                ? <img src={partner.avatar} alt={partner.name} className="w-full h-full object-cover" />
                                : partner.name[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="font-golos font-semibold text-forest text-sm truncate">{partner.name}</span>
                                <span className="text-xs text-bark/60 flex-shrink-0 ml-1">{timeAgo(lastMessage.sentAt)}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-bark truncate">
                                  {lastMessage.senderId === dbUser?.id ? "Ты: " : ""}{lastMessage.content}
                                </p>
                                {unreadCount > 0 && (
                                  <span className="ml-1 w-5 h-5 bg-forest text-cream text-xs rounded-full flex items-center justify-center font-bold flex-shrink-0">
                                    {unreadCount}
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </>
                  )}

                  {tab === "requests" && (
                    <>
                      {requests.length === 0 ? (
                        <div className="text-center py-12 px-4">
                          <UserCheck size={32} className="text-bark/40 mx-auto mb-3" />
                          <p className="text-bark text-sm">Нет входящих заявок</p>
                        </div>
                      ) : (
                        requests.map((req) => (
                          <div key={req.id} className="flex items-center gap-3 p-3 border-b border-forest/5">
                            <Link href={`/profile/${req.requester.username}`} className="flex-shrink-0">
                              <div className="w-10 h-10 rounded-full bg-sage overflow-hidden flex items-center justify-center text-cream font-bold text-sm">
                                {req.requester.avatar
                                  ? <img src={req.requester.avatar} alt={req.requester.name} className="w-full h-full object-cover" />
                                  : req.requester.name[0]}
                              </div>
                            </Link>
                            <div className="flex-1 min-w-0">
                              <Link href={`/profile/${req.requester.username}`}>
                                <span className="font-golos font-semibold text-forest text-sm hover:underline">{req.requester.name}</span>
                              </Link>
                              <p className="text-xs text-bark">
                                <Clock size={10} className="inline mr-1" />{timeAgo(req.createdAt)} назад
                              </p>
                            </div>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => handleRequest(req.id, "accept")}
                                disabled={loadingAction === req.id}
                                className="w-8 h-8 bg-forest text-cream rounded-full flex items-center justify-center hover:bg-moss transition-colors text-xs font-bold disabled:opacity-50"
                                title="Принять"
                              >
                                ✓
                              </button>
                              <button
                                onClick={() => handleRequest(req.id, "reject")}
                                disabled={loadingAction === req.id}
                                className="w-8 h-8 bg-sand text-bark rounded-full flex items-center justify-center hover:bg-sand/70 transition-colors disabled:opacity-50"
                                title="Отклонить"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Chat area ── */}
          <div className="flex-1 bg-white rounded-2xl border border-forest/8 overflow-hidden flex flex-col">
            {activePartnerId && activePartner && dbUser ? (
              <>
                <div className="px-5 py-3 border-b border-forest/8 flex items-center gap-3">
                  <Link href={`/profile/${activePartner.username}`}>
                    <div className="w-9 h-9 rounded-full bg-sage overflow-hidden flex items-center justify-center text-cream font-bold text-sm">
                      {activePartner.avatar
                        ? <img src={activePartner.avatar} alt={activePartner.name} className="w-full h-full object-cover" />
                        : activePartner.name[0]}
                    </div>
                  </Link>
                  <Link href={`/profile/${activePartner.username}`}>
                    <span className="font-unbounded font-bold text-forest text-sm hover:underline">
                      {activePartner.name}
                    </span>
                  </Link>
                </div>
                <DirectChat
                  partnerId={activePartnerId}
                  currentUserId={dbUser.id}
                  partnerName={activePartner.name}
                />
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-bark">
                <Search size={36} className="text-bark/20" />
                <p className="text-sm font-golos">Найди людей выше или выбери чат</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
