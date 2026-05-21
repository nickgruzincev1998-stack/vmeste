"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin } from "lucide-react";

interface Suggestion {
  display_name: string;
  lat: string;
  lon: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function AddressInput({ value, onChange, placeholder }: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const timer = useRef<NodeJS.Timeout>();
  const ref = useRef<HTMLDivElement>(null);

  // Закрыть при клике вне
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
    if (q.length < 3) { setSuggestions([]); return; }
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&accept-language=ru`,
        { headers: { "Accept-Language": "ru" } }
      );
      const data = await res.json();
      setSuggestions(data);
      setOpen(true);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange(e.target.value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => search(e.target.value), 400);
  }

  function handleSelect(s: Suggestion) {
    onChange(s.display_name);
    setSuggestions([]);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <MapPin size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-sage" />
        <input
          value={value}
          onChange={handleChange}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder ?? "Начните вводить адрес…"}
          className="w-full bg-white border-2 border-forest/10 rounded-2xl pl-11 pr-5 py-4 text-sm font-golos outline-none focus:border-sage transition-colors"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-sage border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-forest/10 rounded-2xl shadow-lg z-50 overflow-hidden">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => handleSelect(s)}
              className="w-full text-left px-4 py-3 text-sm font-golos hover:bg-sand transition-colors flex items-start gap-3 border-b border-forest/5 last:border-0"
            >
              <MapPin size={14} className="text-sage flex-shrink-0 mt-0.5" />
              <span className="text-forest line-clamp-2">{s.display_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}