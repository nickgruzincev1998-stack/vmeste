import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-forest text-cream/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-2">
            <div className="font-unbounded font-black text-2xl text-cream mb-3">
              вме<span className="text-mint">сте</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Платформа для поиска компании в активном отдыхе. Велопрогулки, баня, глэмпинг — всё лучше с людьми рядом.
            </p>
          </div>
          <div>
            <div className="text-cream font-golos font-semibold mb-4 text-sm">Платформа</div>
            <ul className="space-y-2 text-sm">
              <li><Link href="/feed"             className="hover:text-cream transition-colors">Лента событий</Link></li>
              <li><Link href="/map"              className="hover:text-cream transition-colors">Карта</Link></li>
              <li><Link href="/activities/create" className="hover:text-cream transition-colors">Создать событие</Link></li>
            </ul>
          </div>
          <div>
            <div className="text-cream font-golos font-semibold mb-4 text-sm">Активности</div>
            <ul className="space-y-2 text-sm">
              <li><Link href="/feed?cat=cycling"  className="hover:text-cream transition-colors">Велосипед</Link></li>
              <li><Link href="/feed?cat=hiking"   className="hover:text-cream transition-colors">Хайкинг</Link></li>
              <li><Link href="/feed?cat=glamping" className="hover:text-cream transition-colors">Глэмпинг</Link></li>
              <li><Link href="/feed?cat=bath"     className="hover:text-cream transition-colors">Баня</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <span>© 2025 Вместе. Досуг с людьми рядом.</span>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-cream transition-colors">Конфиденциальность</Link>
            <Link href="#" className="hover:text-cream transition-colors">Условия</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
