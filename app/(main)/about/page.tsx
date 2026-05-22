import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen font-golos">

      {/* HERO */}
      <section className="bg-forest py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-sage/15 blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <span className="inline-flex items-center gap-2 bg-mint/15 border border-mint/30 text-mint text-xs font-semibold px-4 py-2 rounded-full mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
            Наша история
          </span>
          <h1 className="font-unbounded font-black text-cream mb-6"
              style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)", lineHeight: 1.05 }}>
            Мир стал слишком <span className="text-mint">онлайн</span>
          </h1>
          <p className="text-cream/60 text-xl leading-relaxed max-w-2xl mx-auto">
            Мы проводим часы в соцсетях, играх и бесконечной ленте. Но реальная жизнь — наоборот.
          </p>
        </div>
      </section>

      {/* ПРОБЛЕМА */}
      <section className="py-20 bg-cream">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="prose prose-lg max-w-none">
            <div className="bg-sand rounded-3xl p-8 sm:p-12 mb-8">
              <h2 className="font-unbounded font-black text-forest text-2xl mb-6">
                Чтобы просто собраться на футбол, нужно:
              </h2>
              <ul className="space-y-4">
                {[
                  "Искать людей",
                  "Писать в чаты",
                  "Договариваться",
                  "Искать место",
                  "Ждать ответа",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-4 text-bark text-lg font-golos">
                    <span className="w-8 h-8 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-sm flex-shrink-0">✗</span>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-bark text-lg mt-6 font-golos font-semibold">
                Слишком много сложностей для чего-то такого простого.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ИНСАЙТ */}
      <section className="py-20 bg-forest">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-unbounded font-black text-cream text-3xl mb-8">
            Мы задумались
          </h2>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 sm:p-12 mb-8 text-left">
            <p className="text-cream/80 text-lg font-golos leading-relaxed mb-6">
              В онлайн-играх всё работает за секунды:
            </p>
            <ul className="space-y-3">
              {[
                { icon: "🎮", text: "Нажал кнопку" },
                { icon: "👥", text: "Нашлись люди" },
                { icon: "⚡", text: "Матч начался" },
              ].map((item) => (
                <li key={item.text} className="flex items-center gap-4 text-cream text-lg font-golos">
                  <span className="text-2xl">{item.icon}</span>
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-mint rounded-3xl p-8 sm:p-12">
            <p className="font-unbounded font-black text-forest text-2xl leading-tight">
              Почему в реальной жизни всё не может быть так же просто?
            </p>
          </div>
        </div>
      </section>

      {/* НАША ИДЕЯ */}
      <section className="py-20 bg-cream">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="font-unbounded font-black text-forest text-3xl mb-8 text-center">
            Так появился наш проект
          </h2>
          <div className="bg-sand rounded-3xl p-8 sm:p-12 mb-6">
            <p className="text-bark text-lg font-golos leading-relaxed mb-8">
              Мы создаём сервис, который помогает людям быстро находить друг друга для спорта, игр и активностей рядом.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: "🚫", text: "Без сложной организации" },
                { icon: "🚫", text: "Без бесконечных переписок" },
                { icon: "🚫", text: "Без «может быть потом»" },
              ].map((item) => (
                <div key={item.text} className="bg-white rounded-2xl p-4 text-center">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <div className="text-forest text-sm font-golos font-semibold">{item.text}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-forest rounded-3xl p-8 sm:p-12">
            <h3 className="font-unbounded font-bold text-mint text-xl mb-6">Просто:</h3>
            <div className="space-y-4">
              {[
                { num: "1", text: "Выбрал активность" },
                { num: "2", text: "Нашёл людей рядом" },
                { num: "3", text: "Собрался" },
                { num: "4", text: "Пошёл играть" },
              ].map((item) => (
                <div key={item.num} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-mint text-forest font-unbounded font-black text-sm flex items-center justify-center flex-shrink-0">
                    {item.num}
                  </div>
                  <span className="text-cream text-lg font-golos">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ВО ЧТО МЫ ВЕРИМ */}
      <section className="py-20 bg-sand">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="font-unbounded font-black text-forest text-3xl mb-10 text-center">
            Во что мы верим
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: "⚽", text: "Спорт объединяет людей" },
              { icon: "🤝", text: "Живое общение важнее лайков" },
              { icon: "⚡", text: "Офлайн должен быть таким же простым, как онлайн" },
              { icon: "⏱️", text: "Найти компанию рядом должно занимать минуты, а не дни" },
            ].map((item) => (
              <div key={item.text} className="bg-white rounded-2xl p-6 flex items-start gap-4">
                <span className="text-3xl flex-shrink-0">{item.icon}</span>
                <p className="text-forest font-golos font-semibold text-base leading-snug">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ЦЕЛЬ */}
      <section className="py-20 bg-forest">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-unbounded font-black text-cream text-3xl mb-10">
            Наша цель
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-12">
            {[
              { icon: "📵", text: "Меньше застревать в экранах" },
              { icon: "🚪", text: "Чаще выходить из дома" },
              { icon: "👋", text: "Знакомиться вживую" },
              { icon: "❤️", text: "Проводить время вместе" },
            ].map((item) => (
              <div key={item.text} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-4 text-left">
                <span className="text-3xl flex-shrink-0">{item.icon}</span>
                <p className="text-cream font-golos text-base">{item.text}</p>
              </div>
            ))}
          </div>
          <div className="bg-mint rounded-3xl p-8">
            <p className="font-unbounded font-black text-forest text-xl leading-tight">
              Потому что настоящие эмоции происходят не в ленте.
              <br />А в жизни.
            </p>
          </div>
        </div>
      </section>

      {/* ЧТО МЫ СТРОИМ */}
      <section className="py-20 bg-cream">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-unbounded font-black text-forest text-3xl mb-6">
            Что мы строим
          </h2>
          <p className="text-bark text-xl leading-relaxed mb-12 font-golos">
            Не просто приложение.<br />
            <span className="font-semibold text-forest">А способ сделать реальную жизнь доступнее, проще и живее.</span>
          </p>
          <Link href="/sign-up" className="inline-flex items-center gap-3 bg-forest text-cream font-unbounded font-bold text-lg px-12 py-5 rounded-full hover:bg-moss transition-colors">
            Присоединиться
            <ArrowRight size={22} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}