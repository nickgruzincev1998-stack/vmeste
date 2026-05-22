"use client";

import { useState, useEffect } from "react";
import { MapPin, ChevronDown, X } from "lucide-react";

const POPULAR_CITIES = [
  "Москва", "Санкт-Петербург", "Казань", "Екатеринбург",
  "Новосибирск", "Краснодар", "Нижний Новгород", "Уфа",
  "Самара", "Ростов-на-Дону",
];

interface Props {
  value: string;
  onChange: (city: string) => void;
}

export default function CitySelector({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState(value);

  useEffect(() => {
    setInput(value);
  }, [value]);

  function handleSelect(city: string) {
    onChange(city);
    setInput(city);
    setOpen(false);
  }

  function handleClear() {
    onChange("");
    setInput("");
  }

  const filtered = POPULAR_CITIES.filter((c) =>
    c.toLowerCase().includes(input.toLowerCase())
  );

  return (
    <div className="relative">
      <div className="flex items-center gap-2 bg-white border-2 border-forest/10 rounded-2xl px-4 py-3 cursor-pointer hover:border-sage transition-colors"
           onClick={() => setOpen(!open)}>
        <MapPin size={16} className="text-sage flex-shrink-0" />
        <input
          value={input}
          onChange={(e) => { setInput(e.target.value); setOpen(true); }}
          placeholder="Выбери город"
          className="flex-1 outline-none text-sm font-golos text-forest bg-transparent"
          onFocus={() => setOpen(true)}
        />
        {value ? (
          <button onClick={(e) => { e.stopPropagation(); handleClear(); }}>
            <X size={14} className="text-bark hover:text-forest" />
          </button>
        ) : (
          <ChevronDown size={14} className="text-bark" />
        )}
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-forest/10 rounded-2xl shadow-xl z-50 overflow-hidden">
          {filtered.length > 0 ? (
            filtered.map((city) => (
              <button
                key={city}
                onClick={() => handleSelect(city)}
                className="w-full text-left px-4 py-3 text-sm font-golos hover:bg-sand transition-colors flex items-center gap-3 border-b border-forest/5 last:border-0"
              >
                <MapPin size={13} className="text-sage flex-shrink-0" />
                <span className="text-forest">{city}</span>
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-bark font-golos">
              Введи название города
            </div>
          )}
          {input && !POPULAR_CITIES.includes(input) && (
            <button
              onClick={() => handleSelect(input)}
              className="w-full text-left px-4 py-3 text-sm font-golos hover:bg-sand transition-colors flex items-center gap-3 bg-mint/5"
            >
              <MapPin size={13} className="text-sage flex-shrink-0" />
              <span className="text-forest">Искать в «{input}»</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}