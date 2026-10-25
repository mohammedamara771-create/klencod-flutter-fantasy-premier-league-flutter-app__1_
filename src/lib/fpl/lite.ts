import type { Player, Team } from "./types";

export type PlayerLite = {
  id: number;
  name: string;
  photo: string | null;
  team: string;
  teamCode: number;
  position: string;
  cost: number;
  points: number;
  eventPoints: number;
  form: number;
  ppg: number;
  minutes: number;
  selected: number;
  goals: number;
  assists: number;
  cleanSheets: number;
  bonus: number;
  bps: number;
  xg: number;
  xa: number;
  xgi: number;
  defcon: number;
  saves: number;
  ict: number;
  value: number;
  status: string;
  chance: number | null;
  priceChange: number;
};

export type TeamLite = {
  id: number;
  name: string;
  short: string;
  code: number;
};

export function toPlayerLite(player: Player): PlayerLite {
  return {
    id: player.id,
    name: player.webName,
    photo: player.photo,
    team: player.teamShort,
    teamCode: player.teamCode,
    position: player.position,
    cost: player.cost,
    points: player.totalPoints,
    eventPoints: player.eventPoints,
    form: player.form,
    ppg: player.pointsPerGame,
    minutes: player.minutes,
    selected: player.selectedBy,
    goals: player.goals,
    assists: player.assists,
    cleanSheets: player.cleanSheets,
    bonus: player.bonus,
    bps: player.bps,
    xg: player.expectedGoals,
    xa: player.expectedAssists,
    xgi: player.expectedGoalInvolvements,
    defcon: player.defensiveContribution,
    saves: player.saves,
    ict: player.ict,
    value: player.valueSeason,
    status: player.status,
    chance: player.chanceNext,
    priceChange: player.costChangeEvent,
  };
}

export function toTeamLite(teams: Team[]): TeamLite[] {
  return teams.map((team) => ({ id: team.id, name: team.name, short: team.shortName, code: team.code }));
}
