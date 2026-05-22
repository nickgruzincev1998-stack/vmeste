import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
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
    <div className="min-h-screen font-golos">
      <Navbar />

      {/* HERO */}
      <section className="bg-forest min-h-screen flex items-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-sage/15 blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-mint/15 border border-mint/30 text-mint text-xs font-semibold px-4 py-2 rounded-full mb-10">
            <span className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
            Реальная жизнь. Без сложностей.
          </div>

          {/* Main headline */}
          <h1 className="font-unbounded font-black text-cream mb-6"
              style={{ fontSize: "clamp(2.8rem, 6vw, 5rem)", lineHeight: 1.0 }}>
            Нажал кнопку —<br />
            <span className="text-mint">нашёл людей.</span>
          </h1>

          <p className="text-cream/60 text-xl leading-relaxed max-w-2xl mx-auto mb-6">
            Как в CS или FIFA — только в реальной жизни.
          </p>

          <p className="text-cream/40 text-base max-w-xl mx-auto mb-14">
            Хочешь сыграть в футбол, поехать на велосипеде или сходить в баню?
            Не ищи людей днями. Просто нажми — и выходи.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <Link href="/feed" className="btn-primary text-lg px-10 py-5 text-center justify-center">
              Найти игру рядом
              <ArrowRight size={20} />
            </Link>
            <Link href="/activities/create" className="btn-ghost text-lg px-10 py-5 text-center justify-center">
              Создать игру
            </Link>
          </div>

          {/* How it works — 3 steps like game matchmaking */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            {[
              { step: "01", icon: "🎮", title: "Выбрал",    desc: "активность" },
              { step: "02", icon: "👥", title: "Нашёл",     desc: "людей рядом" },
              { step: "03", icon: "🏃", title: "Вышел",     desc: "и сыграл" },
            ].map((s) => (
              <div key={s.step} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
                <div className="text-3xl mb-2">{s.icon}</div>
                <div className="font-unbounded font-black text-mint text-lg">{s.title}</div>
                <div className="text-cream/50 text-sm mt-1">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ПРОБЛЕМА */}
      <section className="py-24 bg-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-unbounded font-black text-forest mb-6"
              style={{ fontSize: "clamp(1.8rem, 3vw, 2.8rem)" }}>
            Мир стал слишком онлайн
          </h2>
          <p className="text-bark text-lg leading-relaxed mb-16 max-w-2xl mx-auto">
            Мы часами листаем ленту и смотрим как другие живут. А чтобы просто собраться на футбол — нужно искать людей, писать в чаты, договариваться, ждать ответа.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Было */}
            <div className="bg-red-50 border border-red-100 rounded-3xl p-8 text-left">
              <div className="text-2xl mb-4">😩</div>
              <h3 className="font-unbounded font-bold text-red-800 text-lg mb-4">Раньше</h3>
              <ul className="space-y-3">
                {[
                  "Ищешь людей часами",
                  "Пишешь в 10 чатов",
                  "Ждёшь ответа днями",
                  "Половина отказывается",
                  "Так никуда и не вышел",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-red-700 text-sm font-golos">
                    <span className="text-red-400">✗</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Стало */}
            <div className="bg-forest border border-forest rounded-3xl p-8 text-left">
              <div className="text-2xl mb-4">⚡</div>
              <h3 className="font-unbounded font-bold text-mint text-lg mb-4">С нами</h3>
              <ul className="space-y-3">
                {[
                  "Открыл сайт",
                  "Увидел кто играет рядом",
                  "Нажал «Присоединиться»",
                  "Написал в чат группы",
                  "Вышел из дома и сыграл",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-cream text-sm font-golos">
                    <span className="text-mint">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* АКТИВНОСТИ */}
      <section className="py-24 bg-sand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="section-label block mb-4">Активности</span>
            <h2 className="font-unbounded font-black text-forest"
                style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)" }}>
              Что будем делать?
            </h2>
          </div>
          <CategoryGrid />
        </div>
      </section>

      {/* ЛЕНТА СОБЫТИЙ */}
      <section className="py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-4">
            <span className="section-label">Игры рядом</span>
            <Link href="/feed" className="text-sage hover:text-forest text-sm font-semibold transition-colors flex items-center gap-1">
              Все события <ArrowRight size={14} />
            </Link>
          </div>
          <h2 className="font-unbounded font-black text-forest mb-10"
              style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)" }}>
            Кто играет прямо сейчас?
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
                      {/* Spots left badge */}
                      <div className="absolute top-3 right-3">
                        <span className="text-xs font-golos font-bold px-2.5 py-1 rounded-full bg-white/90 text-forest">
                          {a.maxParticipants - a._count.participants} мест
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-unbounded font-bold text-sm text-forest leading-snug mb-2 group-hover:text-sage transition-colors line-clamp-2">
                        {a.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-bark mb-3">
                        <MapPin size={12} />
                        <span className="truncate">{a.placeName}</span>
                      </div>
                      {/* Progress bar */}
                      <div className="h-1.5 bg-sand rounded-full overflow-hidden mb-3">
                        <div
                          className="h-full bg-mint rounded-full"
                          style={{ width: `${Math.round((a._count.participants / a.maxParticipants) * 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full bg-sage flex items-center justify-center text-cream text-xs font-bold">
                            {a.creator.name[0]}
                          </div>
                          <span className="text-xs text-bark">{a.creator.name}</span>
                        </div>
                        <span className="text-xs font-semibold text-forest bg-mint/20 px-2.5 py-1 rounded-full">
                          Присоединиться →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="mt-10 text-center">
                <Link href="/feed" className="btn-dark inline-flex">
                  Смотреть все игры <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 bg-sand rounded-3xl">
              <div className="text-6xl mb-4">🎮</div>
              <h3 className="font-unbounded font-bold text-forest text-xl mb-2">Игр пока нет</h3>
              <p className="text-bark text-sm mb-6">Будь первым — создай игру!</p>
              <Link href="/activities/create" className="btn-dark inline-flex">
                Создать игру <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ФИЛОСОФИЯ */}
      <section className="py-24 bg-forest">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-unbounded font-black text-cream mb-6"
              style={{ fontSize: "clamp(1.8rem, 3vw, 2.8rem)" }}>
            Настоящие эмоции —<br />
            <span className="text-mint">не в ленте. В жизни.</span>
          </h2>
          <p className="text-cream/60 text-lg leading-relaxed mb-16 max-w-2xl mx-auto">
            TikTok, YouTube, Instagram — они продают тебе чужую жизнь. Мы даём тебе свою.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {[
              { icon: "⚽", text: "Спорт объединяет" },
              { icon: "🤝", text: "Живое общение важнее лайков" },
              { icon: "⚡", text: "Офлайн — так же просто как онлайн" },
              { icon: "🏃", text: "Компания за минуты, не дни" },
            ].map((item) => (
              <div key={item.text} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
                <div className="text-3xl mb-3">{item.icon}</div>
                <div className="text-cream/70 text-sm font-golos leading-snug">{item.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-24 bg-mint text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="font-unbounded font-black text-forest mb-4"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>
            Хватит смотреть.<br />Пора играть.
          </h2>
          <p className="text-forest/70 text-lg mb-10">
            Присоединяйся — и выходи из дома уже сегодня.
          </p>
          <Link href="/sign-up" className="inline-flex items-center gap-3 bg-forest text-cream font-unbounded font-bold text-lg px-12 py-5 rounded-full hover:bg-moss transition-colors">
            Начать бесплатно
            <ArrowRight size={22} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}