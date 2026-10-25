import Link from "next/link";
import { Card, EmptyState, FdrPill, SectionTitle, StatTile, TeamBadge } from "@/components/ui";
import { PriceMove, PlayerRow } from "@/components/PlayerRow";
import { getFixtures, getGameData } from "@/lib/fpl/data";
import { compact, formatDateTime, money, rankText, teamGradient } from "@/lib/fpl/format";
import {
  currentEvent,
  nextEvent,
  playerMap,
  sortPlayers,
  teamMap,
  topOwned,
} from "@/lib/fpl/select";
import { getWatchlist } from "@/lib/db-queries";
import { toggleWatchAction } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [data, fixtures, watch] = await Promise.all([getGameData(), getFixtures(), getWatchlist()]);
  const { players, teams, events } = data;
  const current = currentEvent(events);
  const upcoming = nextEvent(events) ?? current;
  const teamsById = teamMap(teams);
  const playersById = playerMap(players);
  const watchIds = new Set(watch.map((row) => row.playerId));

  const best = sortPlayers(players.filter((player) => player.minutes > 0), "total_points").slice(0, 6);
  const inForm = sortPlayers(players.filter((player) => player.minutes >= 270), "form").slice(0, 5);
  const owned = topOwned(players, 5);
  const risers = [...players]
    .filter((player) => player.priceChangePercent > 0)
    .sort((a, b) => b.priceChangePercent - a.priceChangePercent)
    .slice(0, 4);
  const fallers = [...players]
    .filter((player) => player.priceChangePercent < 0)
    .sort((a, b) => a.priceChangePercent - b.priceChangePercent)
    .slice(0, 4);
  const captain = upcoming?.mostCaptained ? playersById.get(upcoming.mostCaptained) : undefined;
  const upcomingFixtures = fixtures
    .filter((fixture) => fixture.event === upcoming?.id)
    .sort((a, b) => (a.kickoff ?? "").localeCompare(b.kickoff ?? ""))
    .slice(0, 5);
  const topTeams = [...teams].sort((a, b) => b.strength - a.strength).slice(0, 6);
  const progress = current ? Math.round((current.id / Math.max(events.length, 1)) * 100) : 0;

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-bl from-violet/40 via-[#191331] to-[#0d0b18] p-5 sm:p-7">
        <div className="absolute -left-16 -top-20 h-56 w-56 rounded-full bg-lime/20 blur-3xl" />
        <div className="absolute -bottom-24 right-10 h-56 w-56 rounded-full bg-violet/40 blur-3xl" />
        <div className="relative grid gap-5 sm:grid-cols-[1.4fr_1fr] sm:items-center">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-lime/30 bg-lime/10 px-3 py-1 text-[10px] font-extrabold text-lime">
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-lime" />
              البيانات الرسمية للفانتازي · مباشر
            </div>
            <h1 className="text-2xl font-black leading-tight sm:text-3xl">
              كل ما تحتاجه لتفوز
              <br />
              في <span className="text-lime">فانتازي البريميرليج</span>
            </h1>
            <p className="mt-2 max-w-md text-xs leading-5 text-white/60">
              {current?.name ?? "الجولة الحالية"} · {compact(data.totalPlayers)} مدير مسجّل · إحصاءات xG/xA، الفورمة،
              الأسعار، المباريات ومتابعة فريقك وأصدقائك.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/team" className="rounded-full bg-lime px-4 py-2 text-xs font-extrabold text-black lime-glow">
                افتح فريقي
              </Link>
              <Link href="/builder" className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-extrabold text-white">
                ابنِ تشكيلة 100M
              </Link>
              <Link href="/players" className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-extrabold text-white">
                قاعدة اللاعبين
              </Link>
              <Link href="/download" className="rounded-full border border-mint/30 bg-mint/10 px-4 py-2 text-xs font-extrabold text-mint">
                ⬇ مشروع Flutter
              </Link>
            </div>
          </div>
          <div className="glass-strong rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-white/55">الجولة القادمة</p>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white/70">
                {upcoming ? `GW${upcoming.id}` : "—"}
              </span>
            </div>
            <p className="mt-1 text-lg font-black text-white">{upcoming?.name ?? "بانتظار الجدول"}</p>
            <p className="mt-1 text-[10px] text-white/45">{formatDateTime(upcoming?.deadline)} · بتوقيت UTC</p>
            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between text-[10px] text-white/45">
                <span>تقدّم الموسم</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-1.5 rounded-full bg-lime" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-white/5 px-2.5 py-2">
                <p className="text-[9px] text-white/40">متوسط الجولة</p>
                <p className="text-sm font-extrabold text-lime">{current?.averageScore ?? 0}</p>
              </div>
              <div className="rounded-xl bg-white/5 px-2.5 py-2">
                <p className="text-[9px] text-white/40">أعلى نتيجة</p>
                <p className="text-sm font-extrabold text-white">{current?.highestScore ?? 0}</p>
              </div>
            </div>
            {captain ? (
              <Link href={`/players/${captain.id}`} className="mt-2 flex items-center gap-2 rounded-xl bg-white/5 px-2.5 py-2 hover:bg-white/10">
                <span className="text-[11px] text-white/45">الكابتن الأكثر اختياراً</span>
                <span className="mr-auto text-[11px] font-extrabold text-mint">{captain.webName}</span>
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <StatTile label="مديرون مسجّلون" value={compact(data.totalPlayers)} hint="إجمالي الفانتازي" />
        <StatTile label="مصنّفون هذا الموسم" value={compact(current?.rankedCount ?? 0)} hint="مدير لديه نقاط" accent="text-mint" />
        <StatTile label="انتقالات الجولة" value={compact(current?.transfersMade ?? 0)} hint="كل المديرين" />
        <StatTile label="لاعبون في القاعدة" value={rankText(players.length)} hint={`${teams.length} نادياً`} accent="text-lime" />
      </section>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <Card>
          <SectionTitle
            title="أفضل اللاعبين هذا الموسم"
            subtitle="ترتيب حسب مجموع النقاط من الواجهة الرسمية"
            action={<Link href="/players" className="text-[10px] font-bold text-lime">عرض الكل</Link>}
          />
          <div className="divide-y divide-white/5">
            {best.map((player, index) => (
              <div key={player.id} className="py-0.5">
                <PlayerRow player={player} rank={index + 1} metric={String(player.totalPoints)} />
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <SectionTitle title="أعلى فورمة" subtitle="متوسط النقاط في آخر 5 مباريات" />
            <div className="space-y-1">
              {inForm.map((player) => (
                <Link key={player.id} href={`/players/${player.id}`} className="flex items-center gap-2 rounded-xl px-1.5 py-1.5 hover:bg-white/5">
                  <span className="w-4 text-[10px] font-extrabold text-lime">{player.form.toFixed(1)}</span>
                  <span className="text-[11px] font-bold text-white/85">{player.webName}</span>
                  <span className="text-[9px] text-white/35">{player.teamShort}</span>
                  <span className="mr-auto flex items-center gap-1 text-[10px] text-white/50">
                    <TeamBadge code={player.teamCode} name={player.teamShort} /> £{money(player.cost)}
                  </span>
                </Link>
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <Card>
              <SectionTitle title="أسعار ترتفع ▲" />
              <div className="space-y-0.5">
                {risers.length ? risers.map((player) => <PriceMove key={player.id} player={player} />) : (
                  <p className="px-2 py-3 text-[10px] text-white/40">لا توجد تغييرات حالياً</p>
                )}
              </div>
            </Card>
            <Card>
              <SectionTitle title="أسعار تنخفض ▼" />
              <div className="space-y-0.5">
                {fallers.length ? fallers.map((player) => <PriceMove key={player.id} player={player} />) : (
                  <p className="px-2 py-3 text-[10px] text-white/40">لا توجد تغييرات حالياً</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionTitle
            title={upcoming ? `مباريات ${upcoming.name}` : "المباريات القادمة"}
            subtitle="صعوبة المباراة (FDR) من 1 سهل إلى 5 صعب"
            action={<Link href="/fixtures" className="text-[10px] font-bold text-lime">الجدول كامل</Link>}
          />
          <div className="space-y-2">
            {upcomingFixtures.map((fixture) => {
              const home = teamsById.get(fixture.teamH);
              const away = teamsById.get(fixture.teamA);
              return (
                <div key={fixture.id} className="flex items-center gap-2 rounded-xl bg-white/[0.03] px-2 py-2">
                  <div className="flex flex-1 items-center justify-end gap-1.5 text-[11px] font-bold">
                    <span>{home?.shortName}</span>
                    <TeamBadge code={home?.code ?? 0} name={home?.name} />
                    <FdrPill difficulty={fixture.difficultyH} />
                  </div>
                  <span className="rounded-md bg-black/40 px-2 py-0.5 text-[10px] font-extrabold text-white/60">
                    {fixture.started ? `${fixture.scoreH ?? 0} - ${fixture.scoreA ?? 0}` : "VS"}
                  </span>
                  <div className="flex flex-1 items-center gap-1.5 text-[11px] font-bold">
                    <FdrPill difficulty={fixture.difficultyA} />
                    <TeamBadge code={away?.code ?? 0} name={away?.name} />
                    <span>{away?.shortName}</span>
                  </div>
                </div>
              );
            })}
            {!upcomingFixtures.length ? <p className="py-4 text-center text-[11px] text-white/40">لا مباريات مجدولة بعد</p> : null}
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <SectionTitle title="الأكثر امتلاكاً" subtitle="نسبة اختيار المديرين" action={<Link href="/stats?cat=ownership" className="text-[10px] font-bold text-lime">المزيد</Link>} />
            <div className="space-y-2">
              {owned.map((player) => (
                <Link key={player.id} href={`/players/${player.id}`} className="block">
                  <div className="mb-1 flex items-center justify-between text-[11px]">
                    <span className="font-bold text-white/85">{player.webName}</span>
                    <span className="font-extrabold text-mint">{player.selectedBy.toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-1.5 rounded-full bg-gradient-to-l from-mint to-lime" style={{ width: `${player.selectedBy}%` }} />
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          <Card>
            <SectionTitle title="قوة الأندية" subtitle="تصنيف القوة الرسمي" action={<Link href="/stats" className="text-[10px] font-bold text-lime">الإحصاءات</Link>} />
            <div className="grid grid-cols-2 gap-2">
              {topTeams.map((team) => (
                <div key={team.id} className="flex items-center gap-2 rounded-xl px-2 py-1.5" style={{ background: teamGradient(team.shortName) }}>
                  <TeamBadge code={team.code} name={team.name} />
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-bold text-white">{team.name}</p>
                    <p className="text-[9px] text-white/50">قوة {team.strength} · المركز {team.position}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Card>
        <SectionTitle
          title="قائمة المتابعة"
          subtitle="لاعبون محفوظون في قاعدة بيانات التطبيق"
          action={<Link href="/players" className="text-[10px] font-bold text-lime">أضف لاعبين</Link>}
        />
        {watch.length ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {watch.map((row) => {
              const player = playersById.get(row.playerId);
              return (
                <div key={row.id} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-2.5 py-2">
                  <Link href={`/players/${row.playerId}`} className="min-w-0 flex-1">
                    <p className="truncate text-xs font-extrabold text-white">{player?.webName ?? row.playerName}</p>
                    <p className="text-[10px] text-white/40">
                      {row.teamShort} · {row.position} · £{money(player?.cost ?? row.cost)} ·{" "}
                      <span className="text-lime">{player?.totalPoints ?? row.totalPoints} نقطة</span>
                    </p>
                  </Link>
                  {player && watchIds.has(player.id) ? (
                    <form action={toggleWatchAction}>
                      <input type="hidden" name="playerId" value={player.id} />
                      <input type="hidden" name="playerName" value={player.webName} />
                      <input type="hidden" name="position" value={player.position} />
                      <input type="hidden" name="teamShort" value={player.teamShort} />
                      <input type="hidden" name="cost" value={player.cost} />
                      <input type="hidden" name="totalPoints" value={player.totalPoints} />
                      <button type="submit" className="rounded-lg px-2 py-1 text-[10px] font-bold text-rose-300 hover:bg-rose-500/10">
                        إزالة
                      </button>
                    </form>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon="⭐"
            title="قائمة المتابعة فارغة"
            message="افتح صفحة أي لاعب واضغط «أضف للمتابعة» لتظهر هنا مع تحديث مباشر لإحصاءاته."
          />
        )}
      </Card>
    </div>
  );
}
