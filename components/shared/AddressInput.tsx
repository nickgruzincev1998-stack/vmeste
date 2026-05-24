"use client";

import { useState, useRef, useEffect } from "react";
import { MapPin, LocateFixed, Loader2 } from "lucide-react";
import * as maptilersdk from "@maptiler/sdk";

interface Suggestion {
  name: string;
  lat: number;
  lng: number;
}

interface Props {
  value: string;
  onChange: (value: string, lat?: number, lng?: number) => void;
  placeholder?: string;
}

export default function AddressInput({ value, onChange, placeholder }: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  maptilersdk.config.apiKey = "4gsAO4IEWVYOJzsCiMz0";

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function search(q: string) {
    if (q.length < 2) { setSuggestions([]); setOpen(false); return; }
    setLoading(true);
    try {
      const result = await maptilersdk.geocoding.forward(q, {
        language: maptilersdk.Language.RUSSIAN,
        limit: 5,
      });
      const data = result.features.map((f: any) => ({
        name: f.place_name_ru || f.place_name,
        lat: f.center[1],
        lng: f.center[0],
      }));
      setSuggestions(data);
      setOpen(data.length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    onChange(val);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => search(val), 300);
  }

  function handleSelect(s: Suggestion) {
    onChange(s.name, s.lat, s.lng);
    setSuggestions([]);
    setOpen(false);
  }

  function handleGeolocate() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude: lat, longitude: lng } = coords;
        try {
          const result = await maptilersdk.geocoding.reverse([lng, lat], {
            language: maptilersdk.Language.RUSSIAN,
            limit: 1,
          });
          const feature = result.features[0];
          const name = feature?.place_name_ru || feature?.place_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          onChange(name, lat, lng);
        } catch {
          onChange(`${lat.toFixed(5)}, ${lng.toFixed(5)}`, lat, lng);
        }
        setLocating(false);
      },
      () => {
        alert("Не удалось определить геолокацию. Разрешите доступ в браузере.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <MapPin size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-sage z-10" />
        <input
          value={value}
          onChange={handleChange}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder ?? "Начните вводить адрес…"}
          autoComplete="off"
          className="w-full bg-white border-2 border-forest/10 rounded-2xl pl-11 pr-12 py-4 text-sm font-golos outline-none focus:border-sage transition-colors"
        />
        <button
          type="button"
          onClick={handleGeolocate}
          disabled={locating}
          title="Определить моё местоположение"
          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-xl text-sage hover:text-forest hover:bg-sage/10 transition-colors disabled:opacity-40"
        >
          {locating || loading
            ? <Loader2 size={15} className="animate-spin" />
            : <LocateFixed size={15} />}
        </button>
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-forest/10 rounded-2xl shadow-xl z-50 overflow-hidden">
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSelect(s)}
              className="w-full text-left px-4 py-3 text-sm font-golos hover:bg-sand transition-colors flex items-start gap-3 border-b border-forest/5 last:border-0"
            >
              <MapPin size={14} className="text-sage flex-shrink-0 mt-0.5" />
              <span className="text-forest">{s.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}