import Link from "next/link";
import { Badge, Card, EmptyState, SectionTitle } from "@/components/ui";
import { SquadBuilder } from "@/components/SquadBuilder";
import { deleteSquadAction } from "@/lib/actions";
import { getSavedSquads } from "@/lib/db-queries";
import { getGameData } from "@/lib/fpl/data";
import { money } from "@/lib/fpl/format";
import { toPlayerLite, toTeamLite } from "@/lib/fpl/lite";

export const dynamic = "force-dynamic";

export default async function BuilderPage() {
  const [data, saved] = await Promise.all([getGameData(), getSavedSquads()]);
  const players = data.players.filter((player) => player.status !== "u").map(toPlayerLite);
  const teams = toTeamLite(data.teams);

  return (
    <div className="space-y-4">
      <Card>
        <SectionTitle
          title="مُخطّط التشكيلة"
          subtitle="ابنِ تشكيلتك بـ 100 مليون: 2 حراس، 5 دفاع، 5 وسط، 3 هجوم، بحد أقصى 3 لاعبين من نادٍ واحد — ثم احفظها في قاعدة البيانات"
          action={<Badge className="border-lime/30 bg-lime/10 text-lime">تجريبي</Badge>}
        />
        <SquadBuilder players={players} teams={teams} />
      </Card>

      <div>
        <SectionTitle title="تشكيلاتك المحفوظة" subtitle={`${saved.length} تشكيلة في PostgreSQL`} />
        {saved.length ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {saved.map(({ squad, players: squadItems }) => {
              const captain = squadItems.find((player) => player.isCaptain);
              return (
                <Card key={squad.id} className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-extrabold text-white">{squad.name}</p>
                      <p className="text-[10px] text-white/40">
                        خطة {squad.formation} · {squadItems.length} لاعباً · المصروف £{squad.spent}M
                      </p>
                    </div>
                    <form action={deleteSquadAction}>
                      <input type="hidden" name="squadId" value={squad.id} />
                      <button type="submit" className="rounded-lg bg-rose-500/10 px-2 py-1 text-[10px] font-bold text-rose-300">
                        حذف
                      </button>
                    </form>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {squadItems.map((player) => (
                      <Link
                        key={player.id}
                        href={`/players/${player.playerId}`}
                        className="rounded-lg bg-white/5 px-1.5 py-0.5 text-[9px] font-bold text-white/70 hover:text-lime"
                      >
                        {player.playerName}
                        {player.isCaptain ? " ©" : ""}
                      </Link>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-white/45">
                    <span>الكابتن: {captain?.playerName ?? "—"}</span>
                    <span className="text-lime">البنك £{money(Number(squad.bank))}M</span>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState icon="🧩" title="لا تشكيلات محفوظة بعد" message="جرّب «الاختيار التلقائي» ثم احفظ التشكيلة لتظهر هنا." />
        )}
      </div>
    </div>
  );
}
