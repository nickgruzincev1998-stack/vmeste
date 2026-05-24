"use client";

import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { pusherClient } from "@/lib/pusher-client";
import { cn } from "@/lib/utils";

interface DM {
  id: string;
  content: string;
  sentAt: string;
  sender: { id: string; name: string; avatar: string | null };
}

interface Props {
  partnerId: string;
  currentUserId: string;
  partnerName: string;
}

function dmChannel(a: string, b: string) {
  return `dm-${[a, b].sort().join("-")}`;
}

function timeFormat(iso: string) {
  return new Date(iso).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

export default function DirectChat({ partnerId, currentUserId, partnerName }: Props) {
  const [messages, setMessages] = useState<DM[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/dm/${partnerId}`)
      .then((r) => r.json())
      .then((data) => setMessages(Array.isArray(data) ? data : []));

    const channel = pusherClient.subscribe(dmChannel(currentUserId, partnerId));
    channel.bind("new-dm", (data: DM) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev;
        return [...prev, data];
      });
    });

    return () => pusherClient.unsubscribe(dmChannel(currentUserId, partnerId));
  }, [partnerId, currentUserId]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;

    // Оптимистичный UI — показываем сразу
    const tempId = `temp-${Date.now()}`;
    const optimistic: DM = {
      id: tempId,
      content: text,
      sentAt: new Date().toISOString(),
      sender: { id: currentUserId, name: "Вы", avatar: null },
    };
    setMessages((prev) => [...prev, optimistic]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch(`/api/dm/${partnerId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      const saved = await res.json();
      // Заменяем временное сообщение реальным
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...saved } : m))
      );
    } catch {
      // При ошибке убираем временное
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setInput(text);
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
    <div className="flex-1 flex flex-col min-h-0">
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-bark text-sm">
            Напиши первое сообщение {partnerName}
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
      </div>

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
    </div>
  );
}
