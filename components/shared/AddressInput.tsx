"use client";

import { useState, useRef, useEffect } from "react";
import { MapPin } from "lucide-react";
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
          className="w-full bg-white border-2 border-forest/10 rounded-2xl pl-11 pr-10 py-4 text-sm font-golos outline-none focus:border-sage transition-colors"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-sage border-t-transparent rounded-full animate-spin" />
          </div>
        )}
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