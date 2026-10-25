import Link from "next/link";
import { Bar, Card, PlayerAvatar, SectionTitle, TeamBadge } from "@/components/ui";
import { getGameData } from "@/lib/fpl/data";
import { money, posAr } from "@/lib/fpl/format";
import { sortPlayers } from "@/lib/fpl/select";
import type { Player } from "@/lib/fpl/types";

export const dynamic = "force-dynamic";

type Metric = { label: string; value: (player: Player) => number; format?: (value: number) => string };

const METRICS: Metric[] = [
  { label: "مجموع النقاط", value: (player) => player.totalPoints },
  { label: "نقاط/مباراة", value: (player) => player.pointsPerGame, format: (value) => value.toFixed(2) },
  { label: "الفورمة", value: (player) => player.form, format: (value) => value.toFixed(1) },
  { label: "الدقائق", value: (player) => player.minutes },
  { label: "الأهداف", value: (player) => player.goals },
  { label: "الصناعة", value: (player) => player.assists },
  { label: "xG", value: (player) => player.expectedGoals, format: (value) => value.toFixed(2) },
  { label: "xA", value: (player) => player.expectedAssists, format: (value) => value.toFixed(2) },
  { label: "xGI", value: (player) => player.expectedGoalInvolvements, format: (value) => value.toFixed(2) },
  { label: "ICT", value: (player) => player.ict, format: (value) => value.toFixed(1) },
  { label: "البونص", value: (player) => player.bonus },
  { label: "BPS", value: (player) => player.bps },
  { label: "الشباك النظيفة", value: (player) => player.cleanSheets },
  { label: "التصديات", value: (player) => player.saves },
  { label: "المساهمة الدفاعية", value: (player) => player.defensiveContribution },
  { label: "نسبة الامتلاك", value: (player) => player.selectedBy, format: (value) => `${value.toFixed(1)}%` },
  { label: "السعر", value: (player) => player.cost, format: (value) => `£${value.toFixed(1)}M` },
  { label: "القيمة (نقاط/سعر)", value: (player) => (player.cost ? player.totalPoints / player.cost : 0), format: (value) => value.toFixed(1) },
];

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ a?: string; b?: string }> }) {
  const params = await searchParams;
  const data = await getGameData();
  const ranked = sortPlayers(data.players, "total_points");
  const a = data.players.find((player) => player.id === Number(params.a)) ?? ranked[0];
  const b = data.players.find((player) => player.id === Number(params.b)) ?? ranked[1];

  const teamOf = new Map(data.teams.map((team) => [team.id, team]));
  const sorted = [...data.players].sort((x, y) => y.totalPoints - x.totalPoints || x.webName.localeCompare(y.webName));

  return (
    <div className="space-y-4">
      <Card>
        <SectionTitle title="مقارنة لاعبين" subtitle="قارن أي لاعبين في البريميرليج عبر 18 مؤشراً رسمياً" />
        <form method="get" action="/compare" className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <select name="a" defaultValue={a?.id} className="rounded-2xl border border-white/10 bg-[#151221] px-3 py-2.5 text-[11px] font-bold text-white focus:border-lime/50 focus:outline-none">
            {sorted.map((player) => (
              <option key={player.id} value={player.id}>
                {player.webName} — {player.teamShort} ({player.totalPoints})
              </option>
            ))}
          </select>
          <select name="b" defaultValue={b?.id} className="rounded-2xl border border-white/10 bg-[#151221] px-3 py-2.5 text-[11px] font-bold text-white focus:border-lime/50 focus:outline-none">
            {sorted.map((player) => (
              <option key={player.id} value={player.id}>
                {player.webName} — {player.teamShort} ({player.totalPoints})
              </option>
            ))}
          </select>
          <button type="submit" className="rounded-2xl bg-lime px-5 py-2.5 text-xs font-extrabold text-black lime-glow">
            قارن
          </button>
        </form>
      </Card>

      {a && b ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            {[a, b].map((player, index) => (
              <Card key={player.id} className={index === 0 ? "border-lime/25" : "border-violet/30"}>
                <div className="flex items-center gap-2">
                  <PlayerAvatar photo={player.photo} name={player.webName} position={player.position} teamShort={player.teamShort} size={46} />
                  <div className="min-w-0">
                    <Link href={`/players/${player.id}`} className="block truncate text-sm font-extrabold text-white hover:text-lime">
                      {player.webName}
                    </Link>
                    <p className="flex items-center gap-1 text-[10px] text-white/45">
                      <TeamBadge code={player.teamCode} name={player.teamShort} />
                      {teamOf.get(player.teamId)?.name} · {posAr(player.position)}
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between rounded-xl bg-white/5 px-2 py-1.5">
                  <span className="text-[10px] text-white/45">السعر</span>
                  <span className="text-xs font-extrabold text-mint">£{money(player.cost)}M</span>
                </div>
              </Card>
            ))}
          </div>

          <Card>
            <SectionTitle title="المقارنة التفصيلية" subtitle="الأفضل في كل مؤشر يُبرز باللون الأخضر" />
            <div className="space-y-2.5">
              {METRICS.map((metric) => {
                const valueA = metric.value(a);
                const valueB = metric.value(b);
                const max = Math.max(valueA, valueB, 1);
                const format = metric.format ?? ((value: number) => value.toFixed(0));
                return (
                  <div key={metric.label}>
                    <div className="mb-1 flex items-center justify-between text-[10px]">
                      <span className={`font-extrabold ${valueA >= valueB ? "text-lime" : "text-white/60"}`}>{format(valueA)}</span>
                      <span className="text-white/45">{metric.label}</span>
                      <span className={`font-extrabold ${valueB >= valueA ? "text-mint" : "text-white/60"}`}>{format(valueB)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="flex flex-1 justify-end overflow-hidden rounded-full bg-white/10">
                        <div className="h-1.5 rounded-full bg-lime" style={{ width: `${(valueA / max) * 100}%` }} />
                      </div>
                      <div className="flex flex-1 overflow-hidden rounded-full bg-white/10">
                        <div className="h-1.5 rounded-full bg-mint" style={{ width: `${(valueB / max) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-[10px]">
              <div className="rounded-2xl bg-lime/10 px-3 py-2 text-white/70">
                أعلى مؤشرات {a.webName}: {METRICS.filter((metric) => metric.value(a) >= metric.value(b)).length} من {METRICS.length}
              </div>
              <div className="rounded-2xl bg-mint/10 px-3 py-2 text-white/70">
                أعلى مؤشرات {b.webName}: {METRICS.filter((metric) => metric.value(b) > metric.value(a)).length} من {METRICS.length}
              </div>
            </div>
            <div className="mt-3 text-center">
              <Bar value={Math.max(a.totalPoints, b.totalPoints)} max={Math.max(a.totalPoints, b.totalPoints)} height="h-0.5" />
            </div>
          </Card>
        </>
      ) : null}
    </div>
  );
}
