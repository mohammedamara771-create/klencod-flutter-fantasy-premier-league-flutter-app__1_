import type { ReactNode } from "react";
import Link from "next/link";
import { fdrClass, playerPhoto, posColor, teamBadge, teamColor } from "@/lib/fpl/format";

export function Card({
  children,
  className = "",
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
}) {
  const Tag = as;
  return <Tag className={`glass rounded-3xl p-4 ${className}`}>{children}</Tag>;
}

export function SectionTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        <h2 className="text-base font-extrabold tracking-tight text-white sm:text-lg">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-[11px] text-white/50">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Badge({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${className}`}>
      {children}
    </span>
  );
}

export function PositionBadge({ position }: { position: string }) {
  const map: Record<string, string> = { GKP: "حارس", DEF: "مدافع", MID: "وسط", FWD: "مهاجم" };
  return <Badge className={posColor(position)}>{map[position] ?? position}</Badge>;
}

export function StatTile({
  label,
  value,
  hint,
  accent = "text-white",
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  accent?: string;
}) {
  return (
    <div className="glass rounded-2xl px-3 py-2.5">
      <p className="text-[10px] font-semibold text-white/45">{label}</p>
      <p className={`mt-0.5 text-lg font-extrabold leading-tight ${accent}`}>{value}</p>
      {hint ? <p className="text-[10px] text-white/35">{hint}</p> : null}
    </div>
  );
}

export function Bar({
  value,
  max,
  color = "bg-lime",
  height = "h-1.5",
}: {
  value: number;
  max: number;
  color?: string;
  height?: string;
}) {
  const width = max > 0 ? Math.max(2, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div className={`w-full overflow-hidden rounded-full bg-white/10 ${height}`}>
      <div className={`${height} rounded-full ${color}`} style={{ width: `${width}%` }} />
    </div>
  );
}

export function FdrPill({ difficulty, children }: { difficulty: number; children?: ReactNode }) {
  return (
    <span className={`inline-flex min-w-7 items-center justify-center rounded-lg border px-1.5 py-0.5 text-[10px] font-extrabold ${fdrClass(difficulty)}`}>
      {children ?? difficulty}
    </span>
  );
}

export function TeamBadge({ code, name, size = 50 }: { code: number; name?: string; size?: 50 | 70 }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={teamBadge(code, size)}
      alt={name ?? "شعار النادي"}
      width={28}
      height={28}
      className="h-7 w-7 object-contain"
      loading="lazy"
    />
  );
}

export function PlayerAvatar({
  photo,
  name,
  position,
  teamShort,
  size = 40,
}: {
  photo: string | null;
  name: string;
  position?: string;
  teamShort?: string;
  size?: number;
}) {
  const src = playerPhoto(photo);
  const color = teamShort ? teamColor(teamShort) : "#7c5cff";
  return (
    <span
      className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10"
      style={{ width: size, height: size, background: `linear-gradient(150deg, ${color}66, ${color}18)` }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} width={size} height={size} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <span className="text-[10px] font-extrabold text-white/80">{position ?? name.slice(0, 2)}</span>
      )}
    </span>
  );
}

export function EmptyState({
  title,
  message,
  icon = "📊",
  children,
}: {
  title: string;
  message?: string;
  icon?: string;
  children?: ReactNode;
}) {
  return (
    <div className="glass flex flex-col items-center gap-2 rounded-3xl px-5 py-10 text-center">
      <span className="text-3xl">{icon}</span>
      <p className="text-sm font-bold text-white">{title}</p>
      {message ? <p className="max-w-xs text-xs leading-5 text-white/50">{message}</p> : null}
      {children}
    </div>
  );
}

export function PillLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
        active ? "bg-lime text-black lime-glow" : "glass text-white/70 hover:text-white"
      }`}
    >
      {children}
    </Link>
  );
}

export function Notice({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "warn" }) {
  return (
    <div
      className={`rounded-2xl border px-3 py-2 text-[11px] leading-5 ${
        tone === "warn"
          ? "border-amber-400/30 bg-amber-400/10 text-amber-200"
          : "border-sky-400/25 bg-sky-400/10 text-sky-200"
      }`}
    >
      {children}
    </div>
  );
}

export function StatValue({ value, digits = 1 }: { value: number; digits?: number }) {
  return <span className="tabular-nums">{value.toFixed(digits)}</span>;
}
