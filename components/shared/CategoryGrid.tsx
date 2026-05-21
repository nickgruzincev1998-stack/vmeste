"use client";

import Link from "next/link";
import { CATEGORIES } from "@/types";
import { cn } from "@/lib/utils";

const bgMap: Record<number, string> = {
  0:  "bg-forest text-cream",
  1:  "bg-[#e8f4ed] text-forest",
  2:  "bg-[#fdf3e8] text-forest",
  3:  "bg-moss text-cream",
  4:  "bg-[#f0e8d8] text-forest",
  5:  "bg-[#d0e8f5] text-[#1a3548]",
  6:  "bg-sage text-cream",
  7:  "bg-[#fdecea] text-forest",
  8:  "bg-[#edf5e0] text-forest",
  9:  "bg-[#fdf0e8] text-forest",
  10: "bg-[#e8eef5] text-forest",
  11: "bg-bark text-cream",
  12: "bg-[#ede8f5] text-forest",
  13: "bg-sand text-forest",
};

export default function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
      {CATEGORIES.map((cat, i) => (
        <Link
          key={cat.id}
          href={`/feed?cat=${cat.slug}`}
          className={cn(
            "rounded-2xl p-4 flex flex-col items-center gap-2 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer group",
            bgMap[i] ?? "bg-sand text-forest"
          )}
        >
          <span className="text-3xl">{cat.icon}</span>
          <span className="font-unbounded font-bold text-xs leading-tight">{cat.nameRu}</span>
        </Link>
      ))}
    </div>
  );
}
