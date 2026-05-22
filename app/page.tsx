import Link from "next/link";
import { ArrowRight, Users, CalendarCheck, MapPin, Star, Zap, Shield } from "lucide-react";
import CategoryGrid from "@/components/shared/CategoryGrid";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { db } from "@/lib/db";

const heroCards = [
  { emoji: "🛖", title: "Баня на Серебрянке",        time: "Сегодня · 19:00", spots: "2 места" },
  { emoji: "🚴", title: "Велопрогулка по набережной", time: "Суббота · 10:00", spots: "6 мест" },
  { emoji: "⛺", title: "Глэмпинг у Сенежа",          time: "Эти выходные",    spots: "4 места" },
];

const steps = [
  { num: "01", title: "Создай профиль",           desc: "Укажи интересы и город. Займёт 2 минуты." },
  { num: "02", title: "Найди или создай событие", desc: "Просматривай ленту или предложи своё — дата, место, сколько нужно людей." },
  { num: "03", title: "Встречайся и отдыхай",     desc: "Запишись одним кликом, пообщайся в чате группы и выходи на активность." },
];

const features = [
  { icon: MapPin,        title: "События рядом",       desc: "Карта с активностями в твоём городе и точной геолокацией." },
  { icon: Users,         title: "Проверенные люди",     desc: "Рейтинги, отзывы и уровни участников для безопасного общения." },
  { icon: Zap,           title: "Любые активности",     desc: "14 категорий: от йоги до глэмпинга. Если нет нужной — создай сам." },
  { icon: CalendarCheck, title: "Простое планирование", desc: "Указывай дату, место, уровень сложности и количество участников." },
  { icon: Star,          title: "Система достижений",   desc: "Зарабатывай XP, повышай уровень и получай бейджи за активность." },
  { icon: Shield,        title: "Безопасно",            desc: "Модерация контента и возможность пожаловаться на участника." },
];

async function getRecentActivities() {
  try {
    return await db.activity.findMany({
      where: { status: "active" },
      include: {
        category: true,
        creator: true,
        _count: { select: { participants: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    });
  } catch {
    return [];
  }
}

export default async function LandingPage() {
  const recentActivities = await getRecentActivities();

  return (
    <div className="min-h-screen font-golos">
      <Navbar />

      {/* HERO */}
      <section className="bg-forest min-h-[92vh] flex items-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 right-1/3 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-sage/20 blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-mint/15 border border-mint/30 text-mint text-xs font-semibold px-4 py-2 rounded-full mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
                Найди свою компанию
              </div>
              <h1 className="font-unbounded font-black text-cream leading-[1.05] tracking-tight mb-6"
                  style={{ fontSize: "clamp(2.4rem, 5vw, 3.8rem)" }}>
                Досуг{" "}
                <span className="text-mint block">вместе —</span>
                интереснее
              </h1>
              <p className="text-cream/65 text-lg leading-relaxed max-w-md mb-10">
                Находи людей для совместных вылазок: баня, велопрогулки, глэмпинг, настолки и всё, что лучше с компанией.
              </p>
              <div className="flex flex-wrap gap-3 mb-14">
                <Link href="/feed" className="btn-primary text-base px-8 py-4">
                  Найти активность <ArrowRight size={18} />
                </Link>
                <Link href="/activities/create" className="btn-ghost text-base px-8 py-4">
                  Создать событие
                </Link>
              </div>
              <div className="flex gap-10">
                {[
                  { num: "2 400+", label: "участников" },
                  { num: "380",    label: "событий в месяц" },
                  { num: "18",     label: "городов" },
                ].map(({ num, label }) => (
                  <div key={label}>
                    <div className="font-unbounded font-black text-mint text-2xl leading-none">{num}</div>
                    <div className="text-cream/50 text-xs mt-1">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden lg:flex items-center justify-center">
              <div className="relative w-[380px] h-[460px]">
                {heroCards.map((card, i) => {
                  const positions = [
                    "top-0 left-4 rotate-[-4deg]",
                    "top-[140px] right-0 rotate-[3deg]",
                    "bottom-4 left-0 rotate-[-2deg]",
                  ];
                  const bgs = ["bg-cream", "bg-[#e8f4ed]", "bg-[#fdf3e8]"];
                  const delays = ["animate-float-slow", "animate-float-medium", "animate-float-fast"];
                  return (
                    <div key={card.title} className={`absolute ${positions[i]} ${bgs[i]} ${delays[i]} rounded-2xl p-5 shadow-2xl min-w-[200px]`}>
                      <div className="text-4xl mb-2">{card.emoji}</div>
                      <div className="font-unbounded font-bold text-forest text-sm mb-1">{card.title}</div>
                      <div className="text-bark text-xs mb-3">{card.time}</div>
                      <div className="inline-block bg-mint/20 text-sage text-xs font-semibold px-2.5 py-1 rounded-full">
                        {card.spots}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="section-label block mb-4">Категории</span>
          <h2 className="font-unbounded font-black text-forest mb-12"
              style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)" }}>
            Что будем делать?
          </h2>
          <CategoryGrid />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 bg-forest">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="section-label text-mint block mb-4">Как это работает</span>
          <h2 className="font-unbounded font-black text-cream mb-16"
              style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)" }}>
            Просто и быстро
          </h2>
          <div className="grid md:grid-cols-3 gap-0 relative">
            <div className="hidden md:block absolute top-6 left-[16.67%] right-[16.67%] h-px bg-mint/25" />
            {steps.map((s) => (
              <div key={s.num} className="relative pl-0 md:pl-8 pb-10 md:pb-0">
                <div className="w-12 h-12 rounded-full border-2 border-mint text-mint font-unbounded font-black text-sm flex items-center justify-center bg-forest mb-6">
                  {s.num}
                </div>
                <h3 className="font-unbounded font-bold text-cream text-base mb-2">{s.title}</h3>
                <p className="text-cream/55 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LIVE EVENTS */}
      <section className="py-24 bg-sand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-4">
            <span className="section-label">Ближайшие события</span>
            <Link href="/feed" className="text-sage hover:text-forest text-sm font-semibold transition-colors flex items-center gap-1">
              Все события <ArrowRight size={14} />
            </Link>
          </div>
          <h2 className="font-unbounded font-black text-forest mb-10"
              style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)" }}>
            Свежие вылазки
          </h2>

          {recentActivities.length > 0 ? (
            <div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {recentActivities.map((a) => (
                  <Link key={a.id} href={`/activities/${a.id}`} className="card block group">
                    <div className="h-36 flex items-center justify-center bg-forest/90 relative overflow-hidden">
                      <span className="text-6xl select-none">{a.category.icon}</span>
                      <div className="absolute top-3 left-3">
                        <span className="text-xs font-golos font-semibold px-2.5 py-1 rounded-full bg-mint/20 text-sage">
                          {a.category.nameRu}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-unbounded font-bold text-sm text-forest leading-snug mb-2 group-hover:text-sage transition-colors line-clamp-2">
                        {a.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-bark mb-1">
                        <MapPin size={12} />
                        <span className="truncate">{a.placeName}</span>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full bg-sage flex items-center justify-center text-cream text-xs font-bold">
                            {a.creator.name[0]}
                          </div>
                          <span className="text-xs text-bark">{a.creator.name}</span>
                        </div>
                        <span className="text-xs font-semibold text-sage">
                          {a.maxParticipants - a._count.participants} мест
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="mt-10 text-center">
                <Link href="/feed" className="btn-dark inline-flex">
                  Показать все события <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 bg-cream rounded-3xl">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="font-unbounded font-bold text-forest text-xl mb-2">Событий пока нет</h3>
              <p className="text-bark text-sm mb-6">Будь первым — создай событие!</p>
              <Link href="/activities/create" className="btn-dark inline-flex">
                Создать событие <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="section-label block mb-4">Возможности</span>
          <h2 className="font-unbounded font-black text-forest mb-14"
              style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)" }}>
            Всё для удобного досуга
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-sand rounded-2xl p-6 hover:-translate-y-1 transition-transform duration-200">
                <div className="w-11 h-11 rounded-xl bg-forest/10 flex items-center justify-center mb-4">
                  <Icon size={22} className="text-forest" />
                </div>
                <h3 className="font-unbounded font-bold text-forest text-sm mb-2">{title}</h3>
                <p className="text-bark text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-moss text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-mint/15 blur-3xl" />
        </div>
        <div className="max-w-2xl mx-auto px-4 relative z-10">
          <span className="section-label text-cream/70 block mb-4">Начать сейчас</span>
          <h2 className="font-unbounded font-black text-cream mb-6"
              style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)" }}>
            Хватит скучать в одиночку
          </h2>
          <p className="text-cream/70 text-lg mb-10 leading-relaxed">
            Зарегистрируйся бесплатно, найди единомышленников и договорись о встрече уже сегодня.
          </p>
          <Link href="/sign-up" className="btn-primary text-lg px-10 py-4 inline-flex">
            Создать профиль бесплатно <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}