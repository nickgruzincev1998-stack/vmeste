import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-forest flex items-center justify-center px-4 font-golos">
      <div className="text-center">
        <div className="text-8xl mb-6">🗺️</div>
        <h1 className="font-unbounded font-black text-cream text-4xl mb-3">404</h1>
        <p className="text-cream/60 text-lg mb-8">Страница не найдена</p>
        <Link href="/" className="btn-primary inline-flex">
          На главную <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}
