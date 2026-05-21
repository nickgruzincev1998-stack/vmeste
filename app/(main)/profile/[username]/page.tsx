import { Star, Users, Calendar, Trophy, MapPin, ArrowLeft } from "lucide-react";
import Link from "next/link";
import ActivityCard from "@/components/activity/ActivityCard";
import { MOCK_ACTIVITIES } from "@/types";

const badges = [
  { icon: "🚴", label: "Cyclist",    desc: "5 велопрогулок" },
  { icon: "🔥", label: "On Fire",    desc: "Streak 7 дней" },
  { icon: "⭐", label: "5-Star Host", desc: "10 отзывов 5★" },
  { icon: "🤝", label: "Connector",  desc: "5 приглашений" },
];

export default function ProfilePage({ params }: { params: { username: string } }) {
  const userActivities = MOCK_ACTIVITIES.slice(0, 3);

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-forest text-cream pb-20 pt-8 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-sage/10 blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          <Link href="/feed" className="flex items-center gap-2 text-cream/60 hover:text-cream text-sm mb-6 transition-colors font-golos">
            <ArrowLeft size={15} /> Назад
          </Link>

          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-3xl bg-mint flex items-center justify-center text-forest font-unbounded font-black text-4xl shadow-xl">
              {params.username[0].toUpperCase()}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="font-unbounded font-black text-2xl">Алёна К.</h1>
                <span className="bg-mint/20 text-mint text-xs font-semibold px-2.5 py-1 rounded-full">Уровень 3</span>
              </div>
              <div className="flex items-center gap-1.5 text-cream/60 text-sm mb-2">
                <MapPin size={13} /> Москва
              </div>
              <div className="flex items-center gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} fill={i < 4 ? "currentColor" : "none"} />
                ))}
                <span className="text-cream/60 text-xs ml-1">4.9 · 23 отзыва</span>
              </div>
            </div>

            <button className="bg-mint text-forest font-golos font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-cream transition-colors">
              Подписаться
            </button>
          </div>

          {/* Bio */}
          <p className="text-cream/65 text-sm mt-4 max-w-lg leading-relaxed font-golos">
            Люблю велопрогулки, хайкинг и активный отдых на природе. Всегда рада новым знакомствам и совместным приключениям!
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-10 pb-12">

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {[
            { icon: Calendar, num: "24", label: "событий" },
            { icon: Users,    num: "156", label: "подписчиков" },
            { icon: Trophy,   num: "3 200", label: "XP" },
            { icon: Star,     num: "4.9", label: "рейтинг" },
          ].map(({ icon: Icon, num, label }) => (
            <div key={label} className="bg-white rounded-2xl p-4 text-center shadow-sm border border-forest/8">
              <Icon size={18} className="text-sage mx-auto mb-2" />
              <div className="font-unbounded font-black text-forest text-lg">{num}</div>
              <div className="text-bark text-xs mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* XP Bar */}
        <div className="bg-white rounded-2xl p-5 mb-6 border border-forest/8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-golos font-semibold text-forest">Уровень 3 — Энтузиаст</span>
            <span className="text-xs text-bark">3 200 / 5 000 XP</span>
          </div>
          <div className="h-2.5 bg-sand rounded-full overflow-hidden">
            <div className="h-full bg-mint rounded-full" style={{ width: "64%" }} />
          </div>
          <div className="text-xs text-bark mt-1.5">До уровня 4 (Чемпион) осталось 1 800 XP</div>
        </div>

        {/* Badges */}
        <div className="bg-white rounded-2xl p-5 mb-6 border border-forest/8">
          <h2 className="font-unbounded font-bold text-forest text-base mb-4">Достижения</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {badges.map((b) => (
              <div key={b.label} className="flex items-center gap-3 p-3 bg-sand rounded-xl">
                <span className="text-2xl">{b.icon}</span>
                <div>
                  <div className="font-golos font-semibold text-forest text-xs">{b.label}</div>
                  <div className="text-bark text-xs">{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activities */}
        <div>
          <h2 className="font-unbounded font-bold text-forest text-xl mb-5">События пользователя</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {userActivities.map((a) => <ActivityCard key={a.id} activity={a} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
