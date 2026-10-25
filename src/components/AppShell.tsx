import Link from "next/link";
import type { ReactNode } from "react";
import { BottomNav, Countdown, ExtraLinks, TopNav } from "./nav";
import { SyncButton } from "./SyncButton";

export function AppShell({
  children,
  gameweekName,
  deadline,
  averageScore,
  source,
  updatedAt,
}: {
  children: ReactNode;
  gameweekName?: string;
  deadline?: string;
  averageScore?: number;
  source: "live" | "cache";
  updatedAt: string;
}) {
  const updated = new Intl.DateTimeFormat("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(updatedAt));

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-white/5 bg-[#07060f]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="lime-glow flex h-9 w-9 items-center justify-center rounded-2xl bg-lime text-base font-black text-black">
                ⚽
              </span>
              <span className="leading-tight">
                <span className="block text-sm font-extrabold text-white">فانتازي أرينا</span>
                <span className="block text-[9px] font-semibold text-white/40">الدوري الإنجليزي · بيانات رسمية</span>
              </span>
            </Link>
            <TopNav />
          </div>
          <div className="flex items-center gap-2.5">
            {gameweekName ? (
              <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 sm:flex">
                <span className="live-dot h-1.5 w-1.5 rounded-full bg-mint" />
                <span className="text-[10px] font-bold text-white/70">{gameweekName}</span>
                {typeof averageScore === "number" && averageScore > 0 ? (
                  <span className="text-[10px] font-bold text-lime">متوسط {averageScore}</span>
                ) : null}
              </div>
            ) : null}
            {deadline ? <div className="hidden sm:block"><Countdown deadline={deadline} /></div> : null}
            <SyncButton compact />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 pb-28 pt-4 md:pb-12">
        <div className="mb-3 flex items-center justify-between gap-2 text-[10px] text-white/40">
          <div className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${source === "live" ? "bg-mint" : "bg-amber-400"}`} />
            <span>
              {source === "live" ? "مصدر البيانات: الواجهة الرسمية للفانتازي" : "وضع النسخة المحفوظة (قاعدة البيانات)"} · آخر تحديث {updated} UTC
            </span>
          </div>
          <span className="hidden font-semibold sm:block">fantasy.premierleague.com/api</span>
        </div>
        {deadline ? (
          <div className="mb-3 sm:hidden">
            <div className="glass flex items-center justify-between rounded-2xl px-3 py-2">
              <div>
                <p className="text-[10px] text-white/45">{gameweekName ?? "الجولة الحالية"}</p>
                <p className="text-xs font-extrabold text-white">استعد قبل الموعد النهائي</p>
              </div>
              <Countdown deadline={deadline} label="متبقٍ" />
            </div>
          </div>
        ) : null}
        <div className="mb-3 md:hidden">
          <ExtraLinks />
        </div>
        {children}

        <footer className="mt-8 space-y-1 border-t border-white/5 pt-4 text-[10px] leading-5 text-white/30">
          <p>
            البيانات مصدرها الواجهة الرسمية <span className="font-mono text-white/40">fantasy.premierleague.com/api</span> مع
            نسخة محفوظة في PostgreSQL للرجوع إليها عند انقطاع الاتصال.
          </p>
          <p>
            واجهة JSON عامة (CORS مفتوح) لتطبيقات Flutter وغيرها:{" "}
            <Link href="/api/fpl?limit=10" className="font-mono text-lime/70">/api/fpl</Link>{" · "}
            <Link href="/api/fpl/manager/1" className="font-mono text-lime/70">/api/fpl/manager/1</Link>
          </p>
          <p>فانتازي أرينا · تطبيق ويب بتجربة موبايل (قابل للتثبيت كتطبيق) — ليس تابعاً رسمياً لـ Fantasy Premier League.</p>
        </footer>
      </div>
      <BottomNav />
    </div>
  );
}
