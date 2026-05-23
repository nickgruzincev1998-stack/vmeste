"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { use } from "react";
import { Star, ArrowLeft, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Participant {
  id: string;
  name: string;
  avatar: string | null;
}

interface ReviewState {
  rating: number;
  comment: string;
  submitted: boolean;
}

export default function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [activity, setActivity] = useState<any>(null);
  const [dbUserId, setDbUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Record<string, ReviewState>>({});
  const [submitting, setSubmitting] = useState(false);
  const [allDone, setAllDone] = useState(false);

  useEffect(() => {
    fetch(`/api/activities/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error || data.status !== "completed") {
          router.push(`/activities/${id}`);
        } else {
          setActivity(data);
          const initial: Record<string, ReviewState> = {};
          data.participants?.forEach((p: any) => {
            initial[p.user.id] = { rating: 0, comment: "", submitted: false };
          });
          setReviews(initial);
        }
      })
      .finally(() => setLoading(false));

    if (isSignedIn) {
      fetch("/api/users/me")
        .then((r) => r.json())
        .then((data) => { if (data.id) setDbUserId(data.id); });
    }
  }, [id, isSignedIn]);

  function setRating(userId: string, rating: number) {
    setReviews((prev) => ({ ...prev, [userId]: { ...prev[userId], rating } }));
  }

  function setComment(userId: string, comment: string) {
    setReviews((prev) => ({ ...prev, [userId]: { ...prev[userId], comment } }));
  }

  async function handleSubmitReview(userId: string) {
    const review = reviews[userId];
    if (!review || review.rating === 0) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          revieweeId: userId,
          activityId: id,
          rating: review.rating,
          comment: review.comment,
        }),
      });
      if (res.ok) {
        setReviews((prev) => ({ ...prev, [userId]: { ...prev[userId], submitted: true } }));
        const allSubmitted = Object.values({ ...reviews, [userId]: { ...reviews[userId], submitted: true } })
          .every((r) => r.submitted);
        if (allSubmitted) setAllDone(true);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-sage border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (allDone) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-mint/20 flex items-center justify-center mx-auto mb-6">
            <Check size={36} className="text-sage" />
          </div>
          <h2 className="font-unbounded font-black text-forest text-2xl mb-2">Спасибо за отзывы!</h2>
          <p className="text-bark mb-6">Рейтинги участников обновлены</p>
          <Link href="/feed" className="btn-dark inline-flex">На ленту</Link>
        </div>
      </div>
    );
  }

  const participants = activity?.participants?.filter((p: any) => p.user.id !== dbUserId) ?? [];

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-forest py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Link href={`/activities/${id}`} className="flex items-center gap-2 text-cream/70 hover:text-cream text-sm mb-6 transition-colors">
            <ArrowLeft size={16} /> Назад
          </Link>
          <span className="text-mint text-xs font-semibold uppercase tracking-widest">Событие завершено</span>
          <h1 className="font-unbounded font-black text-cream text-2xl mt-2">Оцените участников</h1>
          <p className="text-cream/60 text-sm font-golos mt-2">{activity?.title}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {participants.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="font-unbounded font-bold text-forest text-xl mb-2">Нет участников для оценки</h3>
            <Link href="/feed" className="btn-dark inline-flex mt-4">На ленту</Link>
          </div>
        )}

        {participants.map((p: any) => {
          const review = reviews[p.user.id];
          if (!review) return null;

          return (
            <div key={p.user.id} className="bg-white rounded-3xl border border-forest/10 p-6">
              {/* User */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-full bg-sage flex items-center justify-center text-cream font-bold text-lg overflow-hidden">
                  {p.user.avatar ? (
                    <img src={p.user.avatar} alt={p.user.name} className="w-full h-full object-cover" />
                  ) : (
                    p.user.name[0]
                  )}
                </div>
                <div>
                  <div className="font-golos font-semibold text-forest">{p.user.name}</div>
                  {review.submitted && (
                    <div className="flex items-center gap-1 text-sage text-xs mt-0.5">
                      <Check size={12} /> Отзыв отправлен
                    </div>
                  )}
                </div>
              </div>

              {review.submitted ? (
                <div className="flex gap-1">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} size={20} className={s <= review.rating ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"} />
                  ))}
                </div>
              ) : (
                <>
                  {/* Stars */}
                  <div className="mb-4">
                    <div className="text-xs font-semibold text-bark uppercase tracking-wide mb-3">Оценка</div>
                    <div className="flex gap-2">
                      {[1,2,3,4,5].map((s) => (
                        <button key={s} onClick={() => setRating(p.user.id, s)}>
                          <Star
                            size={32}
                            className={cn(
                              "transition-all",
                              s <= review.rating
                                ? "text-amber-400 fill-amber-400"
                                : "text-gray-200 fill-gray-200 hover:text-amber-300 hover:fill-amber-300"
                            )}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment */}
                  <div className="mb-4">
                    <div className="text-xs font-semibold text-bark uppercase tracking-wide mb-2">
                      Комментарий <span className="text-bark/50">(необязательно)</span>
                    </div>
                    <textarea
                      value={review.comment}
                      onChange={(e) => setComment(p.user.id, e.target.value)}
                      placeholder="Расскажите об участнике…"
                      rows={3}
                      className="w-full bg-sand rounded-2xl px-4 py-3 text-sm font-golos outline-none focus:ring-2 focus:ring-mint/30 resize-none"
                    />
                  </div>

                  <button
                    onClick={() => handleSubmitReview(p.user.id)}
                    disabled={review.rating === 0 || submitting}
                    className="w-full py-3 rounded-2xl bg-forest text-cream font-unbounded font-bold text-sm hover:bg-moss transition-colors disabled:opacity-40"
                  >
                    Отправить отзыв
                  </button>
                </>
              )}
            </div>
          );
        })}

        {participants.length > 0 && (
          <Link href="/feed" className="block text-center text-sage hover:text-forest text-sm font-golos transition-colors py-4">
            Пропустить →
          </Link>
        )}
      </div>
    </div>
  );
}