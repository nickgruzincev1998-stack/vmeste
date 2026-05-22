"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { Send, Lock } from "lucide-react";
import { pusherClient } from "@/lib/pusher";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  sentAt: string;
  sender: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

interface Props {
  activityId: string;
  currentUserId?: string;
  isParticipant: boolean;
}

function timeFormat(iso: string) {
  return new Date(iso).toLocaleTimeString("ru-RU", {
    hour: "2-digit", minute: "2-digit",
  });
}

export default function ChatRoom({ activityId, currentUserId, isParticipant }: Props) {
  const { isSignedIn } = useAuth();
  const [messages, setMessages]   = useState<Message[]>([]);
  const [input, setInput]         = useState("");
  const [sending, setSending]     = useState(false);
  const bottomRef                 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Загружаем историю
    fetch(`/api/chat/${activityId}`)
      .then((r) => r.json())
      .then((data) => setMessages(Array.isArray(data) ? data : []));

    // Подписываемся на Pusher
    const channel = pusherClient.subscribe(`activity-${activityId}`);
    channel.bind("new-message", (data: Message) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      pusherClient.unsubscribe(`activity-${activityId}`);
    };
  }, [activityId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      await fetch(`/api/chat/${activityId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: input.trim() }),
      });
      setInput("");
    } catch {
      alert("Ошибка отправки");
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-forest/8 overflow-hidden flex flex-col" style={{ height: 420 }}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-forest/8 flex items-center justify-between">
        <span className="font-unbounded font-bold text-forest text-sm">Чат группы</span>
        <span className="text-xs text-bark">{messages.length} сообщений</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-bark text-sm">
            Пока нет сообщений. Будь первым!
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender.id === currentUserId;
            return (
              <div key={msg.id} className={cn("flex gap-2", isOwn && "flex-row-reverse")}>
                <div className="w-7 h-7 rounded-full bg-sage flex items-center justify-center text-cream text-xs font-bold flex-shrink-0 overflow-hidden">
                  {msg.sender.avatar ? (
                    <img src={msg.sender.avatar} alt={msg.sender.name} className="w-full h-full object-cover" />
                  ) : (
                    msg.sender.name[0]
                  )}
                </div>
                <div className={cn("max-w-[70%]", isOwn && "items-end flex flex-col")}>
                  {!isOwn && (
                    <div className="text-xs text-bark mb-1">{msg.sender.name}</div>
                  )}
                  <div className={cn(
                    "rounded-2xl px-3 py-2 text-sm font-golos",
                    isOwn ? "bg-forest text-cream rounded-tr-sm" : "bg-sand text-forest rounded-tl-sm"
                  )}>
                    {msg.content}
                  </div>
                  <div className="text-xs text-bark/60 mt-1">{timeFormat(msg.sentAt)}</div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {isSignedIn && isParticipant ? (
        <div className="border-t border-forest/8 p-3 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Написать сообщение…"
            className="flex-1 bg-sand rounded-xl px-4 py-2.5 text-sm font-golos outline-none focus:ring-2 focus:ring-mint/30"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="w-10 h-10 rounded-xl bg-forest text-cream flex items-center justify-center hover:bg-moss transition-colors disabled:opacity-40"
          >
            <Send size={16} />
          </button>
        </div>
      ) : (
        <div className="border-t border-forest/8 p-3 flex items-center justify-center gap-2 text-bark text-sm">
          <Lock size={14} />
          {!isSignedIn ? "Войди чтобы писать в чат" : "Запишись на событие чтобы писать в чат"}
        </div>
      )}
    </div>
  );
}