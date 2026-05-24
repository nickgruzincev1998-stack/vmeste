"use client";

import { useState } from "react";
import { UserPlus, UserCheck, Clock, UserMinus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  userId: string;
  initialStatus: string | null;
  initialFriendshipId: string | null;
  size?: "sm" | "md";
}

export default function FriendButton({ userId, initialStatus, initialFriendshipId, size = "md" }: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [friendshipId, setFriendshipId] = useState(initialFriendshipId);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (loading) return;
    setLoading(true);
    try {
      if (!status) {
        const res = await fetch("/api/friends", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toUserId: userId }),
        });
        const data = await res.json();
        if (!data.error) { setStatus("pending"); setFriendshipId(data.id); }
      } else if (status === "incoming") {
        await fetch(`/api/friends/${friendshipId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "accept" }),
        });
        setStatus("accepted");
      } else if (status === "pending" || status === "accepted") {
        await fetch(`/api/friends/${friendshipId}`, { method: "DELETE" });
        setStatus(null);
        setFriendshipId(null);
      }
    } finally {
      setLoading(false);
    }
  }

  const sm = size === "sm";

  if (status === "accepted") {
    return (
      <button
        onClick={handleClick}
        disabled={loading}
        title="Удалить из друзей"
        className={cn(
          "flex items-center gap-1.5 rounded-full font-golos font-semibold transition-colors disabled:opacity-50 bg-mint/20 text-sage hover:bg-red-50 hover:text-red-500",
          sm ? "px-2.5 py-1 text-xs" : "px-4 py-2 text-sm"
        )}
      >
        <UserCheck size={sm ? 12 : 14} />
        {sm ? "Друзья" : "В друзьях"}
      </button>
    );
  }

  if (status === "pending") {
    return (
      <button
        onClick={handleClick}
        disabled={loading}
        title="Отменить заявку"
        className={cn(
          "flex items-center gap-1.5 rounded-full font-golos font-semibold transition-colors disabled:opacity-50 bg-sand text-bark hover:bg-red-50 hover:text-red-500",
          sm ? "px-2.5 py-1 text-xs" : "px-4 py-2 text-sm"
        )}
      >
        <Clock size={sm ? 12 : 14} />
        {sm ? "Ожидание" : "Заявка отправлена"}
      </button>
    );
  }

  if (status === "incoming") {
    return (
      <button
        onClick={handleClick}
        disabled={loading}
        className={cn(
          "flex items-center gap-1.5 rounded-full font-golos font-semibold transition-colors disabled:opacity-50 bg-forest text-cream hover:bg-moss",
          sm ? "px-2.5 py-1 text-xs" : "px-4 py-2 text-sm"
        )}
      >
        <UserCheck size={sm ? 12 : 14} />
        {sm ? "Принять" : "Принять заявку"}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={cn(
        "flex items-center gap-1.5 rounded-full font-golos font-semibold transition-colors disabled:opacity-50 bg-forest text-cream hover:bg-moss",
        sm ? "px-2.5 py-1 text-xs" : "px-4 py-2 text-sm"
      )}
    >
      <UserPlus size={sm ? 12 : 14} />
      {sm ? "Добавить" : "Добавить в друзья"}
    </button>
  );
}
