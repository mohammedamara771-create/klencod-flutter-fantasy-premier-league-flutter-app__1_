"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { saveSquadAction } from "@/lib/actions";
import { money, playerPhoto, posAr, teamBadge, teamColor } from "@/lib/fpl/format";
import type { PlayerLite, TeamLite } from "@/lib/fpl/lite";

const LIMITS: Record<string, number> = { GKP: 2, DEF: 5, MID: 5, FWD: 3 };
const FORMATIONS = ["3-4-3", "3-5-2", "4-3-3", "4-4-2", "5-2-3", "5-3-2", "4-5-1", "5-4-1"];
const BUDGET = 100;

export function SquadBuilder({ players, teams }: { players: PlayerLite[]; teams: TeamLite[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<PlayerLite[]>([]);
  const [formation, setFormation] = useState("4-4-2");
  const [captain, setCaptain] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState("ALL");
  const [message, setMessage] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const spent = selected.reduce((sum, player) => sum + player.cost, 0);
  const bank = BUDGET - spent;
  const counts = selected.reduce<Record<string, number>>((acc, player) => {
    acc[player.position] = (acc[player.position] ?? 0) + 1;
    return acc;
  }, {});
  const clubs = selected.reduce<Record<string, number>>((acc, player) => {
    acc[player.team] = (acc[player.team] ?? 0) + 1;
    return acc;
  }, {});
  const [defCount, midCount, fwdCount] = formation.split("-").map(Number);
  const outfield = (counts.DEF ?? 0) + (counts.MID ?? 0) + (counts.FWD ?? 0);

  const complete =
    selected.length === 15 &&
    (counts.GKP ?? 0) === 2 &&
    (counts.DEF ?? 0) === 5 &&
    (counts.MID ?? 0) === 5 &&
    (counts.FWD ?? 0) === 3 &&
    spent <= BUDGET;
  const formationValid = (counts.DEF ?? 0) >= defCount && (counts.MID ?? 0) >= midCount && (counts.FWD ?? 0) >= fwdCount && outfield === 10;

  const pool = useMemo(() => {
    const search = query.trim().toLowerCase();
    return players
      .filter((player) => (position === "ALL" ? true : player.position === position))
      .filter((player) => (search ? player.name.toLowerCase().includes(search) || player.team.toLowerCase().includes(search) : true))
      .sort((a, b) => b.points - a.points);
  }, [players, query, position]);

  function canAdd(player: PlayerLite): { ok: boolean; reason?: string } {
    if (selected.some((item) => item.id === player.id)) return { ok: false, reason: "مضاف" };
    if ((counts[player.position] ?? 0) >= LIMITS[player.position]) return { ok: false, reason: "اكتمل المركز" };
    if ((clubs[player.team] ?? 0) >= 3) return { ok: false, reason: "3 من نفس النادي" };
    if (spent + player.cost > BUDGET) return { ok: false, reason: "تجاوز الميزانية" };
    return { ok: true };
  }

  function toggle(player: PlayerLite) {
    if (selected.some((item) => item.id === player.id)) {
      setSelected((items) => items.filter((item) => item.id !== player.id));
      if (captain === player.id) setCaptain(null);
      return;
    }
    const check = canAdd(player);
    if (!check.ok) {
      setMessage({ tone: "err", text: check.reason ?? "لا يمكن إضافة اللاعب" });
      return;
    }
    setMessage(null);
    setSelected((items) => [...items, player]);
  }

  function autoPick() {
    const order = ["GKP", "DEF", "MID", "FWD"];
    const picked: PlayerLite[] = [];
    const clubCount: Record<string, number> = {};
    let total = 0;
    for (const pos of order) {
      const needed = LIMITS[pos];
      const candidates = players
        .filter((player) => player.position === pos && player.minutes > 0 && player.status === "a")
        .sort((a, b) => b.points / Math.max(b.cost, 4) - a.points / Math.max(a.cost, 4));
      let taken = 0;
      for (const player of candidates) {
        if (taken >= needed) break;
        const remainingSlots = total === 0 ? 15 : 15 - picked.length;
        if (total + player.cost > BUDGET - (remainingSlots - 1) * 4) continue;
        if ((clubCount[player.team] ?? 0) >= 3) continue;
        if (picked.some((item) => item.id === player.id)) continue;
        picked.push(player);
        clubCount[player.team] = (clubCount[player.team] ?? 0) + 1;
        total += player.cost;
        taken += 1;
      }
    }
    setSelected(picked);
    setCaptain(picked[0]?.id ?? null);
    setMessage({
      tone: picked.length === 15 ? "ok" : "err",
      text: picked.length === 15 ? "تم اختيار تشكيلة تلقائية متوازنة" : "لم تكتمل التشكيلة تلقائياً، جرّب تعديلها يدوياً",
    });
  }

  function save() {
    if (!complete) {
      setMessage({ tone: "err", text: "أكمل 15 لاعباً (2 حارس، 5 دفاع، 5 وسط، 3 هجوم) داخل الميزانية" });
      return;
    }
    if (!name.trim()) {
      setMessage({ tone: "err", text: "أدخل اسماً للتشكيلة قبل الحفظ" });
      return;
    }
    const payload = {
      name,
      formation,
      spent,
      bank,
      captain,
      players: selected.map((player) => ({
        id: player.id,
        webName: player.name,
        position: player.position,
        teamShort: player.team,
        cost: player.cost,
        totalPoints: player.points,
        bench: false,
      })),
    };
    const formData = new FormData();
    formData.set("payload", JSON.stringify(payload));
    startTransition(async () => {
      const result = await saveSquadAction(formData);
      if (result.ok) {
        setMessage({ tone: "ok", text: "تم حفظ التشكيلة في قاعدة البيانات ✅" });
        setName("");
        router.refresh();
      } else {
        setMessage({ tone: "err", text: result.message ?? "تعذّر الحفظ" });
      }
    });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1.05fr_1fr]">
      <div className="space-y-3">
        <div className="glass rounded-3xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-white/45">الميزانية المتاحة</p>
              <p className={`text-2xl font-black ${bank < 0 ? "text-rose-400" : "text-lime"}`}>£{money(bank)}M</p>
            </div>
            <div className="text-left">
              <p className="text-[10px] text-white/45">المصروف</p>
              <p className="text-lg font-extrabold text-white">£{money(spent)}M</p>
            </div>
            <div className="text-left">
              <p className="text-[10px] text-white/45">اللاعبون</p>
              <p className={`text-lg font-extrabold ${selected.length === 15 ? "text-mint" : "text-white"}`}>{selected.length}/15</p>
            </div>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div className={`h-2 rounded-full ${spent > BUDGET ? "bg-rose-500" : "bg-gradient-to-l from-mint to-lime"}`} style={{ width: `${Math.min(100, (spent / BUDGET) * 100)}%` }} />
          </div>
          <div className="mt-3 grid grid-cols-4 gap-1.5">
            {(["GKP", "DEF", "MID", "FWD"] as const).map((pos) => (
              <div key={pos} className="rounded-xl bg-white/5 px-1.5 py-1.5 text-center">
                <p className="text-[9px] text-white/45">{posAr(pos)}</p>
                <p className="text-[11px] font-extrabold text-white">
                  {counts[pos] ?? 0}/{LIMITS[pos]}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <select
              value={formation}
              onChange={(event) => setFormation(event.target.value)}
              className="rounded-xl border border-white/10 bg-[#151221] px-2 py-1.5 text-[11px] font-bold text-white/80 focus:outline-none"
            >
              {FORMATIONS.map((item) => (
                <option key={item} value={item}>
                  خطة {item}
                </option>
              ))}
            </select>
            <span className={`rounded-xl px-2 py-1.5 text-[10px] font-bold ${formationValid ? "bg-mint/15 text-mint" : "bg-white/5 text-white/40"}`}>
              {formationValid ? "الخطة متوافقة" : "الخطة تحتاج لاعبين أكثر"}
            </span>
            <button type="button" onClick={autoPick} className="rounded-xl bg-violet/30 px-2.5 py-1.5 text-[10px] font-extrabold text-white hover:bg-violet/50">
              اختيار تلقائي
            </button>
            <button type="button" onClick={() => { setSelected([]); setCaptain(null); }} className="rounded-xl bg-white/5 px-2.5 py-1.5 text-[10px] font-bold text-white/50 hover:text-rose-300">
              تفريغ
            </button>
          </div>
          {message ? (
            <p className={`mt-2 rounded-xl px-2 py-1.5 text-[10px] font-bold ${message.tone === "ok" ? "bg-mint/10 text-mint" : "bg-rose-500/10 text-rose-300"}`}>
              {message.text}
            </p>
          ) : null}
        </div>

        <div className="glass rounded-3xl p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-extrabold text-white">التشكيلة المختارة</p>
            <span className="text-[10px] text-white/40">الكابتن: {selected.find((player) => player.id === captain)?.name ?? "لم يُحدد"}</span>
          </div>
          {selected.length ? (
            <div className="space-y-2">
              {(["GKP", "DEF", "MID", "FWD"] as const).map((pos) => {
                const group = selected.filter((player) => player.position === pos);
                if (!group.length) return null;
                return (
                  <div key={pos}>
                    <p className="mb-1 text-[9px] font-bold text-white/35">{posAr(pos)}</p>
                    <div className="grid grid-cols-2 gap-1">
                      {group.map((player) => (
                        <div key={player.id} className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-1.5 py-1">
                          <span className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-lg" style={{ background: teamColor(player.team) + "33" }}>
                            {playerPhoto(player.photo) ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={playerPhoto(player.photo) ?? ""} alt={player.name} className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-[8px]">{player.position}</span>
                            )}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[10px] font-bold text-white">{player.name}</span>
                            <span className="block text-[8px] text-white/40">{player.team} · £{money(player.cost)}</span>
                          </span>
                          <button type="button" onClick={() => setCaptain(player.id)} className={`text-[11px] ${captain === player.id ? "text-lime" : "text-white/20"}`} title="كابتن">©</button>
                          <button type="button" onClick={() => toggle(player)} className="text-[11px] text-rose-300/60 hover:text-rose-300">×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="py-6 text-center text-[11px] text-white/35">اختر لاعبين من القائمة أو استخدم الاختيار التلقائي</p>
          )}
          <div className="mt-3 flex gap-2">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="اسم التشكيلة (مثال: تشكيلة الجولة 8)"
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-2.5 py-2 text-[11px] font-bold text-white placeholder:text-white/30 focus:border-lime/50 focus:outline-none"
            />
            <button
              type="button"
              onClick={save}
              disabled={pending || !complete}
              className="rounded-xl bg-lime px-3 py-2 text-[11px] font-extrabold text-black disabled:opacity-40"
            >
              {pending ? "جارٍ الحفظ" : "حفظ"}
            </button>
          </div>
          {complete ? <p className="mt-1 text-[9px] text-mint">التشكيلة مكتملة وجاهزة للحفظ ✓</p> : null}
        </div>
      </div>

      <div className="glass rounded-3xl p-3">
        <div className="relative mb-2">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ابحث عن لاعب لإضافته…"
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-9 py-2 text-[11px] font-bold text-white placeholder:text-white/30 focus:border-lime/50 focus:outline-none"
          />
          <span className="absolute right-3 top-2 text-xs text-white/35">🔍</span>
        </div>
        <div className="no-scrollbar mb-2 flex gap-1.5 overflow-x-auto">
          {["ALL", "GKP", "DEF", "MID", "FWD"].map((pos) => (
            <button
              key={pos}
              type="button"
              onClick={() => setPosition(pos)}
              className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${position === pos ? "bg-lime text-black" : "bg-white/5 text-white/55"}`}
            >
              {pos === "ALL" ? "الكل" : posAr(pos)}
            </button>
          ))}
        </div>
        <div className="max-h-[520px] space-y-1 overflow-y-auto pl-1">
          {pool.slice(0, 120).map((player) => {
            const added = selected.some((item) => item.id === player.id);
            const check = canAdd(player);
            return (
              <div key={player.id} className={`flex items-center gap-1.5 rounded-xl px-1.5 py-1 ${added ? "bg-lime/10" : "bg-white/[0.03]"}`}>
                <span className="w-8 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={teamBadge(player.teamCode)} alt={player.team} className="h-4 w-4 object-contain" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-bold text-white">{player.name}</p>
                  <p className="text-[8px] text-white/35">
                    {player.team} · {posAr(player.position)} · {player.points} نقطة
                  </p>
                </div>
                <span className="text-[10px] font-extrabold text-mint">£{money(player.cost)}</span>
                <button
                  type="button"
                  onClick={() => toggle(player)}
                  disabled={!added && !check.ok}
                  className={`rounded-lg px-2 py-1 text-[9px] font-extrabold ${
                    added ? "bg-rose-500/20 text-rose-300" : check.ok ? "bg-lime text-black" : "bg-white/5 text-white/25"
                  }`}
                >
                  {added ? "إزالة" : check.ok ? "إضافة" : check.reason}
                </button>
              </div>
            );
          })}
          {!pool.length ? <p className="py-6 text-center text-[11px] text-white/35">لا نتائج</p> : null}
        </div>
        <p className="mt-2 text-[9px] text-white/30">{teams.length} نادياً · القيود: 3 لاعبين كحد أقصى من نفس النادي</p>
      </div>
    </div>
  );
}
