import { PlayersExplorer } from "@/components/PlayersExplorer";
import { Card, SectionTitle } from "@/components/ui";
import { getGameData } from "@/lib/fpl/data";
import { toPlayerLite, toTeamLite } from "@/lib/fpl/lite";
import { sortPlayers } from "@/lib/fpl/select";
import { money } from "@/lib/fpl/format";
import { getWatchlist } from "@/lib/db-queries";

export const dynamic = "force-dynamic";

export default async function PlayersPage() {
  const [data, watch] = await Promise.all([getGameData(), getWatchlist()]);
  const lite = data.players.map(toPlayerLite);
  const teams = toTeamLite(data.teams).sort((a, b) => a.name.localeCompare(b.name, "ar"));
  const topScorer = sortPlayers(data.players, "goals")[0];
  const mostExpensive = sortPlayers(data.players, "cost")[0];
  const bestForm = sortPlayers(data.players.filter((player) => player.minutes > 180), "form")[0];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-white/45">الهداف الحالي</p>
            <p className="text-sm font-extrabold text-white">{topScorer?.webName ?? "—"}</p>
            <p className="text-[10px] text-white/40">{topScorer?.goals ?? 0} هدف · {topScorer?.teamShort}</p>
          </div>
          <span className="text-2xl">⚽</span>
        </Card>
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-white/45">أفضل فورمة</p>
            <p className="text-sm font-extrabold text-white">{bestForm?.webName ?? "—"}</p>
            <p className="text-[10px] text-lime">{bestForm?.form.toFixed(1) ?? "0"} نقطة/مباراة</p>
          </div>
          <span className="text-2xl">🔥</span>
        </Card>
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-white/45">الأغلى سعراً</p>
            <p className="text-sm font-extrabold text-white">{mostExpensive?.webName ?? "—"}</p>
            <p className="text-[10px] text-mint">£{money(mostExpensive?.cost ?? 0)}M</p>
          </div>
          <span className="text-2xl">💰</span>
        </Card>
      </div>

      <div>
        <SectionTitle
          title="قاعدة بيانات اللاعبين"
          subtitle={`${data.players.length} لاعباً من ${data.teams.length} نادياً · اضغط النجمة للمتابعة`}
        />
        <PlayersExplorer players={lite} teams={teams} watchedIds={watch.map((row) => row.playerId)} />
      </div>
    </div>
  );
}
