import type { Event, Fixture, GameData, Player, Team } from "./types";

export function currentEvent(events: Event[]): Event | undefined {
  return (
    events.find((event) => event.isCurrent) ??
    events.find((event) => event.isNext) ??
    [...events].reverse().find((event) => event.finished) ??
    events[0]
  );
}

export function nextEvent(events: Event[]): Event | undefined {
  return events.find((event) => event.isNext) ?? events.find((event) => !event.finished);
}

export function lastFinishedEvent(events: Event[]): Event | undefined {
  return [...events].reverse().find((event) => event.finished);
}

export function teamMap(teams: Team[]): Map<number, Team> {
  return new Map(teams.map((team) => [team.id, team]));
}

export function playerMap(players: Player[]): Map<number, Player> {
  return new Map(players.map((player) => [player.id, player]));
}

export type SortKey =
  | "total_points"
  | "event_points"
  | "form"
  | "cost"
  | "selected"
  | "goals"
  | "assists"
  | "expectedGoalInvolvements"
  | "minutes"
  | "pointsPerGame"
  | "bonus"
  | "bps"
  | "valueSeason";

export function sortPlayers(players: Player[], key: SortKey, direction: "asc" | "desc" = "desc"): Player[] {
  const mapped: Record<SortKey, (player: Player) => number> = {
    total_points: (player) => player.totalPoints,
    event_points: (player) => player.eventPoints,
    form: (player) => player.form,
    cost: (player) => player.cost,
    selected: (player) => player.selectedBy,
    goals: (player) => player.goals,
    assists: (player) => player.assists,
    expectedGoalInvolvements: (player) => player.expectedGoalInvolvements,
    minutes: (player) => player.minutes,
    pointsPerGame: (player) => player.pointsPerGame,
    bonus: (player) => player.bonus,
    bps: (player) => player.bps,
    valueSeason: (player) => player.valueSeason,
  };
  const getValue = mapped[key];
  return [...players].sort((a, b) => (direction === "desc" ? getValue(b) - getValue(a) : getValue(a) - getValue(b)));
}

export type LeaderCategory = {
  slug: string;
  label: string;
  short: string;
  unit?: string;
  value: (player: Player) => number;
  formatted?: (player: Player) => string;
  minMinutes?: number;
};

export const LEADER_CATEGORIES: LeaderCategory[] = [
  { slug: "points", label: "أعلى مجموع نقاط", short: "النقاط", value: (player) => player.totalPoints },
  { slug: "form", label: "أفضل فورمة (آخر 5)", short: "الفورمة", value: (player) => player.form },
  { slug: "goals", label: "الهدافون", short: "الأهداف", value: (player) => player.goals },
  { slug: "assists", label: "صنّاع الأهداف", short: "صناعة", value: (player) => player.assists },
  {
    slug: "xgi",
    label: "توقّع المشاركة في الأهداف (xGI)",
    short: "xGI",
    value: (player) => player.expectedGoalInvolvements,
    formatted: (player) => player.expectedGoalInvolvements.toFixed(2),
  },
  { slug: "xg", label: "الأهداف المتوقعة (xG)", short: "xG", value: (player) => player.expectedGoals, formatted: (player) => player.expectedGoals.toFixed(2) },
  { slug: "xa", label: "التمريرات الحاسمة المتوقعة (xA)", short: "xA", value: (player) => player.expectedAssists, formatted: (player) => player.expectedAssists.toFixed(2) },
  { slug: "ics", label: "مؤشر ICT", short: "ICT", value: (player) => player.ict, formatted: (player) => player.ict.toFixed(1) },
  { slug: "bonus", label: "نقاط البونص", short: "بونص", value: (player) => player.bonus },
  { slug: "bps", label: "نقاط BPS", short: "BPS", value: (player) => player.bps },
  { slug: "saves", label: "أكثر حراس تصدّياً", short: "تصديات", value: (player) => player.saves },
  { slug: "clean_sheets", label: "الشباك النظيفة", short: "كلين شيت", value: (player) => player.cleanSheets },
  {
    slug: "value",
    label: "الأفضل قيمة مقابل السعر",
    short: "قيمة/سعر",
    value: (player) => (player.cost > 0 ? player.totalPoints / player.cost : 0),
    formatted: (player) => (player.cost > 0 ? (player.totalPoints / player.cost).toFixed(1) : "0"),
    minMinutes: 180,
  },
  {
    slug: "defcon",
    label: "المساهمة الدفاعية",
    short: "دفاع",
    value: (player) => player.defensiveContribution,
  },
  {
    slug: "transfers",
    label: "أكثر اللاعبين شراءً",
    short: "شراء",
    value: (player) => player.transfersIn,
    formatted: (player) => player.transfersIn.toLocaleString("en-US"),
  },
  { slug: "ownership", label: "الأكثر امتلاكاً", short: "امتلاك", value: (player) => player.selectedBy, formatted: (player) => `${player.selectedBy.toFixed(1)}%` },
];

export function leaderboard(players: Player[], category: LeaderCategory, limit = 15): Player[] {
  const pool = category.minMinutes
    ? players.filter((player) => player.minutes >= category.minMinutes!)
    : players.filter((player) => player.minutes > 0 || player.totalPoints > 0);
  return [...pool].sort((a, b) => category.value(b) - category.value(a)).slice(0, limit);
}

export function nextTeamFixtures(fixtures: Fixture[], teamId: number, fromEvent: number, count = 5): Fixture[] {
  return fixtures
    .filter(
      (fixture) =>
        fixture.event !== null &&
        fixture.event >= fromEvent &&
        (fixture.teamH === teamId || fixture.teamA === teamId),
    )
    .sort((a, b) => (a.event ?? 0) - (b.event ?? 0))
    .slice(0, count);
}

export function fixtureOpponent(fixture: Fixture, teamId: number, teams: Map<number, Team>) {
  const isHome = fixture.teamH === teamId;
  const opponentId = isHome ? fixture.teamA : fixture.teamH;
  return {
    isHome,
    opponent: teams.get(opponentId),
    difficulty: isHome ? fixture.difficultyH : fixture.difficultyA,
  };
}

export function topOwned(players: Player[], limit = 5): Player[] {
  return sortPlayers(
    players.filter((player) => player.minutes > 0),
    "selected",
    "desc",
  ).slice(0, limit);
}

export function dataHints(data: GameData) {
  return {
    current: currentEvent(data.events),
    next: nextEvent(data.events),
    teams: teamMap(data.teams),
    players: playerMap(data.players),
  };
}
