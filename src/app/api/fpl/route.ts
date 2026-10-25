import { getGameData } from "@/lib/fpl/data";
import { currentEvent, nextEvent } from "@/lib/fpl/select";

export const dynamic = "force-dynamic";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

/**
 * واجهة JSON عامة يمكن لأي عميل (Next.js / Flutter / موبايل) استهلاكها.
 * مثال: /api/fpl?position=FWD&team=MCI&sort=total_points&limit=20
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const position = url.searchParams.get("position")?.toUpperCase();
    const team = url.searchParams.get("team")?.toUpperCase();
    const search = url.searchParams.get("q")?.toLowerCase();
    const sortParam = url.searchParams.get("sort") ?? "total_points";
    const limit = Math.min(200, Math.max(1, Number(url.searchParams.get("limit")) || 25));

    const data = await getGameData();
    const sortMap = {
      total_points: "totalPoints",
      event_points: "eventPoints",
      form: "form",
      cost: "cost",
      selected: "selectedBy",
      goals: "goals",
      assists: "assists",
      expectedGoalInvolvements: "expectedGoalInvolvements",
      minutes: "minutes",
      pointsPerGame: "pointsPerGame",
    } as const;
    const sortKey = sortMap[sortParam as keyof typeof sortMap] ?? "totalPoints";

    const filtered = data.players
      .filter((player) => (position ? player.position === position : true))
      .filter((player) => (team ? player.teamShort === team : true))
      .filter((player) =>
        search ? player.webName.toLowerCase().includes(search) : true,
      )
      .sort((a, b) => Number(b[sortKey] ?? 0) - Number(a[sortKey] ?? 0))
      .slice(0, limit);

    return Response.json(
      {
        ok: true,
        source: "https://fantasy.premierleague.com/api",
        updatedAt: data.updatedAt,
        season: "official",
        currentEvent: currentEvent(data.events) ?? null,
        nextEvent: nextEvent(data.events) ?? null,
        totalPlayers: data.totalPlayers,
        teams: data.teams.map((item) => ({
          id: item.id,
          name: item.name,
          short: item.shortName,
          code: item.code,
          strength: item.strength,
          position: item.position,
        })),
        elements: filtered.map((player) => ({
          id: player.id,
          name: player.webName,
          team: player.teamShort,
          position: player.position,
          cost: player.cost,
          total_points: player.totalPoints,
          event_points: player.eventPoints,
          form: player.form,
          points_per_game: player.pointsPerGame,
          minutes: player.minutes,
          goals: player.goals,
          assists: player.assists,
          clean_sheets: player.cleanSheets,
          bonus: player.bonus,
          bps: player.bps,
          ict_index: player.ict,
          expected_goals: player.expectedGoals,
          expected_assists: player.expectedAssists,
          expected_goal_involvements: player.expectedGoalInvolvements,
          selected_by_percent: player.selectedBy,
          status: player.status,
          news: player.news,
          photo: player.photo,
        })),
        documentation: {
          filters: ["position=GKP|DEF|MID|FWD", "team=MCI", "q=search", "sort=total_points|form|cost|goals|assists|expectedGoalInvolvements", "limit=1..200"],
          manager: "/api/fpl/manager/{entryId}",
          sync: "/api/sync (POST)",
        },
      },
      { headers: CORS },
    );
  } catch (error) {
    return Response.json(
      { ok: false, message: error instanceof Error ? error.message : "خطأ غير متوقع" },
      { status: 502, headers: CORS },
    );
  }
}
