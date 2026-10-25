import { db } from "@/db";
import { fplPlayers, fplSnapshots, fplTeams, syncLogs } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import type {
  Event,
  Fixture,
  GameData,
  HistoryRow,
  HistorySeason,
  LeagueInfo,
  ManagerInfo,
  PastSeason,
  PicksData,
  Player,
  PlayerFixture,
  Position,
  RawBootstrap,
  RawElement,
  RawFixture,
  Team,
} from "./types";
import { mapRawFixtures } from "./fixtures";

const API = "https://fantasy.premierleague.com/api";
const SNAPSHOT_KIND = "bootstrap";

type CacheBox = { data: GameData; at: number; fixtures?: Fixture[] };
const globalForCache = globalThis as typeof globalThis & {
  __fplCache?: CacheBox;
  __fplPersistedAt?: number;
};

export function isPosition(value: unknown): value is Position {
  return value === "GKP" || value === "DEF" || value === "MID" || value === "FWD";
}

function num(value: string | number | null | undefined, fallback = 0): number {
  if (value === null || value === undefined || value === "") return fallback;
  const parsed = typeof value === "number" ? value : Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function mapPlayer(raw: RawElement): Player {
  return {
    id: raw.id,
    code: raw.code,
    firstName: raw.first_name,
    secondName: raw.second_name,
    webName: raw.web_name,
    photo: raw.photo ?? null,
    teamId: raw.team,
    teamCode: raw.team_code,
    teamShort: "",
    position: "MID",
    elementType: raw.element_type,
    cost: raw.now_cost / 10,
    costChangeStart: raw.cost_change_start / 10,
    costChangeEvent: raw.cost_change_event / 10,
    totalPoints: raw.total_points ?? 0,
    eventPoints: raw.event_points ?? 0,
    form: num(raw.form),
    pointsPerGame: num(raw.points_per_game),
    minutes: raw.minutes ?? 0,
    starts: raw.starts ?? 0,
    goals: raw.goals_scored ?? 0,
    assists: raw.assists ?? 0,
    cleanSheets: raw.clean_sheets ?? 0,
    goalsConceded: raw.goals_conceded ?? 0,
    saves: raw.saves ?? 0,
    bonus: raw.bonus ?? 0,
    bps: raw.bps ?? 0,
    ict: num(raw.ict_index),
    influence: num(raw.influence),
    creativity: num(raw.creativity),
    threat: num(raw.threat),
    expectedGoals: num(raw.expected_goals),
    expectedAssists: num(raw.expected_assists),
    expectedGoalInvolvements: num(raw.expected_goal_involvements),
    expectedGoalsConceded: num(raw.expected_goals_conceded),
    xgPer90: num(raw.expected_goals_per_90),
    xaPer90: num(raw.expected_assists_per_90),
    xgiPer90: num(raw.expected_goal_involvements_per_90),
    defensiveContribution: raw.defensive_contribution ?? 0,
    defConPer90: num(raw.defensive_contribution_per_90),
    selectedBy: num(raw.selected_by_percent),
    transfersIn: raw.transfers_in ?? 0,
    transfersOut: raw.transfers_out ?? 0,
    transfersInEvent: raw.transfers_in_event ?? 0,
    transfersOutEvent: raw.transfers_out_event ?? 0,
    valueForm: num(raw.value_form),
    valueSeason: num(raw.value_season),
    status: raw.status ?? "a",
    news: raw.news ?? "",
    chanceNext: raw.chance_of_playing_next_round ?? null,
    dreamteam: raw.dreamteam_count ?? 0,
    yellowCards: raw.yellow_cards ?? 0,
    redCards: raw.red_cards ?? 0,
    penaltiesSaved: raw.penalties_saved ?? 0,
    penaltiesMissed: raw.penalties_missed ?? 0,
    ownGoals: raw.own_goals ?? 0,
    priceChangePercent: num(raw.price_change_percent),
  };
}

export function mapBootstrap(raw: RawBootstrap, source: "live" | "cache"): GameData {
  const teams: Team[] = (raw.teams ?? []).map((team) => ({
    id: team.id,
    code: team.code,
    name: team.name,
    shortName: team.short_name,
    position: team.position ?? 0,
    played: team.played ?? 0,
    win: team.win ?? 0,
    draw: team.draw ?? 0,
    loss: team.loss ?? 0,
    points: team.points ?? 0,
    strength: team.strength ?? 3,
    form: team.form ?? null,
    attackHome: team.strength_attack_home ?? 0,
    attackAway: team.strength_attack_away ?? 0,
    defenceHome: team.strength_defence_home ?? 0,
    defenceAway: team.strength_defence_away ?? 0,
  }));

  const typeToPosition: Record<number, Position> = { 1: "GKP", 2: "DEF", 3: "MID", 4: "FWD" };
  const teamById = new Map(teams.map((team) => [team.id, team]));

  const players: Player[] = (raw.elements ?? []).map((rawElement) => {
    const player = mapPlayer(rawElement);
    player.position = typeToPosition[rawElement.element_type] ?? "MID";
    const team = teamById.get(rawElement.team);
    player.teamShort = team?.shortName ?? "";
    player.teamCode = team?.code ?? rawElement.team_code;
    return player;
  });

  const events: Event[] = (raw.events ?? []).map((event) => ({
    id: event.id,
    name: event.name,
    deadline: event.deadline_time,
    released: Boolean(event.released),
    finished: Boolean(event.finished),
    isCurrent: Boolean(event.is_current),
    isNext: Boolean(event.is_next),
    isPrevious: Boolean(event.is_previous),
    averageScore: event.average_entry_score ?? 0,
    highestScore: event.highest_score ?? 0,
    rankedCount: event.ranked_count ?? 0,
    transfersMade: event.transfers_made ?? 0,
    mostSelected: event.most_selected ?? null,
    mostTransferredIn: event.most_transferred_in ?? null,
    mostCaptained: event.most_captained ?? null,
    topElement: event.top_element ?? null,
    topElementPoints: event.top_element_info?.points ?? null,
    chipPlays: (event.chip_plays ?? []).map((chip) => ({
      name: chip.chip_name,
      plays: chip.num_played,
    })),
  }));

  return {
    players,
    teams,
    events,
    totalPlayers: raw.total_players ?? 0,
    updatedAt: new Date().toISOString(),
    source,
  };
}

async function apiFetch<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${API}${path}`, {
      headers: { Accept: "application/json", "User-Agent": "FPL-Arena/1.0" },
      cache: "no-store",
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

/** جلب البيانات الرسمية، ثم الذاكرة، ثم قاعدة البيانات كنسخة احتياطية */
export async function getGameData(): Promise<GameData> {
  const cached = globalForCache.__fplCache;
  if (cached && Date.now() - cached.at < 60_000) {
    return cached.data;
  }

  const raw = await apiFetch<RawBootstrap>("/bootstrap-static/");
  if (raw && Array.isArray(raw.elements)) {
    const data = mapBootstrap(raw, "live");
    globalForCache.__fplCache = { data, at: Date.now(), fixtures: cached?.fixtures };
    void persistSnapshot(data);
    return data;
  }

  const fallback = await readSnapshot();
  if (fallback) {
    globalForCache.__fplCache = { data: fallback, at: Date.now() };
    return fallback;
  }

  throw new Error("تعذّر الوصول إلى الواجهة الرسمية ولا توجد نسخة محفوظة في قاعدة البيانات.");
}

async function readSnapshot(): Promise<GameData | null> {
  try {
    const rows = await db
      .select()
      .from(fplSnapshots)
      .where(eq(fplSnapshots.kind, SNAPSHOT_KIND))
      .limit(1);
    if (!rows.length) return null;
    const payload = rows[0].payload as Partial<GameData>;
    if (!payload || !Array.isArray(payload.players) || !payload.players.length) return null;
    return {
      players: payload.players,
      teams: payload.teams ?? [],
      events: payload.events ?? [],
      totalPlayers: payload.totalPlayers ?? payload.players.length,
      updatedAt: new Date(rows[0].updatedAt).toISOString(),
      source: "cache",
    };
  } catch {
    return null;
  }
}

async function persistSnapshot(data: GameData) {
  if (Date.now() - (globalForCache.__fplPersistedAt ?? 0) < 10 * 60_000) return;
  globalForCache.__fplPersistedAt = Date.now();
  try {
    await saveSnapshot(data, "auto");
  } catch {
    // الكاش اختياري، لا نُفشل الصفحة بسببه
  }
}

/** حفظ نسخة كاملة من البيانات الرسمية في PostgreSQL */
export async function saveSnapshot(data: GameData, reason: "auto" | "manual" = "manual") {
  const rows = await db
    .select({ updatedAt: fplSnapshots.updatedAt })
    .from(fplSnapshots)
    .where(eq(fplSnapshots.kind, SNAPSHOT_KIND))
    .limit(1);

  if (reason === "auto" && rows.length) {
    const age = Date.now() - new Date(rows[0].updatedAt).getTime();
    if (age < 10 * 60_000) return { skipped: true };
  }

  const payload = {
    players: data.players,
    teams: data.teams,
    events: data.events,
    totalPlayers: data.totalPlayers,
  };

  await db
    .insert(fplSnapshots)
    .values({ kind: SNAPSHOT_KIND, season: "official", payload, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: fplSnapshots.kind,
      set: { payload, updatedAt: new Date() },
    });

  const playerRows = data.players.map((player) => ({
    id: player.id,
    webName: player.webName,
    fullName: `${player.firstName} ${player.secondName}`.trim(),
    teamId: player.teamId,
    teamShort: player.teamShort,
    position: player.position,
    cost: player.cost,
    totalPoints: player.totalPoints,
    eventPoints: player.eventPoints,
    form: player.form,
    minutes: player.minutes,
    goals: player.goals,
    assists: player.assists,
    cleanSheets: player.cleanSheets,
    bonus: player.bonus,
    selected: player.selectedBy,
    expectedGoals: player.expectedGoals,
    expectedAssists: player.expectedAssists,
    status: player.status,
    news: player.news,
    photo: player.photo,
    updatedAt: new Date(),
  }));

  for (let index = 0; index < playerRows.length; index += 200) {
    const chunk = playerRows.slice(index, index + 200);
    await db
      .insert(fplPlayers)
      .values(chunk)
      .onConflictDoUpdate({
        target: fplPlayers.id,
        set: {
          webName: sql`excluded.web_name`,
          teamShort: sql`excluded.team_short`,
          position: sql`excluded.position`,
          cost: sql`excluded.cost`,
          totalPoints: sql`excluded.total_points`,
          eventPoints: sql`excluded.event_points`,
          form: sql`excluded.form`,
          minutes: sql`excluded.minutes`,
          goals: sql`excluded.goals`,
          assists: sql`excluded.assists`,
          cleanSheets: sql`excluded.clean_sheets`,
          bonus: sql`excluded.bonus`,
          selected: sql`excluded.selected`,
          expectedGoals: sql`excluded.expected_goals`,
          expectedAssists: sql`excluded.expected_assists`,
          status: sql`excluded.status`,
          news: sql`excluded.news`,
          photo: sql`excluded.photo`,
          updatedAt: new Date(),
        },
      });
  }

  await db
    .insert(fplTeams)
    .values(
      data.teams.map((team) => ({
        id: team.id,
        name: team.name,
        shortName: team.shortName,
        code: team.code,
        strength: team.strength,
        position: team.position,
        points: team.points,
        played: team.played,
      })),
    )
    .onConflictDoUpdate({
      target: fplTeams.id,
      set: {
        name: sql`excluded.name`,
        shortName: sql`excluded.short_name`,
        code: sql`excluded.code`,
        strength: sql`excluded.strength`,
        position: sql`excluded.position`,
        points: sql`excluded.points`,
        played: sql`excluded.played`,
      },
    });

  await db.insert(syncLogs).values({
    source: "official-api",
    status: "ok",
    players: data.players.length,
    teams: data.teams.length,
    message: "تمت مزامنة البيانات الرسمية من fantasy.premierleague.com",
  });

  return { skipped: false };
}

export async function getLastSync() {
  try {
    const rows = await db
      .select()
      .from(syncLogs)
      .orderBy(sql`${syncLogs.createdAt} desc`)
      .limit(1);
    if (!rows.length) return null;
    return {
      at: rows[0].createdAt.toISOString(),
      players: rows[0].players,
      teams: rows[0].teams,
      status: rows[0].status,
    };
  } catch {
    return null;
  }
}

export async function getFixtures(): Promise<Fixture[]> {
  const cached = globalForCache.__fplCache;
  if (cached?.fixtures && Date.now() - cached.at < 60_000) return cached.fixtures;
  const raw = await apiFetch<RawFixture[]>("/fixtures/");
  const fixtures = mapRawFixtures(raw ?? []);
  if (cached) cached.fixtures = fixtures;
  return fixtures;
}

export async function getElementSummary(elementId: number) {
  const raw = await apiFetch<{
    fixtures: {
      id: number;
      event: number | null;
      event_name: string;
      kickoff_time: string | null;
      team_h: number;
      team_a: number;
      is_home: boolean;
      difficulty: number;
      finished: boolean;
    }[];
    history: {
      round: number;
      fixture: number;
      opponent_team: number;
      was_home: boolean;
      kickoff_time: string | null;
      team_h_score: number | null;
      team_a_score: number | null;
      total_points: number;
      minutes: number;
      goals_scored: number;
      assists: number;
      clean_sheets: number;
      goals_conceded: number;
      saves: number;
      bonus: number;
      bps: number;
      expected_goals: string;
      expected_assists: string;
      expected_goal_involvements: string;
      value: number;
    }[];
    history_past: {
      season_name: string;
      start_cost: number;
      end_cost: number;
      total_points: number;
      minutes: number;
      goals_scored: number;
      assists: number;
      clean_sheets: number;
      bonus: number;
      expected_goal_involvements: string;
    }[];
  }>(`/element-summary/${elementId}/`);

  if (!raw) return null;

  const upcoming: PlayerFixture[] = (raw.fixtures ?? []).map((fixture) => {
    const isHome = Boolean(fixture.is_home);
    return {
      id: fixture.id,
      event: fixture.event,
      eventName: fixture.event_name,
      kickoff: fixture.kickoff_time,
      opponent: isHome ? fixture.team_a : fixture.team_h,
      isHome,
      difficulty: fixture.difficulty,
      finished: fixture.finished,
    };
  });

  const history: HistoryRow[] = (raw.history ?? []).map((row) => ({
    round: row.round,
    fixture: row.fixture,
    opponent: row.opponent_team,
    wasHome: row.was_home,
    kickoff: row.kickoff_time,
    scoreH: row.team_h_score,
    scoreA: row.team_a_score,
    points: row.total_points,
    minutes: row.minutes,
    goals: row.goals_scored,
    assists: row.assists,
    cleanSheets: row.clean_sheets,
    goalsConceded: row.goals_conceded,
    saves: row.saves,
    bonus: row.bonus,
    bps: row.bps,
    expectedGoals: num(row.expected_goals),
    expectedAssists: num(row.expected_assists),
    expectedGoalInvolvements: num(row.expected_goal_involvements),
    value: row.value / 10,
  }));

  const past: PastSeason[] = (raw.history_past ?? []).map((row) => ({
    season: row.season_name,
    startCost: row.start_cost / 10,
    endCost: row.end_cost / 10,
    points: row.total_points,
    minutes: row.minutes,
    goals: row.goals_scored,
    assists: row.assists,
    cleanSheets: row.clean_sheets,
    bonus: row.bonus,
    expectedGoalInvolvements: num(row.expected_goal_involvements),
  }));

  return { upcoming, history, past };
}

export async function getManagerInfo(entryId: number): Promise<ManagerInfo | null> {
  const raw = await apiFetch<{
    id: number;
    player_first_name: string;
    player_last_name: string;
    name: string;
    favourite_team: number | null;
    started_event: number | null;
    years_active: number;
    player_region_name: string;
    current_event: number | null;
    summary_overall_rank: number | null;
    summary_overall_points: number | null;
    summary_event_points: number | null;
    last_deadline_bank: number | null;
    last_deadline_value: number | null;
    leagues: {
      classic: {
        id: number;
        name: string;
        rank: number | null;
        total: number | null;
      }[];
    };
  }>(`/entry/${entryId}/`);

  if (!raw) return null;

  const favouriteLeague = (raw.leagues?.classic ?? [])
    .filter((league) => league.name)
    .sort((a, b) => (a.rank ?? 9e9) - (b.rank ?? 9e9))[0];

  return {
    id: raw.id,
    firstName: raw.player_first_name,
    lastName: raw.player_last_name,
    teamName: raw.name,
    favouriteTeam: raw.favourite_team,
    startedEvent: raw.started_event,
    yearsActive: raw.years_active ?? 0,
    regionName: raw.player_region_name ?? "",
    currentEvent: raw.current_event,
    summaryOverallRank: raw.summary_overall_rank,
    summaryOverallPoints: raw.summary_overall_points,
    summaryEventPoints: raw.summary_event_points,
    summaryBank: raw.last_deadline_bank === null ? null : raw.last_deadline_bank / 10,
    summaryValue: raw.last_deadline_value === null ? null : raw.last_deadline_value / 10,
    favouriteLeague: favouriteLeague
      ? {
          id: favouriteLeague.id,
          name: favouriteLeague.name,
          rank: favouriteLeague.rank,
          total: favouriteLeague.total,
        }
      : null,
  };
}

export async function getPicks(entryId: number, event: number): Promise<PicksData | null> {
  const raw = await apiFetch<{
    active_chip: string | null;
    entry_history: {
      event: number;
      points: number;
      rank: number | null;
      bank: number | null;
      value: number | null;
    };
    picks: {
      element: number;
      position: number;
      multiplier: number;
      is_captain: boolean;
      is_vice_captain: boolean;
    }[];
  }>(`/entry/${entryId}/event/${event}/picks/`);

  if (!raw) return null;
  return {
    activeChip: raw.active_chip ?? null,
    event,
    points: raw.entry_history?.points ?? 0,
    rank: raw.entry_history?.rank ?? null,
    bank: raw.entry_history?.bank === null ? null : raw.entry_history.bank / 10,
    value: raw.entry_history?.value === null ? null : raw.entry_history.value / 10,
    picks: (raw.picks ?? []).map((pick) => ({
      element: pick.element,
      position: pick.position,
      multiplier: pick.multiplier,
      isCaptain: Boolean(pick.is_captain),
      isVice: Boolean(pick.is_vice_captain),
    })),
  };
}

export async function getManagerHistory(entryId: number): Promise<{
  current: HistorySeason[];
  chips: { name: string; event: number }[];
} | null> {
  const raw = await apiFetch<{
    current: {
      event: number;
      points: number;
      total_points: number;
      rank: number | null;
      overall_rank: number | null;
      bank: number | null;
      value: number | null;
      event_transfers: number;
      event_transfers_cost: number;
    }[];
    chips: { name: string; event: number }[];
  }>(`/entry/${entryId}/history/`);

  if (!raw) return null;
  return {
    current: (raw.current ?? []).map((row) => ({
      event: row.event,
      points: row.points,
      totalPoints: row.total_points,
      rank: row.rank,
      overallRank: row.overall_rank,
      bank: row.bank === null ? null : row.bank / 10,
      value: row.value === null ? null : row.value / 10,
      transfers: row.event_transfers,
      transfersCost: row.event_transfers_cost,
      chip: raw.chips?.filter((chip) => chip.event === row.event).map((chip) => chip.name).join(", ") || null,
    })),
    chips: raw.chips ?? [],
  };
}

export async function getLeague(leagueId: number, page = 1): Promise<LeagueInfo | null> {
  const raw = await apiFetch<{
    league: { id: number; name: string; created: string | null; league_type: string };
    standings: {
      has_next: boolean;
      page: number;
      results: {
        rank: number;
        entry: number;
        entry_name: string;
        player_name: string;
        event_total: number;
        total: number;
      }[];
    };
  }>(`/leagues-classic/${leagueId}/standings/?page_standings=${page}`);

  if (!raw?.league) return null;
  return {
    id: raw.league.id,
    name: raw.league.name || `دوري ${leagueId}`,
    created: raw.league.created,
    leagueType: raw.league.league_type,
    hasNext: Boolean(raw.standings?.has_next),
    page: raw.standings?.page ?? page,
    standings: (raw.standings?.results ?? []).map((row) => ({
      rank: row.rank,
      entry: row.entry,
      entryName: row.entry_name,
      playerName: row.player_name,
      eventPoints: row.event_total,
      total: row.total,
    })),
  };
}

/** جلب مباشر بدون كاش + تحديث النسخة المحفوظة */
export async function refreshGameData(): Promise<GameData> {
  let raw: RawBootstrap | null = null;
  try {
    const response = await fetch(`${API}/bootstrap-static/`, {
      headers: { Accept: "application/json", "User-Agent": "FPL-Arena/1.0" },
      cache: "no-store",
    });
    raw = response.ok ? ((await response.json()) as RawBootstrap) : null;
  } catch {
    raw = null;
  }
  if (!raw?.elements?.length) {
    throw new Error("تعذّر الاتصال بالواجهة الرسمية. حاول لاحقاً.");
  }
  const data = mapBootstrap(raw, "live");
  await saveSnapshot(data, "manual");
  globalForCache.__fplCache = { data, at: Date.now() };
  globalForCache.__fplPersistedAt = Date.now();
  return data;
}
