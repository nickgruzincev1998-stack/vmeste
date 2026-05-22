"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, MapPin, Compass, Home, Plus, User } from "lucide-react";
import { UserButton, useAuth } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import NotificationBell from "@/components/layout/NotificationBell";

const navLinks = [
  { href: "/feed",    label: "Лента", icon: Home },
  { href: "/explore", label: "Найти", icon: Compass },
  { href: "/map",     label: "Карта", icon: MapPin },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { isSignedIn } = useAuth();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    if (isSignedIn) {
      fetch("/api/users/me")
        .then((r) => r.json())
        .then((data) => {
          if (data.username) setUsername(data.username);
        })
        .catch(() => {});
    }
  }, [isSignedIn]);

  return (
    <nav className="sticky top-0 z-50 bg-forest/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <Link href="/" className="flex items-center gap-1">
            <span className="font-unbounded font-black text-xl text-cream">
              вме<span className="text-mint">сте</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-golos font-medium transition-all duration-200",
                  pathname === href
                    ? "bg-mint/20 text-mint"
                    : "text-cream/70 hover:text-cream hover:bg-white/10"
                )}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <NotificationBell />
            <Link href="/activities/create" className="btn-primary text-sm px-5 py-2.5">
              <Plus size={16} />
              Создать событие
            </Link>
            {isSignedIn ? (
              <div className="flex items-center gap-2">
                {username && (
                  <Link
                    href={`/profile/${username}`}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-golos font-medium transition-all",
                      pathname.startsWith("/profile")
                        ? "bg-mint/20 text-mint"
                        : "text-cream/70 hover:text-cream hover:bg-white/10"
                    )}
                  >
                    <User size={15} />
                    Профиль
                  </Link>
                )}
                <UserButton />
              </div>
            ) : (
              <Link
                href="/sign-in"
                className="text-cream/70 hover:text-cream text-sm font-golos font-medium transition-colors"
              >
                Войти
              </Link>
            )}
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-cream p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-white/10 bg-forest">
          <div className="px-4 py-4 flex flex-col gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-golos font-medium transition-all",
                  pathname === href
                    ? "bg-mint/20 text-mint"
                    : "text-cream/70 hover:text-cream hover:bg-white/10"
                )}
              >
                <Icon size={18} />
                {label}
              </Link>
            ))}
            <div className="border-t border-white/10 mt-2 pt-4 flex flex-col gap-2">
              <Link
                href="/activities/create"
                onClick={() => setMenuOpen(false)}
                className="btn-primary text-sm justify-center"
              >
                <Plus size={16} />
                Создать событие
              </Link>
              {isSignedIn ? (
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    {username && (
                      <Link
                        href={`/profile/${username}`}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 text-cream/70 hover:text-cream text-sm font-golos transition-colors"
                      >
                        <User size={16} />
                        Мой профиль
                      </Link>
                    )}
                    <NotificationBell />
                  </div>
                  <UserButton />
                </div>
              ) : (
                <Link
                  href="/sign-in"
                  onClick={() => setMenuOpen(false)}
                  className="text-center text-cream/70 hover:text-cream text-sm font-golos py-2 transition-colors"
                >
                  Войти
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}