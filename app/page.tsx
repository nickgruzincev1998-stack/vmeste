import Link from "next/link";
import { ArrowRight, MapPin, Zap, Users, Trophy } from "lucide-react";
import CategoryGrid from "@/components/shared/CategoryGrid";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { db } from "@/lib/db";

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
    <div className="min-h-screen font-golos bg-[#0a0f0a]">
      <Navbar />

      {/* HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[#0a0f0a]" />
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-forest/30 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-mint/10 blur-[100px]" />
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: "linear-gradient(#4ade80 1px, transparent 1px), linear-gradient(90deg, #4ade80 1px, transparent 1px)",
              backgroundSize: "60px 60px"
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 bg-mint/10 border border-mint/20 text-mint text-xs font-semibold px-4 py-2 rounded-full mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
                Прокачай персонажа — офлайн
              </div>

              <h1 className="font-unbounded font-black text-white mb-6 leading-[0.95]"
                style={{ fontSize: "clamp(3rem, 6vw, 5.5rem)" }}>
                НОВЫЕ<br />
                <span className="text-mint">ЛЮДИ.</span><br />
                НОВЫЕ<br />
                <span style={{ WebkitTextStroke: "2px #4ade80", color: "transparent" }}>КВЕСТЫ.</span>
              </h1>

              <p className="text-white/50 text-lg leading-relaxed mb-10 max-w-lg">
                Как в CS или FIFA — только в реальной жизни. Найди игру рядом за секунды.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/feed"
                  className="group flex items-center justify-center gap-3 bg-mint text-forest font-unbounded font-bold text-sm px-8 py-4 rounded-2xl hover:bg-mint/90 transition-all hover:scale-105 active:scale-95">
                  Найти игру рядом
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/activities/create"
                  className="flex items-center justify-center gap-3 bg-white/5 border border-white/10 text-white font-unbounded font-bold text-sm px-8 py-4 rounded-2xl hover:bg-white/10 transition-all">
                  Создать игру
                </Link>
              </div>

              {/* Stats */}
              <div className="flex gap-8 mt-12 pt-8 border-t border-white/10">
                {[
                  { icon: Zap, value: "60 XP", label: "за каждую игру" },
                  { icon: Users, value: "∞", label: "новых знакомств" },
                  { icon: Trophy, value: "5", label: "уровней прокачки" },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="flex items-center gap-2 mb-1">
                      <s.icon size={14} className="text-mint" />
                      <span className="font-unbounded font-black text-white text-xl">{s.value}</span>
                    </div>
                    <div className="text-white/40 text-xs font-golos">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — floating event cards */}
            <div className="hidden lg:block relative">
              <div className="relative h-[560px]">
                {/* Card 1 */}
                <div className="absolute top-0 right-8 w-64 bg-forest/80 backdrop-blur border border-white/10 rounded-3xl p-5 rotate-3 shadow-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-mint/20 flex items-center justify-center text-2xl">⚽</div>
                    <div>
                      <div className="text-white font-unbounded font-bold text-sm">Футбол 5x5</div>
                      <div className="text-white/50 text-xs">Сегодня · 18:00</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-white/50 text-xs mb-3">
                    <MapPin size={11} /> Парк Горького
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full mb-2">
                    <div className="h-full bg-mint rounded-full w-3/4" />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/40">7 из 10</span>
                    <span className="text-mint font-semibold">3 места</span>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="absolute top-40 left-0 w-64 bg-[#1a2a1a]/90 backdrop-blur border border-mint/20 rounded-3xl p-5 -rotate-2 shadow-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-mint/20 flex items-center justify-center text-2xl">🚴</div>
                    <div>
                      <div className="text-white font-unbounded font-bold text-sm">Велопрогулка</div>
                      <div className="text-white/50 text-xs">Завтра · 09:00</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-white/50 text-xs mb-3">
                    <MapPin size={11} /> Набережная
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full mb-2">
                    <div className="h-full bg-mint rounded-full w-1/3" />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/40">4 из 12</span>
                    <span className="text-mint font-semibold">8 мест</span>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="absolute bottom-10 right-4 w-64 bg-forest/80 backdrop-blur border border-white/10 rounded-3xl p-5 rotate-1 shadow-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-mint/20 flex items-center justify-center text-2xl">🏀</div>
                    <div>
                      <div className="text-white font-unbounded font-bold text-sm">Баскетбол 3x3</div>
                      <div className="text-white/50 text-xs">Вс · 15:00</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-white/50 text-xs mb-3">
                    <MapPin size={11} /> Площадка у школы
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full mb-2">
                    <div className="h-full bg-amber-400 rounded-full w-5/6" />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/40">5 из 6</span>
                    <span className="text-amber-400 font-semibold">1 место!</span>
                  </div>
                </div>

                {/* XP badge */}
                <div className="absolute top-28 right-0 bg-amber-400 text-forest font-unbounded font-black text-sm px-4 py-2 rounded-full shadow-lg">
                  +60 XP 🎯
                </div>

                {/* Level up */}
                <div className="absolute bottom-40 left-8 bg-mint text-forest font-unbounded font-black text-xs px-3 py-1.5 rounded-full shadow-lg">
                  ⚡ LEVEL UP!
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 bg-[#0d140d]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-mint text-xs font-semibold uppercase tracking-widest">Механика</span>
            <h2 className="font-unbounded font-black text-white mt-3"
              style={{ fontSize: "clamp(1.8rem, 3vw, 2.8rem)" }}>
              Проще чем в игре
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                num: "01", icon: "🎮", title: "Выбрал",
                desc: "Открыл ленту — увидел кто играет рядом прямо сейчас",
                color: "from-mint/20 to-transparent", border: "border-mint/20",
              },
              {
                num: "02", icon: "👥", title: "Нашёл",
                desc: "Нажал «Записаться» — попал в чат группы и познакомился",
                color: "from-amber-400/20 to-transparent", border: "border-amber-400/20",
              },
              {
                num: "03", icon: "🏃", title: "Вышел",
                desc: "Сыграл — получил XP, прокачал уровень, нашёл новых друзей",
                color: "from-purple-400/20 to-transparent", border: "border-purple-400/20",
              },
            ].map((s) => (
              <div key={s.num}
                className={`relative bg-gradient-to-b ${s.color} border ${s.border} rounded-3xl p-8 text-center`}>
                <div className="text-4xl mb-4">{s.icon}</div>
                <div className="font-unbounded font-black text-white/20 text-5xl absolute top-4 right-6">{s.num}</div>
                <div className="font-unbounded font-black text-white text-xl mb-3">{s.title}</div>
                <div className="text-white/50 text-sm leading-relaxed">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LEVELS */}
      <section className="py-24 bg-[#0a0f0a]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-mint text-xs font-semibold uppercase tracking-widest">Прокачка</span>
            <h2 className="font-unbounded font-black text-white mt-3"
              style={{ fontSize: "clamp(1.8rem, 3vw, 2.8rem)" }}>
              Твой путь от салаги<br />
              <span className="text-mint">до чемпиона</span>
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            {[
              { emoji: "🐣", title: "Салага",       xp: "0 — 299 XP",    games: "до 5 игр",    color: "bg-gray-500/20 border-gray-500/30",    bar: "w-[5%]",   barColor: "bg-gray-400" },
              { emoji: "🏃", title: "Активист",     xp: "300 — 899 XP",  games: "5 — 15 игр",  color: "bg-green-500/20 border-green-500/30",  bar: "w-[20%]",  barColor: "bg-green-400" },
              { emoji: "⚡", title: "Гроза района", xp: "900 — 2399 XP", games: "15 — 40 игр", color: "bg-blue-500/20 border-blue-500/30",    bar: "w-[45%]",  barColor: "bg-blue-400" },
              { emoji: "🔥", title: "Легенда",      xp: "2400 — 5399 XP",games: "40 — 90 игр", color: "bg-purple-500/20 border-purple-500/30", bar: "w-[75%]", barColor: "bg-purple-400" },
              { emoji: "👑", title: "Чемпион",      xp: "5400+ XP",      games: "90+ игр",     color: "bg-amber-500/20 border-amber-500/30",  bar: "w-full",   barColor: "bg-amber-400" },
            ].map((level) => (
              <div key={level.title}
                className={`flex items-center gap-5 ${level.color} border rounded-2xl px-6 py-4`}>
                <span className="text-3xl">{level.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-unbounded font-bold text-white text-sm">{level.title}</span>
                    <span className="text-white/40 text-xs">{level.games}</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full">
                    <div className={`h-full ${level.barColor} rounded-full ${level.bar}`} />
                  </div>
                </div>
                <span className="text-white/40 text-xs font-golos w-28 text-right">{level.xp}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-24 bg-[#0d140d]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-mint text-xs font-semibold uppercase tracking-widest">Активности</span>
            <h2 className="font-unbounded font-black text-white mt-3"
              style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)" }}>
              Что будем делать?
            </h2>
          </div>
          <CategoryGrid />
        </div>
      </section>

      {/* EVENTS */}
      {recentActivities.length > 0 && (
        <section className="py-24 bg-[#0a0f0a]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-4">
              <span className="text-mint text-xs font-semibold uppercase tracking-widest">Игры рядом</span>
              <Link href="/feed" className="text-mint/70 hover:text-mint text-sm font-semibold transition-colors flex items-center gap-1">
                Все события <ArrowRight size={14} />
              </Link>
            </div>
            <h2 className="font-unbounded font-black text-white mb-10"
              style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)" }}>
              Кто играет прямо сейчас?
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {recentActivities.map((a) => (
                <Link key={a.id} href={`/activities/${a.id}`}
                  className="group bg-forest/30 border border-white/10 rounded-3xl overflow-hidden hover:border-mint/30 transition-all hover:scale-[1.02]">
                  <div className="h-36 flex items-center justify-center bg-forest/50 relative">
                    <span className="text-6xl select-none">{a.category.icon}</span>
                    <div className="absolute top-3 left-3">
                      <span className="text-xs font-golos font-semibold px-2.5 py-1 rounded-full bg-mint/20 text-mint">
                        {a.category.nameRu}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="text-xs font-golos font-bold px-2.5 py-1 rounded-full bg-white/10 text-white">
                        {a.maxParticipants - a._count.participants} мест
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-unbounded font-bold text-sm text-white leading-snug mb-2 group-hover:text-mint transition-colors line-clamp-2">
                      {a.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-white/40 mb-3">
                      <MapPin size={12} />
                      <span className="truncate">{a.placeName}</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-3">
                      <div className="h-full bg-mint rounded-full"
                        style={{ width: `${Math.round((a._count.participants / a.maxParticipants) * 100)}%` }} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-mint/20 flex items-center justify-center text-mint text-xs font-bold">
                          {a.creator.name[0]}
                        </div>
                        <span className="text-xs text-white/40">{a.creator.name}</span>
                      </div>
                      <span className="text-xs font-semibold text-mint bg-mint/10 px-2.5 py-1 rounded-full group-hover:bg-mint/20 transition-colors">
                        Войти →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link href="/feed"
                className="inline-flex items-center gap-3 bg-mint text-forest font-unbounded font-bold text-sm px-10 py-4 rounded-2xl hover:bg-mint/90 transition-all hover:scale-105">
                Смотреть все игры <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-24 bg-[#0d140d] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-mint/5 blur-[100px]" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto px-4 text-center">
          <h2 className="font-unbounded font-black text-white mb-4"
            style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", lineHeight: 1.0 }}>
            ХВАТИТ<br />
            <span className="text-mint">СМОТРЕТЬ.</span><br />
            ПОРА ИГРАТЬ.
          </h2>
          <p className="text-white/40 text-lg mb-10">
            Присоединяйся — и выходи из дома уже сегодня.
          </p>
          <Link href="/sign-up"
            className="inline-flex items-center gap-3 bg-mint text-forest font-unbounded font-bold text-lg px-12 py-5 rounded-2xl hover:bg-mint/90 transition-all hover:scale-105 active:scale-95">
            Начать бесплатно
            <ArrowRight size={22} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
