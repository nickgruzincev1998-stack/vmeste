"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { ArrowLeft, ArrowRight, Check, Calendar } from "lucide-react";
import { CATEGORIES } from "@/types";
import { cn } from "@/lib/utils";
import AddressInput from "@/components/shared/AddressInput";
import dynamic from "next/dynamic";
import { MapHandle } from "@/components/map/Map";

const Map = dynamic(() => import("@/components/map/Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-moss/20 rounded-2xl flex items-center justify-center">
      <div className="text-forest font-golos text-sm">Загрузка карты…</div>
    </div>
  ),
});

const difficulties = [
  { value: "beginner",     label: "Новичок",     desc: "Подходит всем" },
  { value: "intermediate", label: "Средний",     desc: "Нужна базовая подготовка" },
  { value: "advanced",     label: "Продвинутый", desc: "Для опытных" },
];

interface FormData {
  categoryId: string;
  title: string;
  description: string;
  date: string;
  time: string;
  placeName: string;
  lat?: number;
  lng?: number;
  maxParticipants: number;
  difficulty: string;
}

const EMPTY: FormData = {
  categoryId: "", title: "", description: "",
  date: "", time: "", placeName: "",
  lat: undefined, lng: undefined,
  maxParticipants: 10, difficulty: "beginner",
};

export default function CreateActivityPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [step, setStep]       = useState(1);
  const [form, setForm]       = useState<FormData>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [submitted, setSubmitted] = useState(false);
  const mapRef = useRef<MapHandle>(null);
  const markerRef = useRef<any>(null);

  function set<K extends keyof FormData>(key: K, val: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  function handleAddressChange(val: string, lat?: number, lng?: number) {
    setForm((prev) => ({ ...prev, placeName: val, lat, lng }));
    if (lat && lng) {
      mapRef.current?.setCenter(lat, lng, 15);
      mapRef.current?.setSearchMarker(lat, lng);
    }
  }

  function canNext() {
    if (step === 1) return form.categoryId !== "" && form.title.trim().length > 3;
    if (step === 2) return form.date !== "" && form.placeName.trim().length > 2;
    return true;
  }

  async function handleSubmit() {
    if (!user) { router.push("/sign-in"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          date: form.date && form.time ? `${form.date}T${form.time}` : form.date,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Ошибка"); setLoading(false); return; }
      setSubmitted(true);
      setTimeout(() => router.push("/feed"), 2000);
    } catch {
      setError("Ошибка сети.");
      setLoading(false);
    }
  }

  const selectedCat = CATEGORIES.find((c) => c.id === form.categoryId);

  if (!isLoaded) return null;

  if (!user) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="font-unbounded font-bold text-forest text-xl mb-2">Нужна авторизация</h2>
          <p className="text-bark mb-6">Войди чтобы создать событие</p>
          <a href="/sign-in" className="btn-dark inline-flex">Войти</a>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-mint/20 flex items-center justify-center mx-auto mb-6">
            <Check size={36} className="text-sage" />
          </div>
          <h2 className="font-unbounded font-black text-forest text-2xl mb-2">Событие создано!</h2>
          <p className="text-bark">Перенаправляем в ленту…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-forest py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : router.back()}
            className="flex items-center gap-2 text-cream/70 hover:text-cream text-sm mb-6 transition-colors"
          >
            <ArrowLeft size={16} /> Назад
          </button>
          <h1 className="font-unbounded font-black text-cream text-2xl mb-6">Создать событие</h1>

          <div className="flex items-center gap-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-unbounded transition-all",
                  step > n ? "bg-mint text-forest" : step === n ? "bg-white text-forest" : "bg-white/20 text-cream/50"
                )}>
                  {step > n ? <Check size={14} /> : n}
                </div>
                <span className={cn("text-xs font-golos", step === n ? "text-cream" : "text-cream/40")}>
                  {["Тип и название", "Место и время", "Детали"][n - 1]}
                </span>
                {n < 3 && <div className={cn("h-px w-8", step > n ? "bg-mint" : "bg-white/20")} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-8">
            <div>
              <label className="block text-xs font-semibold text-bark uppercase tracking-wide mb-4">Категория</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => set("categoryId", cat.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all text-center",
                      form.categoryId === cat.id
                        ? "border-forest bg-forest text-cream"
                        : "border-forest/10 bg-white hover:border-sage text-forest"
                    )}
                  >
                    <span className="text-3xl">{cat.icon}</span>
                    <span className="font-unbounded font-bold text-xs">{cat.nameRu}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-bark uppercase tracking-wide mb-2">Название</label>
              <input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder={selectedCat ? `Например: ${selectedCat.nameRu} в парке Горького` : "Придумайте название…"}
                className="w-full bg-white border-2 border-forest/10 rounded-2xl px-5 py-4 text-sm font-golos outline-none focus:border-sage transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-bark uppercase tracking-wide mb-2">
                Описание <span className="text-bark/50">(необязательно)</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Расскажите подробнее…"
                rows={4}
                className="w-full bg-white border-2 border-forest/10 rounded-2xl px-5 py-4 text-sm font-golos outline-none focus:border-sage transition-colors resize-none"
              />
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-bark uppercase tracking-wide mb-2">Место</label>
              <AddressInput
                value={form.placeName}
                onChange={handleAddressChange}
                placeholder="Парк Горького, центральный вход"
              />
              <p className="text-xs text-bark/60 mt-2 font-golos">
                Выберите адрес из подсказок — он отобразится на карте
              </p>
            </div>

            {/* Мини-карта */}
            <div className="rounded-2xl overflow-hidden border border-forest/10" style={{ height: 280 }}>
              <Map
                ref={mapRef}
                activities={form.lat && form.lng ? [{
                  id: "preview",
                  title: form.placeName,
                  lat: form.lat,
                  lng: form.lng,
                  icon: selectedCat?.icon ?? "📍",
                }] : []}
                onMapReady={() => {
                  if (form.lat && form.lng) {
                    mapRef.current?.setCenter(form.lat, form.lng, 15);
                    mapRef.current?.setSearchMarker(form.lat, form.lng);
                  }
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-bark uppercase tracking-wide mb-2">Дата</label>
                <div className="relative">
                  <Calendar size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-sage" />
                  <input
                    type="date"
                    value={form.date}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => set("date", e.target.value)}
                    className="w-full bg-white border-2 border-forest/10 rounded-2xl pl-11 pr-4 py-4 text-sm font-golos outline-none focus:border-sage transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-bark uppercase tracking-wide mb-2">Время</label>
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => set("time", e.target.value)}
                  className="w-full bg-white border-2 border-forest/10 rounded-2xl px-4 py-4 text-sm font-golos outline-none focus:border-sage transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-bark uppercase tracking-wide mb-4">Сложность</label>
              <div className="space-y-3">
                {difficulties.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => set("difficulty", d.value)}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all",
                      form.difficulty === d.value
                        ? "border-forest bg-forest text-cream"
                        : "border-forest/10 bg-white hover:border-sage"
                    )}
                  >
                    <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                      form.difficulty === d.value ? "border-mint bg-mint" : "border-bark"
                    )}>
                      {form.difficulty === d.value && <div className="w-2 h-2 rounded-full bg-forest" />}
                    </div>
                    <div>
                      <div className="font-golos font-semibold text-sm">{d.label}</div>
                      <div className={cn("text-xs mt-0.5", form.difficulty === d.value ? "text-cream/60" : "text-bark")}>
                        {d.desc}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-bark uppercase tracking-wide mb-2">
                Максимум участников: <span className="text-forest">{form.maxParticipants}</span>
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => set("maxParticipants", Math.max(2, form.maxParticipants - 1))}
                  className="w-10 h-10 rounded-full bg-sand text-forest font-bold text-lg hover:bg-sand/70 transition-colors"
                >−</button>
                <div className="flex-1 h-2 bg-sand rounded-full overflow-hidden">
                  <div className="h-full bg-mint rounded-full" style={{ width: `${(form.maxParticipants / 50) * 100}%` }} />
                </div>
                <button
                  onClick={() => set("maxParticipants", Math.min(50, form.maxParticipants + 1))}
                  className="w-10 h-10 rounded-full bg-sand text-forest font-bold text-lg hover:bg-sand/70 transition-colors"
                >+</button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-forest/10 p-5">
              <div className="text-xs font-semibold text-bark uppercase tracking-wide mb-4">Предпросмотр</div>
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 rounded-xl bg-forest flex items-center justify-center text-3xl flex-shrink-0">
                  {selectedCat?.icon ?? "🎯"}
                </div>
                <div>
                  <div className="font-unbounded font-bold text-forest text-sm">{form.title}</div>
                  <div className="text-xs text-bark mt-1">{form.placeName}</div>
                  <div className="text-xs text-bark mt-0.5">
                    {form.date && new Date(form.date).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}
                    {form.time && ` · ${form.time}`}
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-3 text-sm">
                {error}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between mt-10">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 px-6 py-3 rounded-full border border-forest/15 text-bark hover:text-forest text-sm font-golos font-medium transition-colors"
            >
              <ArrowLeft size={16} /> Назад
            </button>
          ) : <div />}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canNext()}
              className={cn("btn-dark flex items-center gap-2",
                !canNext() && "opacity-40 cursor-not-allowed hover:bg-forest hover:translate-y-0"
              )}
            >
              Далее <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-dark flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? "Создаём…" : <><Check size={16} /> Создать событие</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}