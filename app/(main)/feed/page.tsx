import Link from "next/link";
import { ArrowRight, MapPin, Plus, Search } from "lucide-react";
import { db } from "@/lib/db";

async function getActivities() {
  try {
    return await db.activity.findMany({
      where: { status: "active" },
      include: {
        category: true,
        creator: true,
        _count: { select: { participants: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    });
  } catch {
    return [];
  }
}

async function getCategories() {
  try {
    return await db.category.findMany({ orderBy: { nameRu: "asc" } });
  } catch {
    return [];
  }
}

export default async function FeedPage() {
  const [activities, categories] = await Promise.all([
    getActivities(),
    getCategories(),
  ]);

  return (
    <div className="min-h-screen bg-[#0a0f0a]">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0d140d]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-unbounded font-black text-white text-xl">
                Лента событий
              </h1>
              <p className="text-white/40 text-sm mt-1 font-golos">
                {activities.length > 0
                  ? `${activities.length} активных игр рядом`
                  : "Пока нет активных игр"}
              </p>
            </div>
            <Link
              href="/activities/create"
              className="inline-flex items-center gap-2 bg-mint text-forest font-unbounded font-bold text-sm px-5 py-3 rounded-2xl hover:bg-mint/90 transition-all hover:scale-105 active:scale-95 self-start sm:self-auto"
            >
              <Plus size={16} />
              Создать игру
            </Link>
          </div>

          {/* Category filter pills */}
          {categories.length > 0 && (
            <div className="flex gap-2 mt-5 overflow-x-auto pb-1 scrollbar-hide">
              <Link
                href="/feed"
                className="flex-shrink-0 text-xs font-semibold px-4 py-2 rounded-full bg-mint text-forest font-golos transition-all"
              >
                Все
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/feed?category=${cat.id}`}
                  className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white font-golos transition-all"
                >
                  <span>{cat.icon}</span>
                  {cat.nameRu}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activities.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {activities.map((a) => {
              const spotsLeft = a.maxParticipants - a._count.participants;
              const fillPct = Math.round(
                (a._count.participants / a.maxParticipants) * 100
              );
              return (
                <Link
                  key={a.id}
                  href={`/activities/${a.id}`}
                  className="group bg-forest/20 border border-white/10 rounded-3xl overflow-hidden hover:border-mint/30 transition-all hover:scale-[1.02] hover:bg-forest/30"
                >
                  {/* Icon area */}
                  <div className="h-32 flex items-center justify-center bg-forest/40 relative">
                    <span className="text-5xl select-none">{a.category.icon}</span>
                    <div className="absolute top-3 left-3">
                      <span className="text-xs font-golos font-semibold px-2.5 py-1 rounded-full bg-mint/20 text-mint">
                        {a.category.nameRu}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span
                        className={`text-xs font-golos font-bold px-2.5 py-1 rounded-full ${
                          spotsLeft <= 2
                            ? "bg-red-500/20 text-red-400"
                            : "bg-white/10 text-white"
                        }`}
                      >
                        {spotsLeft === 0 ? "Мест нет" : `${spotsLeft} мест`}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <h3 className="font-unbounded font-bold text-sm text-white leading-snug mb-2 group-hover:text-mint transition-colors line-clamp-2">
                      {a.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-white/40 mb-3 font-golos">
                      <MapPin size={12} className="flex-shrink-0" />
                      <span className="truncate">{a.placeName}</span>
                    </div>

                    {/* Fill bar */}
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-3">
                      <div
                        className="h-full bg-mint rounded-full transition-all"
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-mint/20 flex items-center justify-center text-mint text-xs font-bold">
                          {a.creator.name[0]?.toUpperCase()}
                        </div>
                        <span className="text-xs text-white/40 font-golos">
                          {a.creator.name}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-mint bg-mint/10 px-2.5 py-1 rounded-full group-hover:bg-mint/20 transition-colors">
                        Войти →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="text-7xl mb-6">🎮</div>
            <h2 className="font-unbounded font-black text-white text-2xl mb-3">
              Игр пока нет
            </h2>
            <p className="text-white/40 text-base mb-8 max-w-sm font-golos">
              Будь первым — создай игру и найди команду!
            </p>
            <Link
              href="/activities/create"
              className="inline-flex items-center gap-3 bg-mint text-forest font-unbounded font-bold text-sm px-8 py-4 rounded-2xl hover:bg-mint/90 transition-all hover:scale-105"
            >
              Создать игру
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
