import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, Bar, Card, EmptyState, FdrPill, Notice, PlayerAvatar, SectionTitle, StatTile, TeamBadge } from "@/components/ui";
import { PlayerStatLine } from "@/components/PlayerRow";
import { toggleWatchAction } from "@/lib/actions";
import { getWatchlist } from "@/lib/db-queries";
import { getElementSummary, getGameData } from "@/lib/fpl/data";
import { compact, formatDate, formatDateTime, money, teamBadge } from "@/lib/fpl/format";
import { teamMap } from "@/lib/fpl/select";

export const dynamic = "force-dynamic";

export default async function PlayerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const playerId = Number(id);
  if (!Number.isFinite(playerId) || playerId <= 0) notFound();

  const data = await getGameData();
  const player = data.players.find((item) => item.id === playerId);
  if (!player) notFound();

  const [summary, watch] = await Promise.all([getElementSummary(playerId), getWatchlist()]);
  const teams = teamMap(data.teams);
  const team = teams.get(player.teamId);
  const isWatched = watch.some((row) => row.playerId === playerId);
  const history = summary?.history ?? [];
  const lastGames = [...history].slice(-8).reverse();
  const maxPoints = Math.max(1, ...history.map((row) => row.points));
  const totalXg = player.expectedGoals;
  const totalGoals = player.goals;
  const finishing = totalXg > 0 ? totalGoals - totalXg : 0;

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-[26px] border border-white/10 bg-gradient-to-bl from-violet/30 via-[#151127] to-[#0b0a14] p-4 sm:p-6">
        <div className="absolute -left-12 -top-12 h-40 w-40 rounded-full bg-lime/15 blur-3xl" />
        <div className="relative flex flex-wrap items-start gap-4">
          <PlayerAvatar photo={player.photo} name={player.webName} position={player.position} teamShort={player.teamShort} size={84} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white sm:text-2xl">{player.webName}</h1>
              <Badge className="border-white/20 bg-white/10 text-white/80">{player.position}</Badge>
              {player.status !== "a" ? (
                <Badge className="border-rose-400/40 bg-rose-500/15 text-rose-300">
                  {player.status === "i" ? "مصاب" : player.status === "d" ? "مشكوك" : "غير متاح"}
                  {player.chanceNext !== null ? ` · ${player.chanceNext}%` : ""}
                </Badge>
              ) : null}
            </div>
            <p className="mt-0.5 text-[11px] text-white/45">
              {player.firstName} {player.secondName} · {team?.name ?? player.teamShort}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-extrabold text-mint">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={teamBadge(player.teamCode)} alt={team?.name ?? ""} className="h-4 w-4 object-contain" />
                £{money(player.cost)}M
              </span>
              <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-extrabold text-white">
                {player.totalPoints} نقطة
              </span>
              <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-white/70">
                {player.selectedBy.toFixed(1)}% امتلاك
              </span>
              <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-white/70">
                فورمة {player.form.toFixed(1)}
              </span>
            </div>
          </div>
          <form action={toggleWatchAction} className="flex flex-col items-stretch gap-2">
            <input type="hidden" name="playerId" value={player.id} />
            <input type="hidden" name="playerName" value={player.webName} />
            <input type="hidden" name="position" value={player.position} />
            <input type="hidden" name="teamShort" value={player.teamShort} />
            <input type="hidden" name="cost" value={player.cost} />
            <input type="hidden" name="totalPoints" value={player.totalPoints} />
            <button
              type="submit"
              className={`rounded-full px-4 py-2 text-xs font-extrabold transition ${
                isWatched ? "bg-lime text-black lime-glow" : "border border-white/20 bg-white/5 text-white"
              }`}
            >
              {isWatched ? "★ في المتابعة" : "☆ أضف للمتابعة"}
            </button>
            <Link href="/players" className="text-center text-[10px] font-bold text-white/45 hover:text-lime">
              عودة للقائمة
            </Link>
          </form>
        </div>
        {player.news ? <div className="relative mt-3"><Notice tone="warn">{player.news}</Notice></div> : null}
      </div>

      <section className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-6">
        <StatTile label="نقاط الموسم" value={player.totalPoints} accent="text-lime" />
        <StatTile label="نقاط الجولة" value={player.eventPoints} />
        <StatTile label="نقاط/مباراة" value={player.pointsPerGame.toFixed(1)} />
        <StatTile label="الدقائق" value={compact(player.minutes)} hint={`${player.starts} أساسي`} />
        <StatTile label="الأهداف" value={player.goals} accent="text-mint" />
        <StatTile label="الصناعة" value={player.assists} accent="text-mint" />
        <StatTile label="xG" value={player.expectedGoals.toFixed(2)} />
        <StatTile label="xA" value={player.expectedAssists.toFixed(2)} />
        <StatTile label="xGI" value={player.expectedGoalInvolvements.toFixed(2)} />
        <StatTile label="شباك نظيفة" value={player.cleanSheets} />
        <StatTile label="بونص" value={player.bonus} />
        <StatTile label="BPS" value={player.bps} />
      </section>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <Card>
          <SectionTitle title="آخر المباريات" subtitle={`موسم ${data.events[0]?.name?.replace(/Gameweek.*/, "") ?? ""} — النقاط لكل جولة`} />
          {lastGames.length ? (
            <>
              <div className="mb-3 flex h-24 items-end gap-1.5">
                {[...history].slice(-10).map((row) => (
                  <div key={`${row.round}-${row.fixture}`} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-[8px] font-bold text-white/40">{row.points}</span>
                    <div
                      className={`w-full rounded-t-md ${row.points >= 6 ? "bg-lime" : row.points >= 3 ? "bg-mint/70" : "bg-white/15"}`}
                      style={{ height: `${Math.max(4, (row.points / maxPoints) * 64)}px` }}
                    />
                    <span className="text-[8px] text-white/30">{row.round}</span>
                  </div>
                ))}
              </div>
              <div className="overflow-x-auto">
                <table className="stats w-full text-[11px]">
                  <thead>
                    <tr className="text-[9px] text-white/40">
                      <th className="py-1 text-right font-bold">الجولة</th>
                      <th className="py-1 text-center font-bold">الخصم</th>
                      <th className="py-1 text-center font-bold">النتيجة</th>
                      <th className="py-1 text-center font-bold">د</th>
                      <th className="py-1 text-center font-bold">أ</th>
                      <th className="py-1 text-center font-bold">ص</th>
                      <th className="py-1 text-center font-bold">بونص</th>
                      <th className="py-1 text-center font-bold">نقاط</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {lastGames.map((row) => {
                      const opponent = teams.get(row.opponent);
                      const score =
                        row.wasHome && row.scoreH !== null && row.scoreA !== null
                          ? `${row.scoreH}-${row.scoreA}`
                          : row.scoreA !== null && row.scoreH !== null
                            ? `${row.scoreA}-${row.scoreH}`
                            : "—";
                      return (
                        <tr key={`${row.round}-${row.fixture}`} className="text-white/75">
                          <td className="py-1.5 text-right font-bold text-white/60">{row.round}</td>
                          <td className="py-1.5 text-center">
                            <span className="inline-flex items-center gap-1">
                              <TeamBadge code={opponent?.code ?? 0} />
                              <span className="text-[10px]">{row.wasHome ? "ضد" : "خارج"} {opponent?.shortName ?? "—"}</span>
                            </span>
                          </td>
                          <td className="py-1.5 text-center text-[10px]">{score}</td>
                          <td className="py-1.5 text-center">{row.minutes}</td>
                          <td className="py-1.5 text-center">{row.goals}</td>
                          <td className="py-1.5 text-center">{row.assists}</td>
                          <td className="py-1.5 text-center">{row.bonus}</td>
                          <td className="py-1.5 text-center">
                            <span className={`inline-block min-w-6 rounded px-1.5 py-0.5 text-[10px] font-extrabold ${row.points >= 6 ? "bg-lime/20 text-lime" : "bg-white/10 text-white"}`}>
                              {row.points}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <EmptyState icon="📅" title="لا سجل مباريات بعد" message="لم يشارك اللاعب في أي مباراة هذا الموسم حتى الآن." />
          )}
        </Card>

        <div className="space-y-4">
          <Card>
            <SectionTitle title="المباريات القادمة" subtitle="صعوبة الخصم من الواجهة الرسمية" />
            <div className="space-y-1.5">
              {(summary?.upcoming ?? []).slice(0, 6).map((fixture) => {
                const opponent = teams.get(fixture.opponent);
                return (
                  <div key={`${fixture.id}-${fixture.event}`} className="flex items-center gap-2 rounded-xl bg-white/[0.03] px-2 py-1.5 text-[11px]">
                    <FdrPill difficulty={fixture.difficulty} />
                    <TeamBadge code={opponent?.code ?? 0} />
                    <span className="font-bold text-white/80">{opponent?.shortName ?? "—"}</span>
                    <span className="text-[9px] text-white/40">{fixture.isHome ? "على أرضه" : "خارج الديار"}</span>
                    <span className="mr-auto text-[9px] text-white/35">{fixture.eventName}</span>
                  </div>
                );
              })}
              {!(summary?.upcoming ?? []).length ? <p className="py-3 text-center text-[11px] text-white/40">لا مباريات قادمة</p> : null}
            </div>
          </Card>

          <Card>
            <SectionTitle title="تفصيل ICT" subtitle="مؤشرات التأثير والإبداع والخطورة" />
            <div className="space-y-2.5">
              {[
                { label: "التأثير", value: player.influence, color: "bg-lime" },
                { label: "الإبداع", value: player.creativity, color: "bg-mint" },
                { label: "الخطورة", value: player.threat, color: "bg-rose-400" },
                { label: "المساهمة الدفاعية", value: player.defensiveContribution, color: "bg-sky-400" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="mb-1 flex items-center justify-between text-[10px]">
                    <span className="text-white/55">{item.label}</span>
                    <span className="font-extrabold text-white">{item.value.toFixed(1)}</span>
                  </div>
                  <Bar value={item.value} max={Math.max(item.value, 100)} color={item.color} />
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-1.5">
              <PlayerStatLine label="ICT" value={player.ict.toFixed(1)} highlight />
              <PlayerStatLine label="xG/90" value={player.xgPer90.toFixed(2)} />
              <PlayerStatLine label="xA/90" value={player.xaPer90.toFixed(2)} />
              <PlayerStatLine label="إنهاء" value={`${finishing >= 0 ? "+" : ""}${finishing.toFixed(2)}`} />
              <PlayerStatLine label="تصديات" value={player.saves} />
              <PlayerStatLine label="عملات صفراء" value={player.yellowCards} />
            </div>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionTitle title="المواسم السابقة" subtitle="من الواجهة الرسمية" />
          {summary?.past?.length ? (
            <div className="overflow-x-auto">
              <table className="stats w-full text-[11px]">
                <thead>
                  <tr className="text-[9px] text-white/40">
                    <th className="py-1 text-right font-bold">الموسم</th>
                    <th className="py-1 text-center font-bold">نقاط</th>
                    <th className="py-1 text-center font-bold">أهداف</th>
                    <th className="py-1 text-center font-bold">صناعة</th>
                    <th className="py-1 text-center font-bold">بونص</th>
                    <th className="py-1 text-center font-bold">xGI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[...summary.past].reverse().map((row) => (
                    <tr key={row.season} className="text-white/75">
                      <td className="py-1.5 text-right font-bold text-white/60">{row.season}</td>
                      <td className="py-1.5 text-center text-lime">{row.points}</td>
                      <td className="py-1.5 text-center">{row.goals}</td>
                      <td className="py-1.5 text-center">{row.assists}</td>
                      <td className="py-1.5 text-center">{row.bonus}</td>
                      <td className="py-1.5 text-center">{row.expectedGoalInvolvements.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-4 text-center text-[11px] text-white/40">لا توجد بيانات مواسم سابقة (لاعب صاعد).</p>
          )}
        </Card>

        <Card>
          <SectionTitle title="تفاصيل الانتقالات والقيمة" />
          <div className="grid grid-cols-2 gap-1.5">
            <PlayerStatLine label="سعر البداية" value={`£${money(player.cost - player.costChangeStart)}M`} />
            <PlayerStatLine label="تغيّر السعر" value={`${player.costChangeStart >= 0 ? "+" : ""}${player.costChangeStart.toFixed(1)}`} highlight />
            <PlayerStatLine label="داخلون (الموسم)" value={compact(player.transfersIn)} />
            <PlayerStatLine label="خارجون (الموسم)" value={compact(player.transfersOut)} />
            <PlayerStatLine label="داخلون (الجولة)" value={compact(player.transfersInEvent)} />
            <PlayerStatLine label="خارجون (الجولة)" value={compact(player.transfersOutEvent)} />
            <PlayerStatLine label="قيمة الفورمة" value={player.valueForm.toFixed(1)} />
            <PlayerStatLine label="قيمة الموسم" value={player.valueSeason.toFixed(1)} />
            <PlayerStatLine label="اختيار الكابتن" value={player.dreamteam ? `${player.dreamteam}× فريق الأحلام` : "—"} />
            <PlayerStatLine label="آخر تحديث" value={formatDate(data.updatedAt)} />
          </div>
          <div className="mt-3 space-y-1.5 text-[10px] text-white/40">
            <p>الموعد النهائي للجولة القادمة: {formatDateTime(data.events.find((event) => event.isNext)?.deadline)}</p>
            <Link href="/compare" className="inline-block font-bold text-lime">قارن هذا اللاعب مع آخر →</Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
