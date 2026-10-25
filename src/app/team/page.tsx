import Link from "next/link";
import { Badge, Card, EmptyState, Notice, PlayerAvatar, SectionTitle, StatTile, TeamBadge } from "@/components/ui";
import { trackManagerAction, untrackManagerAction } from "@/lib/actions";
import { getTrackedManagers } from "@/lib/db-queries";
import { getGameData, getManagerHistory, getManagerInfo, getPicks } from "@/lib/fpl/data";
import { compact, money, rankText } from "@/lib/fpl/format";
import { currentEvent, playerMap, teamMap } from "@/lib/fpl/select";
import type { HistorySeason, ManagerInfo, PicksData } from "@/lib/fpl/types";

export const dynamic = "force-dynamic";

const CHIP_LABELS: Record<string, string> = {
  wildcard: "وايلد كارد",
  freehit: "فري هيت",
  bboost: "بنش بوست",
  "3xc": "تريبل كابتن",
  manager: "مدير",
};

export default async function TeamPage({
  searchParams,
}: {
  searchParams: Promise<{ entry?: string; gw?: string }>;
}) {
  const params = await searchParams;
  const [data, tracked] = await Promise.all([getGameData(), getTrackedManagers()]);
  const playersById = playerMap(data.players);
  const teamsById = teamMap(data.teams);
  const entryId = Number(params.entry) || tracked[0]?.entryId || 0;

  let info: ManagerInfo | null = null;
  let picks: PicksData | null = null;
  let history: { current: HistorySeason[]; chips: { name: string; event: number }[] } | null = null;
  let picksEvent = 0;

  if (entryId > 0) {
    info = await getManagerInfo(entryId);
    if (info) {
      history = await getManagerHistory(entryId);
      const fallbackEvent =
        [...(history?.current ?? [])].reverse().find((row) => row.totalPoints > 0)?.event ??
        currentEvent(data.events)?.id ??
        1;
      picksEvent = Number(params.gw) || (currentEvent(data.events)?.id ?? fallbackEvent);
      picks = await getPicks(entryId, picksEvent);
      if (!picks) {
        picksEvent = fallbackEvent;
        picks = await getPicks(entryId, picksEvent);
      }
    }
  }

  const starting = (picks?.picks ?? []).slice(0, 11);
  const bench = (picks?.picks ?? []).slice(11);
  const startingPlayers = starting.map((pick) => playersById.get(pick.element)).filter((player): player is NonNullable<typeof player> => Boolean(player));
  const formationCounts = startingPlayers.reduce<Record<string, number>>((acc, player) => {
    acc[player.position] = (acc[player.position] ?? 0) + 1;
    return acc;
  }, {});
  const formation = `${formationCounts.DEF ?? 0}-${formationCounts.MID ?? 0}-${formationCounts.FWD ?? 0}`;
  const chips = history?.chips ?? [];
  const seasonPoints = history?.current ?? [];
  const bestGw = [...seasonPoints].sort((a, b) => b.points - a.points)[0];
  const lastGw = [...seasonPoints].reverse().find((row) => row.event <= picksEvent);
  const maxGwPoints = Math.max(1, ...seasonPoints.map((row) => row.points));

  return (
    <div className="space-y-4">
      <Card>
        <SectionTitle
          title="تابع فريقك في الفانتازي"
          subtitle="أدخل معرّف المدير (Entry ID) من الواجهة الرسمية لعرض كل التفاصيل"
        />
        <form method="get" action="/team" className="flex flex-wrap items-center gap-2">
          <input
            name="entry"
            type="number"
            min={1}
            defaultValue={entryId || ""}
            placeholder="مثال: 1234567"
            className="min-w-40 flex-1 rounded-2xl border border-white/10 bg-black/30 px-3 py-2.5 text-xs font-bold text-white placeholder:text-white/30 focus:border-lime/60 focus:outline-none"
          />
          <select
            name="gw"
            defaultValue={picksEvent || ""}
            className="rounded-2xl border border-white/10 bg-[#151221] px-2 py-2.5 text-[11px] font-bold text-white/80 focus:outline-none"
          >
            <option value="">الجولة الحالية</option>
            {data.events
              .filter((event) => event.released)
              .map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
          </select>
          <button type="submit" className="rounded-2xl bg-lime px-4 py-2.5 text-xs font-extrabold text-black lime-glow">
            عرض الفريق
          </button>
        </form>
        {tracked.length ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="text-[10px] font-bold text-white/40">محفوظون:</span>
            {tracked.map((row) => (
              <span key={row.id} className="flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-bold text-white/70">
                <Link href={`/team?entry=${row.entryId}`} className="hover:text-lime">
                  {row.teamName}
                </Link>
                <form action={untrackManagerAction}>
                  <input type="hidden" name="entryId" value={row.entryId} />
                  <button type="submit" className="text-rose-300/70 hover:text-rose-300">×</button>
                </form>
              </span>
            ))}
          </div>
        ) : null}
        {!entryId ? (
          <div className="mt-2">
            <Notice>
              ابحث عن معرّفك من رابط فريقك: fantasy.premierleague.com/entry/<b>1234567</b>/event/1 — الأرقام هي المعرّف.
            </Notice>
          </div>
        ) : null}
      </Card>

      {entryId > 0 && !info ? (
        <EmptyState
          icon="🔎"
          title="لم يُعثر على هذا المدير"
          message="تأكد من معرّف المدير (Entry ID) في الواجهة الرسمية. الأرقام فقط بدون روابط."
        />
      ) : null}

      {info ? (
        <>
          <div className="relative overflow-hidden rounded-[26px] border border-white/10 bg-gradient-to-bl from-mint/20 via-[#13111f] to-[#0b0a14] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-white sm:text-2xl">{info.teamName}</h1>
                  <Badge className="border-white/20 bg-white/10 text-white/70">#{info.id}</Badge>
                </div>
                <p className="mt-1 text-[11px] text-white/50">
                  {info.firstName} {info.lastName} · بدأ من الجولة {info.startedEvent ?? "—"} · {info.yearsActive} عاماً في الفانتازي
                  {info.regionName ? ` · ${info.regionName}` : ""}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {info.favouriteTeam ? (
                    <span className="flex items-center gap-1.5 rounded-full bg-white/5 px-2 py-1 text-[10px] font-bold text-white/70">
                      <TeamBadge code={teamsById.get(info.favouriteTeam)?.code ?? 0} name="ناديه" />
                      {teamsById.get(info.favouriteTeam)?.name}
                    </span>
                  ) : null}
                  {info.favouriteLeague ? (
                    <Link href={`/leagues?id=${info.favouriteLeague.id}`} className="rounded-full bg-white/5 px-2 py-1 text-[10px] font-bold text-lime">
                      {info.favouriteLeague.name} · المركز {rankText(info.favouriteLeague.rank)}
                    </Link>
                  ) : null}
                </div>
              </div>
              <form action={trackManagerAction}>
                <input type="hidden" name="entryId" value={info.id} />
                <input type="hidden" name="managerName" value={`${info.firstName} ${info.lastName}`} />
                <input type="hidden" name="teamName" value={info.teamName} />
                <button type="submit" className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-[11px] font-extrabold text-white hover:border-lime/50 hover:text-lime">
                  {tracked.some((row) => row.entryId === info?.id) ? "★ محفوظ" : "☆ احفظ المدير"}
                </button>
              </form>
            </div>
          </div>

          <section className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-7">
            <StatTile label="الترتيب العام" value={rankText(info.summaryOverallRank)} accent="text-lime" />
            <StatTile label="مجموع النقاط" value={rankText(info.summaryOverallPoints)} />
            <StatTile label={`نقاط GW${picksEvent || ""}`} value={picks?.points ?? info.summaryEventPoints ?? 0} accent="text-mint" />
            <StatTile label="قيمة الفريق" value={`£${money(picks?.value ?? info.summaryValue ?? 0)}M`} />
            <StatTile label="في البنك" value={`£${money(picks?.bank ?? info.summaryBank ?? 0)}M`} />
            <StatTile label="أفضل جولة" value={bestGw ? `${bestGw.points} (GW${bestGw.event})` : "—"} />
            <StatTile label="الشيبس المستخدمة" value={chips.length ? chips.map((chip) => CHIP_LABELS[chip.name] ?? chip.name).join(" · ") : "لم يستخدم"} />
          </section>

          <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
            <Card>
              <SectionTitle
                title={`تشكيلة الجولة ${picksEvent}`}
                subtitle={formation ? `خطة ${formation}${picks?.activeChip ? ` · شيب ${CHIP_LABELS[picks.activeChip] ?? picks.activeChip}` : ""}` : "اختر جولة"}
              />
              <div className="mb-3 grid grid-cols-2 gap-1.5">
                {starting.map((pick) => {
                  const player = playersById.get(pick.element);
                  if (!player) return null;
                  return (
                    <Link
                      key={pick.element}
                      href={`/players/${player.id}`}
                      className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-2 py-1.5 hover:border-lime/30"
                    >
                      <PlayerAvatar photo={player.photo} name={player.webName} position={player.position} teamShort={player.teamShort} size={32} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-extrabold text-white">
                          {player.webName} {pick.isCaptain ? "©" : pick.isVice ? "Ⓥ" : ""}
                        </p>
                        <p className="text-[9px] text-white/40">
                          {player.teamShort} · {player.position} · £{money(player.cost)}
                        </p>
                      </div>
                      <span className="text-[11px] font-extrabold text-lime">{player.eventPoints * pick.multiplier}</span>
                    </Link>
                  );
                })}
              </div>
              {bench.length ? (
                <>
                  <p className="mb-1 text-[10px] font-bold text-white/35">دكة البدلاء</p>
                  <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                    {bench.map((pick) => {
                      const player = playersById.get(pick.element);
                      if (!player) return null;
                      return (
                        <Link key={pick.element} href={`/players/${player.id}`} className="rounded-xl bg-white/[0.02] px-2 py-1.5">
                          <p className="truncate text-[10px] font-bold text-white/70">{player.webName}</p>
                          <p className="text-[9px] text-white/35">
                            {player.position} · {player.eventPoints} نقطة
                          </p>
                        </Link>
                      );
                    })}
                  </div>
                </>
              ) : null}
              {!starting.length ? (
                <EmptyState icon="🧩" title="لا توجد تشكيلة لهذه الجولة" message="قد تكون الجولة غير متاحة بعد أو لم يختر المدير فريقه." />
              ) : null}
            </Card>

            <div className="space-y-4">
              <Card>
                <SectionTitle title="مسار الموسم" subtitle="نقاط كل جولة" />
                {seasonPoints.length ? (
                  <div className="flex h-32 items-end gap-1">
                    {seasonPoints.map((row) => (
                      <div key={row.event} className="flex flex-1 flex-col items-center gap-1">
                        <span className="text-[8px] font-bold text-white/40">{row.points}</span>
                        <div
                          className={`w-full rounded-t-md ${row.event === picksEvent ? "bg-lime" : "bg-violet/60"}`}
                          style={{ height: `${Math.max(4, (row.points / maxGwPoints) * 88)}px` }}
                          title={`GW${row.event}: ${row.points}`}
                        />
                        <span className="text-[7px] text-white/30">{row.event}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-4 text-center text-[11px] text-white/40">لا سجل جولات بعد</p>
                )}
                {lastGw ? (
                  <p className="mt-2 text-[10px] text-white/40">
                    آخر جولة GW{lastGw.event}: {lastGw.points} نقطة · الترتيب العام {rankText(lastGw.overallRank)} · قيمة £{money(lastGw.value ?? 0)}M
                  </p>
                ) : null}
              </Card>

              <Card>
                <SectionTitle title="الشيبس والانتقالات" />
                <div className="grid grid-cols-2 gap-1.5">
                  <StatTile label="انتقالات آخر جولة" value={lastGw?.transfers ?? 0} />
                  <StatTile label="خصم الانتقالات" value={lastGw?.transfersCost ?? 0} />
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {Object.entries(CHIP_LABELS).map(([key, label]) => {
                    const used = chips.find((chip) => chip.name === key);
                    return (
                      <span
                        key={key}
                        className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                          used ? "bg-lime/15 text-lime" : "bg-white/5 text-white/30"
                        }`}
                      >
                        {label}{used ? ` · GW${used.event}` : ""}
                      </span>
                    );
                  })}
                </div>
                <div className="mt-3">
                  <p className="mb-1 text-[10px] text-white/40">الترتيب العام عبر الجولات</p>
                  <div className="space-y-1">
                    {seasonPoints.slice(-4).map((row) => (
                      <div key={row.event} className="flex items-center justify-between text-[10px]">
                        <span className="text-white/50">GW{row.event}</span>
                        <span className="font-extrabold text-white/80">{rankText(row.overallRank)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <Card>
            <SectionTitle title="سجل الجولات الكامل" subtitle="النقاط، الترتيب العام، القيمة والانتقالات" />
            <div className="overflow-x-auto">
              <table className="stats w-full text-[11px]">
                <thead>
                  <tr className="text-[9px] text-white/40">
                    <th className="py-1.5 pr-1 text-right font-bold">الجولة</th>
                    <th className="py-1.5 text-center font-bold">النقاط</th>
                    <th className="py-1.5 text-center font-bold">المجموع</th>
                    <th className="py-1.5 text-center font-bold">ترتيب الجولة</th>
                    <th className="py-1.5 text-center font-bold">الترتيب العام</th>
                    <th className="py-1.5 text-center font-bold">قيمة الفريق</th>
                    <th className="py-1.5 text-center font-bold">البنك</th>
                    <th className="py-1.5 text-center font-bold">انتقالات</th>
                    <th className="py-1.5 text-center font-bold">شيب</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[...seasonPoints].reverse().map((row) => (
                    <tr key={row.event} className="text-white/75">
                      <td className="py-1.5 pr-1 text-right font-bold">{row.event}</td>
                      <td className="py-1.5 text-center">
                        <span className={`inline-block min-w-6 rounded px-1.5 text-[10px] font-extrabold ${row.points >= 60 ? "bg-lime/20 text-lime" : "bg-white/10"}`}>
                          {row.points}
                        </span>
                      </td>
                      <td className="py-1.5 text-center">{row.totalPoints}</td>
                      <td className="py-1.5 text-center">{rankText(row.rank)}</td>
                      <td className="py-1.5 text-center">{compact(row.overallRank ?? 0)}</td>
                      <td className="py-1.5 text-center">{row.value ? `${money(row.value)}M` : "—"}</td>
                      <td className="py-1.5 text-center">{row.bank ? `${money(row.bank)}M` : "—"}</td>
                      <td className="py-1.5 text-center">{row.transfers}</td>
                      <td className="py-1.5 text-center text-[10px] text-mint">{row.chip ?? "—"}</td>
                    </tr>
                  ))}
                  {!seasonPoints.length ? (
                    <tr>
                      <td colSpan={9} className="py-4 text-center text-[11px] text-white/40">لا توجد بيانات</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : null}

      {entryId > 0 ? (
        <p className="text-center text-[10px] text-white/30">
          البيانات مباشرة من fantasy.premierleague.com/api — قد تتأخر دقائق عن الموقع الرسمي.
        </p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-3">
          {[
            { icon: "📈", title: "إحصاءات كاملة", text: "نقاط، ترتيب، انتقالات وشيبس لكل جولة" },
            { icon: "🧮", title: "قيمة الفريق", text: "البنك وقيمة التشكيلة الحالية" },
            { icon: "🏆", title: "دورياتك", text: "ترتيبك في الدوريات الرسمية والخاصة" },
          ].map((item) => (
            <Card key={item.title} className="flex items-start gap-2.5">
              <span className="text-xl">{item.icon}</span>
              <div>
                <p className="text-xs font-extrabold text-white">{item.title}</p>
                <p className="text-[10px] leading-4 text-white/45">{item.text}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
