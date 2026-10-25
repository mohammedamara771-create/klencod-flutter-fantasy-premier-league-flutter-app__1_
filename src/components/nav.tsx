"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/", label: "الرئيسية", icon: "M3 10.5 12 3l9 7.5V21H3z" },
  { href: "/players", label: "اللاعبون", icon: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-8 9a8 8 0 0 1 16 0" },
  { href: "/team", label: "فريقي", icon: "M4 5h16v14H4zM4 9h16M9 9v10" },
  { href: "/fixtures", label: "المباريات", icon: "M5 4v16M19 4v16M5 9h14M5 15h14" },
  { href: "/stats", label: "الإحصاءات", icon: "M4 20V10M10 20V4M16 20v-7M22 20H2" },
];

const EXTRA = [
  { href: "/builder", label: "بناء تشكيلة" },
  { href: "/compare", label: "مقارنة لاعبين" },
  { href: "/leagues", label: "الدوريات" },
  { href: "/download", label: "ملف Flutter" },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 md:hidden">
      <div className="mx-auto max-w-lg px-3 pb-3">
        <div className="glass-strong flex items-center justify-between rounded-2xl px-1.5 py-1.5 shadow-2xl">
          {NAV.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-bold transition ${
                  active ? "bg-lime/15 text-lime" : "text-white/50"
                }`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon} />
                </svg>
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export function TopNav() {
  const pathname = usePathname();
  return (
    <nav className="hidden items-center gap-1 md:flex">
      {NAV.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
              active ? "bg-lime text-black" : "text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
      <span className="mx-1 h-4 w-px bg-white/15" />
      {EXTRA.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
            pathname.startsWith(item.href) ? "bg-white/15 text-white" : "text-white/45 hover:text-white"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function ExtraLinks() {
  return (
    <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 md:hidden">
      {EXTRA.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="glass shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold text-white/75"
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}

export function Countdown({ deadline, label = "الموعد النهائي" }: { deadline: string; label?: string }) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setRemaining(new Date(deadline).getTime() - Date.now());
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [deadline]);

  if (remaining === null) {
    return (
      <div className="text-left">
        <p className="text-[10px] font-semibold text-white/50">{label}</p>
        <p className="font-mono text-sm font-extrabold text-lime/60" dir="ltr">--:--:--</p>
      </div>
    );
  }

  if (remaining <= 0) {
    return (
      <span className="rounded-full bg-rose-500/20 px-2.5 py-1 text-[10px] font-extrabold text-rose-300">
        أُغلق الموعد النهائي
      </span>
    );
  }

  const days = Math.floor(remaining / 86_400_000);
  const hours = Math.floor((remaining % 86_400_000) / 3_600_000);
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);
  const seconds = Math.floor((remaining % 60_000) / 1000);

  return (
    <div className="text-left">
      <p className="text-[10px] font-semibold text-white/50">{label}</p>
      <p className="flex items-center gap-1 font-mono text-sm font-extrabold text-lime" dir="ltr">
        {days > 0 ? <span>{days}ي</span> : null}
        <span>{String(hours).padStart(2, "0")}:</span>
        <span>{String(minutes).padStart(2, "0")}:</span>
        <span className="w-6">{String(seconds).padStart(2, "0")}</span>
      </p>
    </div>
  );
}
