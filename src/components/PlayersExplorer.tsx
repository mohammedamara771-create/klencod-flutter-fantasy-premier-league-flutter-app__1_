"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { money, playerPhoto, posColor, teamBadge, teamColor } from "@/lib/fpl/format";
import type { PlayerLite, TeamLite } from "@/lib/fpl/lite";

type SortKey = "points" | "form" | "cost" | "selected" | "goals" | "assists" | "xgi" | "minutes" | "ppg" | "value" | "eventPoints" | "bps";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "points", label: "النقاط" },
  { key: "eventPoints", label: "نقاط الجولة" },
  { key: "form", label: "الفورمة" },
  { key: "cost", label: "السعر" },
  { key: "selected", label: "الامتلاك" },
  { key: "goals", label: "الأهداف" },
  { key: "assists", label: "الصناعة" },
  { key: "xgi", label: "xGI" },
  { key: "ppg", label: "نقاط/مباراة" },
  { key: "value", label: "القيمة" },
  { key: "bps", label: "BPS" },
  { key: "minutes", label: "الدقائق" },
];

const POSITIONS = [
  { key: "ALL", label: "الكل" },
  { key: "GKP", label: "حراس" },
  { key: "DEF", label: "دفاع" },
  { key: "MID", label: "وسط" },
  { key: "FWD", label: "هجوم" },
];

export function PlayersExplorer({
  players,
  teams,
  watchedIds,
}: {
  players: PlayerLite[];
  teams: TeamLite[];
  watchedIds: number[];
}) {
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState("ALL");
  const [team, setTeam] = useState("ALL");
  const [sort, setSort] = useState<SortKey>("points");
  const [maxPrice, setMaxPrice] = useState(16);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [limit, setLimit] = useState(25);
  const [watched, setWatched] = useState<Set<number>>(new Set(watchedIds));
  const [busy, setBusy] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    const list = players.filter((player) => {
      if (position !== "ALL" && player.position !== position) return false;
      if (team !== "ALL" && player.team !== team) return false;
      if (player.cost > maxPrice) return false;
      if (availableOnly && player.status !== "a") return false;
      if (!search) return true;
      return (
        player.name.toLowerCase().includes(search) ||
        player.team.toLowerCase().includes(search) ||
        player.position.toLowerCase().includes(search)
      );
    });
    return list.sort((a, b) => {
      if (sort === "cost") return a.cost - b.cost;
      if (sort === "xgi") return b.xgi - a.xgi;
      if (sort === "value") return b.value - a.value;
      const map: Record<Exclude<SortKey, "cost" | "xgi" | "value">, number> = {
        points: b.points - a.points,
        eventPoints: b.eventPoints - a.eventPoints,
        form: b.form - a.form,
        selected: b.selected - a.selected,
        goals: b.goals - a.goals,
        assists: b.assists - a.assists,
        minutes: b.minutes - a.minutes,
        ppg: b.ppg - a.ppg,
        bps: b.bps - a.bps,
      };
      return map[sort];
    });
  }, [players, query, position, team, maxPrice, availableOnly, sort]);

  async function toggleWatch(player: PlayerLite) {
    setBusy(player.id);
    try {
      const response = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: player.id,
          playerName: player.name,
          position: player.position,
          teamShort: player.team,
          cost: player.cost,
          totalPoints: player.points,
        }),
      });
      const payload = (await response.json()) as { ok: boolean; watching?: boolean };
      if (payload.ok) {
        setWatched((previous) => {
          const next = new Set(previous);
          if (payload.watching) next.add(player.id);
          else next.delete(player.id);
          return next;
        });
      }
    } finally {
      setBusy(null);
    }
  }

  const visible = filtered.slice(0, limit);
  const totalValue = filtered.reduce((sum, player) => sum + player.cost, 0);

  return (
    <div className="space-y-3">
      <div className="glass rounded-3xl p-3">
        <div className="relative">
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setLimit(25);
            }}
            placeholder="ابحث باسم اللاعب أو النادي…"
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-10 py-2.5 text-xs font-semibold text-white placeholder:text-white/30 focus:border-lime/60 focus:outline-none"
          />
          <span className="absolute right-3 top-2.5 text-sm text-white/40">🔍</span>
        </div>

        <div className="no-scrollbar mt-2.5 flex gap-1.5 overflow-x-auto">
          {POSITIONS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                setPosition(item.key);
                setLimit(25);
              }}
              className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold transition ${
                position === item.key ? "bg-lime text-black" : "bg-white/5 text-white/60"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <select
            value={team}
            onChange={(event) => setTeam(event.target.value)}
            className="rounded-xl border border-white/10 bg-[#151221] px-2 py-1.5 text-[11px] font-bold text-white/80 focus:border-lime/50 focus:outline-none"
          >
            <option value="ALL">كل الأندية</option>
            {teams.map((item) => (
              <option key={item.id} value={item.short}>
                {item.name}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortKey)}
            className="rounded-xl border border-white/10 bg-[#151221] px-2 py-1.5 text-[11px] font-bold text-white/80 focus:border-lime/50 focus:outline-none"
          >
            {SORTS.map((item) => (
              <option key={item.key} value={item.key}>
                ترتيب: {item.label}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-1.5 rounded-xl bg-white/5 px-2 py-1.5 text-[11px] font-bold text-white/70">
            ≤ £{maxPrice.toFixed(1)}
            <input
              type="range"
              min={4}
              max={16}
              step={0.5}
              value={maxPrice}
              onChange={(event) => setMaxPrice(Number(event.target.value))}
              className="w-16 accent-lime"
            />
          </label>
          <button
            type="button"
            onClick={() => setAvailableOnly((value) => !value)}
            className={`rounded-xl px-2 py-1.5 text-[11px] font-bold transition ${
              availableOnly ? "bg-mint/20 text-mint" : "bg-white/5 text-white/60"
            }`}
          >
            متاح فقط
          </button>
        </div>
        <p className="mt-2 text-[10px] text-white/40">
          {filtered.length} لاعباً مطابقاً · قيمة السوق {money(totalValue)}M
        </p>
      </div>

      <div className="glass overflow-hidden rounded-3xl">
        <div className="grid grid-cols-[1.6fr_repeat(4,minmax(0,0.7fr))_28px] gap-1 border-b border-white/5 px-3 py-2 text-[9px] font-bold text-white/40">
          <span>اللاعب</span>
          <span className="text-center">سعر</span>
          <span className="text-center">نقاط</span>
          <span className="text-center">فورمة</span>
          <span className="text-center">امتلاك</span>
          <span />
        </div>
        <div className="divide-y divide-white/5">
          {visible.map((player) => {
            const photo = playerPhoto(player.photo);
            const isWatched = watched.has(player.id);
            return (
              <div key={player.id} className="grid grid-cols-[1.6fr_repeat(4,minmax(0,0.7fr))_28px] items-center gap-1 px-3 py-2 transition hover:bg-white/[0.04]">
                <Link href={`/players/${player.id}`} className="flex min-w-0 items-center gap-2">
                  <span
                    className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10"
                    style={{ background: `linear-gradient(150deg, ${teamColor(player.team)}55, ${teamColor(player.team)}12)` }}
                  >
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photo} alt={player.name} className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <span className="text-[10px] font-bold">{player.position}</span>
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-1">
                      <span className="truncate text-xs font-extrabold text-white">{player.name}</span>
                      {player.status !== "a" ? <span className="text-[9px] text-rose-400">●</span> : null}
                    </span>
                    <span className="flex items-center gap-1 text-[9px] text-white/40">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={teamBadge(player.teamCode)} alt={player.team} className="h-3.5 w-3.5 object-contain" loading="lazy" />
                      {player.team}
                      <span className={`rounded border px-1 text-[8px] font-bold ${posColor(player.position)}`}>
                        {player.position}
                      </span>
                      {player.priceChange !== 0 ? (
                        <span className={player.priceChange > 0 ? "text-emerald-400" : "text-rose-400"}>
                          {player.priceChange > 0 ? "▲" : "▼"}
                          {Math.abs(player.priceChange).toFixed(1)}
                        </span>
                      ) : null}
                    </span>
                  </span>
                </Link>
                <span className="text-center text-[11px] font-extrabold text-mint">{money(player.cost)}</span>
                <span className="text-center text-[11px] font-extrabold text-white">{player.points}</span>
                <span className="text-center text-[11px] font-bold text-white/70">{player.form.toFixed(1)}</span>
                <span className="text-center text-[10px] font-bold text-white/50">{player.selected.toFixed(0)}%</span>
                <button
                  type="button"
                  onClick={() => toggleWatch(player)}
                  disabled={busy === player.id}
                  className={`text-sm transition ${isWatched ? "text-lime" : "text-white/20 hover:text-white/60"}`}
                  aria-label="إضافة إلى المتابعة"
                >
                  {isWatched ? "★" : "☆"}
                </button>
              </div>
            );
          })}
          {!visible.length ? <p className="px-3 py-8 text-center text-xs text-white/40">لا يوجد لاعبون مطابقون للفلاتر</p> : null}
        </div>
      </div>

      {visible.length < filtered.length ? (
        <button
          type="button"
          onClick={() => setLimit((value) => value + 30)}
          className="w-full rounded-2xl border border-white/10 bg-white/5 py-2.5 text-xs font-extrabold text-white/70 hover:border-lime/40 hover:text-lime"
        >
          عرض المزيد ({filtered.length - visible.length} لاعباً متبقياً)
        </button>
      ) : null}
    </div>
  );
}
