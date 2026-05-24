"use client";

import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { pusherClient } from "@/lib/pusher-client";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

const typeIcon: Record<string, string> = {
  new_participant: "🙋",
  friend_request:  "👋",
  friend_accepted: "🤝",
  new_dm:          "💬",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "только что";
  if (mins < 60) return `${mins} мин назад`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ч назад`;
  return `${Math.floor(hours / 24)} д назад`;
}

export default function NotificationBell() {
  const { isSignedIn } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dbUserId, setDbUserId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unread = notifications.filter((n) => !n.read).length;

  // Fetch DB user id for Pusher channel
  useEffect(() => {
    if (!isSignedIn) return;
    fetch("/api/users/me")
      .then((r) => r.json())
      .then((data) => { if (data.id) setDbUserId(data.id); });
  }, [isSignedIn]);

  // Initial fetch + polling fallback every 60s
  useEffect(() => {
    if (!isSignedIn) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [isSignedIn]);

  // Pusher real-time subscription
  useEffect(() => {
    if (!dbUserId || !pusherClient) return;

    const channel = pusherClient.subscribe(`notifications-${dbUserId}`);
    channel.bind("new-notification", (data: Notification) => {
      setNotifications((prev) => {
        if (prev.some((n) => n.id === data.id)) return prev;
        return [data, ...prev];
      });
    });

    return () => {
      pusherClient.unsubscribe(`notifications-${dbUserId}`);
    };
  }, [dbUserId]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function fetchNotifications() {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch {}
  }

  async function handleOpen() {
    setOpen(!open);
    if (!open && unread > 0) {
      await fetch("/api/notifications", { method: "PATCH" });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  }

  if (!isSignedIn) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        className="relative w-9 h-9 flex items-center justify-center rounded-full text-cream/70 hover:text-cream hover:bg-white/10 transition-all"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-forest/10 overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-forest/8">
            <span className="font-unbounded font-bold text-forest text-sm">Уведомления</span>
            {unread > 0 && (
              <span className="text-xs text-bark">{unread} новых</span>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-3xl mb-2">🔔</div>
                <p className="text-bark text-sm">Уведомлений пока нет</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "px-4 py-3 border-b border-forest/5 last:border-0 transition-colors",
                    !n.read && "bg-mint/5"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg flex-shrink-0 mt-0.5">
                      {typeIcon[n.type] ?? "🔔"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-golos font-semibold text-forest text-sm leading-snug">{n.title}</div>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-mint flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <div className="text-bark text-xs mt-0.5 line-clamp-2">{n.body}</div>
                      <div className="text-bark/50 text-xs mt-1">{timeAgo(n.createdAt)}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
