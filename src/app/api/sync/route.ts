import { getLastSync, refreshGameData } from "@/lib/fpl/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const last = await getLastSync();
  return Response.json({ ok: true, lastSync: last });
}

export async function POST() {
  try {
    const data = await refreshGameData();
    return Response.json({
      ok: true,
      source: "fantasy.premierleague.com/api",
      players: data.players.length,
      teams: data.teams.length,
      updatedAt: data.updatedAt,
    });
  } catch (error) {
    return Response.json(
      { ok: false, message: error instanceof Error ? error.message : "فشلت المزامنة" },
      { status: 502 },
    );
  }
}
