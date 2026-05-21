"use client";

import { useState, useRef, useEffect } from "react";
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
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ref = useRef<HTMLDivElement>(null);

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
    if (q.length < 3) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&accept-language=ru&countrycodes=ru,kz,by,uz`;
      const res = await fetch(url, {
        headers: {
          "Accept-Language": "ru",
          "User-Agent": "vmeste-leisure-app/1.0 (contact@vmeste.app)",
        },
      });
      if (!res.ok) throw new Error("Network error");
      const data: Suggestion[] = await res.json();
      setSuggestions(data);
      setOpen(data.length > 0);
    } catch (e) {
      console.error("Address search error:", e);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    onChange(val);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => search(val), 500);
  }

  function handleSelect(s: Suggestion) {
    // Берём только первую часть адреса (до первой запятой) для краткости
    const shortName = s.display_name.split(",").slice(0, 3).join(",").trim();
    onChange(shortName);
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
              <div>
                <div className="text-forest font-medium line-clamp-1">
                  {s.display_name.split(",")[0]}
                </div>
                <div className="text-bark text-xs line-clamp-1 mt-0.5">
                  {s.display_name.split(",").slice(1, 3).join(",")}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}