import Link from "next/link";
import type { Player } from "@/lib/fpl/types";
import { money, signed } from "@/lib/fpl/format";
import { PlayerAvatar, PositionBadge, TeamBadge } from "./ui";

export function PlayerRow({
  player,
  rank,
  metric,
  metricLabel,
  showPrice = true,
}: {
  player: Player;
  rank?: number;
  metric?: string;
  metricLabel?: string;
  showPrice?: boolean;
}) {
  return (
    <Link
      href={`/players/${player.id}`}
      className="group flex items-center gap-2.5 rounded-2xl border border-transparent px-2 py-2 transition hover:border-white/10 hover:bg-white/5"
    >
      {typeof rank === "number" ? (
        <span className={`w-5 text-center text-[11px] font-extrabold ${rank <= 3 ? "text-lime" : "text-white/35"}`}>
          {rank}
        </span>
      ) : null}
      <PlayerAvatar photo={player.photo} name={player.webName} position={player.position} teamShort={player.teamShort} size={38} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-[13px] font-extrabold text-white group-hover:text-lime">{player.webName}</p>
          {player.status !== "a" ? (
            <span className="rounded bg-rose-500/20 px-1 text-[9px] font-bold text-rose-300">
              {player.chanceNext !== null ? `${player.chanceNext}%` : "خطر"}
            </span>
          ) : null}
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-white/45">
          <TeamBadge code={player.teamCode} name={player.teamShort} />
          <span className="font-bold text-white/55">{player.teamShort}</span>
          <span>·</span>
          <span>{player.position}</span>
          {showPrice ? (
            <>
              <span>·</span>
              <span className="font-bold text-mint">£{money(player.cost)}</span>
            </>
          ) : null}
        </div>
      </div>
      <div className="text-left">
        {metric ? <p className="text-sm font-extrabold text-white">{metric}</p> : null}
        <p className="text-[9px] text-white/40">{metricLabel ?? "نقاط"}</p>
      </div>
    </Link>
  );
}

export function PriceMove({ player }: { player: Player }) {
  const up = player.costChangeEvent >= 0;
  return (
    <Link href={`/players/${player.id}`} className="flex items-center justify-between gap-2 rounded-xl px-2 py-1.5 hover:bg-white/5">
      <div className="flex min-w-0 items-center gap-2">
        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-black ${up ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"}`}>
          {up ? "▲" : "▼"}
        </span>
        <span className="truncate text-[11px] font-bold text-white/85">{player.webName}</span>
        <span className="shrink-0 text-[9px] text-white/35">{player.teamShort}</span>
      </div>
      <span className={`shrink-0 text-[10px] font-extrabold ${up ? "text-emerald-300" : "text-rose-300"}`}>
        {signed(player.costChangeEvent)}
      </span>
    </Link>
  );
}

export function PlayerStatLine({ label, value, highlight = false }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className={`flex items-center justify-between rounded-xl px-2.5 py-1.5 ${highlight ? "bg-lime/10" : "bg-white/[0.04]"}`}>
      <span className="text-[11px] text-white/55">{label}</span>
      <span className={`text-[11px] font-extrabold ${highlight ? "text-lime" : "text-white"}`}>{value}</span>
    </div>
  );
}

export function PlayerPositionPill({ player }: { player: Player }) {
  return <PositionBadge position={player.position} />;
}
