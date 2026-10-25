import Link from "next/link";
import { Card, EmptyState, FdrPill, SectionTitle, TeamBadge } from "@/components/ui";
import { getFixtures, getGameData } from "@/lib/fpl/data";
import { formatDate, formatDateTime } from "@/lib/fpl/format";
import { currentEvent, nextEvent, playerMap, teamMap } from "@/lib/fpl/select";

export const dynamic = "force-dynamic";

export default async function FixturesPage({ searchParams }: { searchParams: Promise<{ gw?: string }> }) {
  const params = await searchParams;
  const [data, fixtures] = await Promise.all([getGameData(), getFixtures()]);
  const teams = teamMap(data.teams);
  const players = playerMap(data.players);
  const current = currentEvent(data.events);
  const upcoming = nextEvent(data.events);
  const chosen = Number(params.gw) || upcoming?.id || current?.id || 1;
  const event = data.events.find((item) => item.id === chosen);
  const gwFixtures = fixtures
    .filter((fixture) => fixture.event === chosen)
    .sort((a, b) => (a.kickoff ?? "").localeCompare(b.kickoff ?? ""));

  const fdrFrom = upcoming?.id ?? current?.id ?? 1;
  const fdrEvents = data.events.filter((item) => item.id >= fdrFrom).slice(0, 6);
  const table = [...data.teams].sort((a, b) => a.shortName.localeCompare(b.shortName));

  const grouped = new Map<string, typeof gwFixtures>();
  for (const fixture of gwFixtures) {
    const key = fixture.kickoff ? fixture.kickoff.slice(0, 10) : "غير محدد";
    const list = grouped.get(key) ?? [];
    list.push(fixture);
    grouped.set(key, list);
  }

  return (
    <div className="space-y-4">
      <Card>
        <SectionTitle
          title="جدول مباريات البريميرليج"
          subtitle={event ? `${event.name} · ${formatDateTime(event.deadline)} آخر موعد` : "اختر الجولة"}
        />
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1">
          {data.events.map((item) => (
            <Link
              key={item.id}
              href={`/fixtures?gw=${item.id}`}
              className={`shrink-0 rounded-full px-2.5 py-1.5 text-[10px] font-extrabold transition ${
                item.id === chosen
                  ? "bg-lime text-black"
                  : item.finished
                    ? "bg-white/10 text-white/60"
                    : "bg-white/5 text-white/40"
              }`}
            >
              {item.id}
            </Link>
          ))}
        </div>
      </Card>

      {gwFixtures.length ? (
        <div className="space-y-3">
          {[...grouped.entries()].map(([day, dayFixtures]) => (
            <Card key={day}>
              <p className="mb-2 text-[10px] font-bold text-white/40">{formatDate(day)}</p>
              <div className="space-y-2">
                {dayFixtures.map((fixture) => {
                  const home = teams.get(fixture.teamH);
                  const away = teams.get(fixture.teamA);
                  return (
                    <div key={fixture.id} className="rounded-2xl border border-white/5 bg-white/[0.03] px-2 py-2">
                      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-right text-[11px] font-extrabold text-white">{home?.name}</span>
                          <TeamBadge code={home?.code ?? 0} name={home?.name} />
                          <FdrPill difficulty={fixture.difficultyH} />
                        </div>
                        <div className="min-w-16 text-center">
                          <span className="rounded-lg bg-black/40 px-2 py-1 text-xs font-black text-white">
                            {fixture.started ? `${fixture.scoreH ?? 0} - ${fixture.scoreA ?? 0}` : "VS"}
                          </span>
                          <p className="mt-1 text-[8px] text-white/35">
                            {fixture.finished ? "انتهت" : fixture.started ? "مباشر" : formatDateTime(fixture.kickoff).replace(/^.*، /, "")}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <FdrPill difficulty={fixture.difficultyA} />
                          <TeamBadge code={away?.code ?? 0} name={away?.name} />
                          <span className="text-[11px] font-extrabold text-white">{away?.name}</span>
                        </div>
                      </div>
                      {fixture.scorers.length ? (
                        <div className="mt-1.5 flex flex-wrap gap-1 border-t border-white/5 pt-1.5">
                          {fixture.scorers.slice(0, 6).map((scorer, index) => {
                            const player = players.get(scorer.element);
                            if (!player) return null;
                            return (
                              <Link
                                key={`${scorer.element}-${index}`}
                                href={`/players/${player.id}`}
                                className="rounded-md bg-white/5 px-1.5 py-0.5 text-[9px] font-bold text-white/60 hover:text-lime"
                              >
                                ⚽ {player.webName}
                                {scorer.assists ? <span className="text-mint"> 🅰</span> : null}
                              </Link>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState icon="📅" title="لا مباريات في هذه الجولة" message="اختر جولة أخرى من الأعلى، أو عد لاحقاً بعد إعلان الجدول." />
      )}

      <Card>
        <SectionTitle title="مصفوفة صعوبة المباريات" subtitle={`أفضل/أسوأ جدول لـ ${fdrEvents.length} جولات قادمة`} />
        <div className="overflow-x-auto">
          <table className="stats w-full text-[10px]">
            <thead>
              <tr className="text-white/35">
                <th className="py-1.5 pr-1 text-right font-bold">النادي</th>
                {fdrEvents.map((item) => (
                  <th key={item.id} className="px-1 py-1.5 text-center font-bold">
                    GW{item.id}
                  </th>
                ))}
                <th className="px-1 py-1.5 text-center font-bold">متوسط</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {table.map((team) => {
                const cells = fdrEvents.map((item) => {
                  const fixture = fixtures.find(
                    (row) => row.event === item.id && (row.teamH === team.id || row.teamA === team.id),
                  );
                  if (!fixture) return null;
                  const isHome = fixture.teamH === team.id;
                  return {
                    difficulty: isHome ? fixture.difficultyH : fixture.difficultyA,
                    opponent: teams.get(isHome ? fixture.teamA : fixture.teamH),
                    isHome,
                  };
                });
                const values = cells.filter((cell): cell is NonNullable<typeof cell> => Boolean(cell));
                const average = values.length ? values.reduce((sum, cell) => sum + cell.difficulty, 0) / values.length : 0;
                return (
                  <tr key={team.id}>
                    <td className="py-1 pr-1">
                      <span className="flex items-center gap-1">
                        <TeamBadge code={team.code} name={team.name} />
                        <span className="font-bold text-white/80">{team.shortName}</span>
                      </span>
                    </td>
                    {cells.map((cell, index) =>
                      cell ? (
                        <td key={`${team.id}-${index}`} className="px-0.5 py-1 text-center">
                          <span
                            className={`inline-flex min-w-9 flex-col items-center rounded-md border px-1 py-0.5 ${
                              cell.difficulty <= 2
                                ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                                : cell.difficulty === 3
                                  ? "border-amber-400/40 bg-amber-400/15 text-amber-200"
                                  : cell.difficulty === 4
                                    ? "border-orange-500/40 bg-orange-500/15 text-orange-300"
                                    : "border-rose-500/40 bg-rose-600/20 text-rose-300"
                            }`}
                          >
                            <span className="text-[8px] opacity-70">{cell.isHome ? "H" : "A"}</span>
                            <span className="font-extrabold">{cell.opponent?.shortName ?? "?"}</span>
                          </span>
                        </td>
                      ) : (
                        <td key={`${team.id}-${index}`} className="px-0.5 text-center text-white/20">—</td>
                      ),
                    )}
                    <td className="px-1 py-1 text-center">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9px] font-extrabold ${
                          average <= 2.5 ? "bg-emerald-500/15 text-emerald-300" : average >= 3.6 ? "bg-rose-500/15 text-rose-300" : "bg-white/10 text-white/60"
                        }`}
                      >
                        {average.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
