import type { Position } from "./types";

export function money(value: number): string {
  return value.toFixed(1);
}

export function posAr(position: Position | string): string {
  switch (position) {
    case "GKP":
      return "حارس";
    case "DEF":
      return "مدافع";
    case "MID":
      return "وسط";
    case "FWD":
      return "مهاجم";
    default:
      return position;
  }
}

export function posLongAr(position: Position | string): string {
  switch (position) {
    case "GKP":
      return "حراسة المرمى";
    case "DEF":
      return "خط الدفاع";
    case "MID":
      return "خط الوسط";
    case "FWD":
      return "خط الهجوم";
    default:
      return position;
  }
}

export function posColor(position: Position | string): string {
  switch (position) {
    case "GKP":
      return "bg-amber-400/15 text-amber-300 border-amber-400/30";
    case "DEF":
      return "bg-sky-400/15 text-sky-300 border-sky-400/30";
    case "MID":
      return "bg-emerald-400/15 text-emerald-300 border-emerald-400/30";
    case "FWD":
      return "bg-rose-400/15 text-rose-300 border-rose-400/30";
    default:
      return "bg-white/10 text-white/70 border-white/20";
  }
}

export function fdrClass(difficulty: number): string {
  if (difficulty <= 2) return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
  if (difficulty === 3) return "bg-amber-400/20 text-amber-200 border-amber-400/40";
  if (difficulty === 4) return "bg-orange-500/20 text-orange-300 border-orange-500/40";
  return "bg-rose-600/25 text-rose-300 border-rose-500/50";
}

const TEAM_COLORS: Record<string, string> = {
  ARS: "#EF0107",
  AVL: "#95BFE5",
  BOU: "#DA291C",
  BRE: "#e30613",
  BHA: "#0057B8",
  CHE: "#034694",
  COV: "#5BC2E7",
  CRY: "#1B458F",
  EVE: "#003399",
  FUL: "#CC0000",
  HUL: "#F5A12D",
  IPS: "#3a64a3",
  LEE: "#FFCD00",
  LEI: "#003090",
  LIV: "#C8102E",
  MCI: "#6CABDD",
  MUN: "#DA291C",
  NEW: "#241F20",
  NFO: "#DD0000",
  SOU: "#D71920",
  SUN: "#EB172B",
  TOT: "#132257",
  WHU: "#7A263A",
  WOL: "#FDB913",
  BUR: "#6C1D45",
  LUT: "#F78F1E",
  SHU: "#EE2737",
};

export function teamColor(shortName: string): string {
  return TEAM_COLORS[shortName] ?? "#5b3df5";
}

export function teamGradient(shortName: string): string {
  const color = teamColor(shortName);
  return `linear-gradient(135deg, ${color}55, ${color}12)`;
}

export function playerPhoto(photo: string | null, code?: number): string | null {
  if (photo) {
    const base = photo.replace(/\.jpg$/i, ".png");
    return `https://resources.premierleague.com/premierleague/photos/players/110x140/p${base}`;
  }
  if (code) {
    return `https://resources.premierleague.com/premierleague/photos/players/110x140/${code}.png`;
  }
  return null;
}

export function teamBadge(code: number, size: 50 | 70 = 50): string {
  return `https://resources.premierleague.com/premierleague/badges/${size}/t${code}.png`;
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "غير محدد";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "غير محدد";
  return new Intl.DateTimeFormat("ar-EG", {
    weekday: "short",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(date);
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("ar-EG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function compact(value: number): string {
  if (!Number.isFinite(value)) return "0";
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return Math.round(value).toString();
}

export function signed(value: number, digits = 1): string {
  const fixed = value.toFixed(digits);
  return value > 0 ? `+${fixed}` : fixed;
}

export function rankText(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-US").format(value);
}

export function hexAlpha(hex: string, alpha: number): string {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized.length === 3 ? normalized.replace(/(.)/g, "$1$1") : normalized, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
