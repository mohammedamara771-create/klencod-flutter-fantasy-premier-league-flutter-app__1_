import Link from "next/link";
import { Badge, Bar, Card, EmptyState, PlayerAvatar, SectionTitle, TeamBadge } from "@/components/ui";
import { getGameData } from "@/lib/fpl/data";
import { money, posAr, rankText } from "@/lib/fpl/format";
import { LEADER_CATEGORIES, leaderboard, sortPlayers } from "@/lib/fpl/select";

export const dynamic = "force-dynamic";

export default async function StatsPage({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const params = await searchParams;
  const data = await getGameData();
  const active = LEADER_CATEGORIES.find((category) => category.slug === params.cat) ?? LEADER_CATEGORIES[0];
  const rows = leaderboard(data.players, active, 25);
  const max = Math.max(1, ...rows.map((player) => active.value(player)));
  const positions = ["GKP", "DEF", "MID", "FWD"] as const;

  return (
    <div className="space-y-4">
      <Card>
        <SectionTitle
          title="مركز الإحصاءات"
          subtitle={`${data.players.length} لاعباً · كل الأرقام من الواجهة الرسمية للفانتازي`}
        />
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1">
          {LEADER_CATEGORIES.map((category) => (
            <Link
              key={category.slug}
              href={`/stats?cat=${category.slug}`}
              className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-extrabold transition ${
                category.slug === active.slug ? "bg-lime text-black" : "bg-white/5 text-white/55 hover:text-white"
              }`}
            >
              {category.short}
            </Link>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <SectionTitle title={active.label} subtitle="أفضل 25 لاعباً · اضغط للتفاصيل الكاملة" />
          <div className="space-y-1">
            {rows.map((player, index) => {
              const value = active.value(player);
              return (
                <Link
                  key={player.id}
                  href={`/players/${player.id}`}
                  className="flex items-center gap-2 rounded-2xl px-1.5 py-1.5 transition hover:bg-white/5"
                >
                  <span className={`w-5 text-center text-[11px] font-extrabold ${index < 3 ? "text-lime" : "text-white/30"}`}>
                    {index + 1}
                  </span>
                  <PlayerAvatar photo={player.photo} name={player.webName} position={player.position} teamShort={player.teamShort} size={34} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-[12px] font-extrabold text-white">{player.webName}</p>
                      <p className="shrink-0 text-[12px] font-extrabold text-lime">
                        {active.formatted ? active.formatted(player) : value}
                      </p>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <TeamBadge code={player.teamCode} name={player.teamShort} />
                      <span className="text-[9px] text-white/40">
                        {player.teamShort} · {posAr(player.position)} · £{money(player.cost)} · {player.selectedBy.toFixed(0)}%
                      </span>
                      <span className="mr-auto w-16">
                        <Bar value={value} max={max} color={index < 3 ? "bg-lime" : "bg-violet/70"} height="h-1" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
            {!rows.length ? <EmptyState icon="📊" title="لا بيانات كافية" message="لا يوجد لاعبون يستوفون شروط هذا التصنيف بعد." /> : null}
          </div>
        </Card>

        <div className="space-y-4">
          {positions.map((position) => {
            const top = sortPlayers(
              data.players.filter((player) => player.position === position && player.minutes > 0),
              "total_points",
            ).slice(0, 4);
            return (
              <Card key={position}>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-extrabold text-white">{posAr(position)} — الأفضل نقاطاً</p>
                  <Badge className="border-white/15 bg-white/5 text-white/50">{position}</Badge>
                </div>
                <div className="space-y-1">
                  {top.map((player) => (
                    <Link key={player.id} href={`/players/${player.id}`} className="flex items-center gap-2 rounded-lg px-1 py-1 hover:bg-white/5">
                      <span className="truncate text-[11px] font-bold text-white/80">{player.webName}</span>
                      <span className="text-[9px] text-white/35">{player.teamShort}</span>
                      <span className="mr-auto text-[11px] font-extrabold text-lime">{player.totalPoints}</span>
                      <span className="text-[9px] text-mint">£{money(player.cost)}</span>
                    </Link>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <Card>
        <SectionTitle title="ترتيب أندية البريميرليج" subtitle="الحصيلة الحالية من الواجهة الرسمية" />
        <div className="overflow-x-auto">
          <table className="stats w-full text-[11px]">
            <thead>
              <tr className="text-[9px] text-white/40">
                <th className="py-1.5 pr-1 text-right font-bold">#</th>
                <th className="py-1.5 text-right font-bold">النادي</th>
                <th className="py-1.5 text-center font-bold">لعب</th>
                <th className="py-1.5 text-center font-bold">فوز</th>
                <th className="py-1.5 text-center font-bold">تعادل</th>
                <th className="py-1.5 text-center font-bold">خسارة</th>
                <th className="py-1.5 text-center font-bold">نقاط</th>
                <th className="py-1.5 text-center font-bold">قوة</th>
                <th className="py-1.5 text-center font-bold">فورمة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[...data.teams]
                .sort((a, b) => a.position - b.position)
                .map((team) => (
                  <tr key={team.id} className="text-white/75">
                    <td className="py-1.5 pr-1 text-right font-extrabold text-white/40">{team.position}</td>
                    <td className="py-1.5">
                      <span className="flex items-center gap-1.5">
                        <TeamBadge code={team.code} name={team.name} />
                        <span className="font-bold text-white">{team.name}</span>
                      </span>
                    </td>
                    <td className="py-1.5 text-center">{team.played}</td>
                    <td className="py-1.5 text-center">{team.win}</td>
                    <td className="py-1.5 text-center">{team.draw}</td>
                    <td className="py-1.5 text-center">{team.loss}</td>
                    <td className="py-1.5 text-center font-extrabold text-lime">{team.points}</td>
                    <td className="py-1.5 text-center">{team.strength}</td>
                    <td className="py-1.5 text-center text-[10px]">
                      {team.form
                        ? team.form.split("").map((result, index) => (
                            <span
                              key={`${team.id}-${index}`}
                              className={`mx-0.5 inline-flex h-4 w-4 items-center justify-center rounded text-[8px] font-extrabold ${
                                result === "W" ? "bg-emerald-500/25 text-emerald-300" : result === "L" ? "bg-rose-500/25 text-rose-300" : "bg-white/10 text-white/60"
                              }`}
                            >
                              {result === "W" ? "ف" : result === "L" ? "خ" : "ت"}
                            </span>
                          ))
                        : "—"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[9px] text-white/30">
          إجمالي المديرين: {rankText(data.totalPlayers)} · البيانات مستوردة من bootstrap-static الرسمي.
        </p>
      </Card>
    </div>
  );
}
