export type Position = "GKP" | "DEF" | "MID" | "FWD";

export type Team = {
  id: number;
  code: number;
  name: string;
  shortName: string;
  position: number;
  played: number;
  win: number;
  draw: number;
  loss: number;
  points: number;
  strength: number;
  form: string | null;
  attackHome: number;
  attackAway: number;
  defenceHome: number;
  defenceAway: number;
};

export type Event = {
  id: number;
  name: string;
  deadline: string;
  released: boolean;
  finished: boolean;
  isCurrent: boolean;
  isNext: boolean;
  isPrevious: boolean;
  averageScore: number;
  highestScore: number;
  rankedCount: number;
  transfersMade: number;
  mostSelected: number | null;
  mostTransferredIn: number | null;
  mostCaptained: number | null;
  topElement: number | null;
  topElementPoints: number | null;
  chipPlays: { name: string; plays: number }[];
};

export type Player = {
  id: number;
  code: number;
  firstName: string;
  secondName: string;
  webName: string;
  photo: string | null;
  teamId: number;
  teamCode: number;
  teamShort: string;
  position: Position;
  elementType: number;
  cost: number;
  costChangeStart: number;
  costChangeEvent: number;
  totalPoints: number;
  eventPoints: number;
  form: number;
  pointsPerGame: number;
  minutes: number;
  starts: number;
  goals: number;
  assists: number;
  cleanSheets: number;
  goalsConceded: number;
  saves: number;
  bonus: number;
  bps: number;
  ict: number;
  influence: number;
  creativity: number;
  threat: number;
  expectedGoals: number;
  expectedAssists: number;
  expectedGoalInvolvements: number;
  expectedGoalsConceded: number;
  xgPer90: number;
  xaPer90: number;
  xgiPer90: number;
  defensiveContribution: number;
  defConPer90: number;
  selectedBy: number;
  transfersIn: number;
  transfersOut: number;
  transfersInEvent: number;
  transfersOutEvent: number;
  valueForm: number;
  valueSeason: number;
  status: string;
  news: string;
  chanceNext: number | null;
  dreamteam: number;
  yellowCards: number;
  redCards: number;
  penaltiesSaved: number;
  penaltiesMissed: number;
  ownGoals: number;
  priceChangePercent: number;
};

export type GameData = {
  players: Player[];
  teams: Team[];
  events: Event[];
  totalPlayers: number;
  updatedAt: string;
  source: "live" | "cache";
};

export type Fixture = {
  id: number;
  event: number | null;
  kickoff: string | null;
  started: boolean;
  finished: boolean;
  teamH: number;
  teamA: number;
  scoreH: number | null;
  scoreA: number | null;
  difficultyH: number;
  difficultyA: number;
  scorers: { element: number; side: "h" | "a"; goals: number; assists: number }[];
};

export type PlayerFixture = {
  id: number;
  event: number | null;
  eventName: string;
  kickoff: string | null;
  opponent: number;
  isHome: boolean;
  difficulty: number;
  finished: boolean;
};

export type HistoryRow = {
  round: number;
  fixture: number;
  opponent: number;
  wasHome: boolean;
  kickoff: string | null;
  scoreH: number | null;
  scoreA: number | null;
  points: number;
  minutes: number;
  goals: number;
  assists: number;
  cleanSheets: number;
  goalsConceded: number;
  saves: number;
  bonus: number;
  bps: number;
  expectedGoals: number;
  expectedAssists: number;
  expectedGoalInvolvements: number;
  value: number;
};

export type PastSeason = {
  season: string;
  startCost: number;
  endCost: number;
  points: number;
  minutes: number;
  goals: number;
  assists: number;
  cleanSheets: number;
  bonus: number;
  expectedGoalInvolvements: number;
};

export type ManagerInfo = {
  id: number;
  firstName: string;
  lastName: string;
  teamName: string;
  favouriteTeam: number | null;
  startedEvent: number | null;
  yearsActive: number;
  regionName: string;
  currentEvent: number | null;
  summaryOverallRank: number | null;
  summaryOverallPoints: number | null;
  summaryEventPoints: number | null;
  summaryBank: number | null;
  summaryValue: number | null;
  favouriteLeague: { id: number; name: string; rank: number | null; total: number | null } | null;
};

export type PicksData = {
  activeChip: string | null;
  event: number;
  points: number;
  rank: number | null;
  bank: number | null;
  value: number | null;
  picks: {
    element: number;
    position: number;
    multiplier: number;
    isCaptain: boolean;
    isVice: boolean;
  }[];
};

export type HistorySeason = {
  event: number;
  points: number;
  totalPoints: number;
  rank: number | null;
  overallRank: number | null;
  bank: number | null;
  value: number | null;
  transfers: number;
  transfersCost: number;
  chip: string | null;
};

export type LeagueStanding = {
  rank: number;
  entry: number;
  entryName: string;
  playerName: string;
  eventPoints: number;
  total: number;
};

export type LeagueInfo = {
  id: number;
  name: string;
  created: string | null;
  leagueType: string;
  hasNext: boolean;
  page: number;
  standings: LeagueStanding[];
};

export type RawElement = {
  id: number;
  code: number;
  first_name: string;
  second_name: string;
  web_name: string;
  photo: string;
  team: number;
  team_code: number;
  element_type: number;
  now_cost: number;
  cost_change_start: number;
  cost_change_event: number;
  total_points: number;
  event_points: number;
  form: string;
  points_per_game: string;
  minutes: number;
  starts: number;
  goals_scored: number;
  assists: number;
  clean_sheets: number;
  goals_conceded: number;
  saves: number;
  bonus: number;
  bps: number;
  ict_index: string;
  influence: string;
  creativity: string;
  threat: string;
  expected_goals: string;
  expected_assists: string;
  expected_goal_involvements: string;
  expected_goals_conceded: string;
  expected_goals_per_90: string;
  expected_assists_per_90: string;
  expected_goal_involvements_per_90: string;
  defensive_contribution: number;
  defensive_contribution_per_90: string;
  selected_by_percent: string;
  transfers_in: number;
  transfers_out: number;
  transfers_in_event: number;
  transfers_out_event: number;
  value_form: string;
  value_season: string;
  status: string;
  news: string;
  chance_of_playing_next_round: number | null;
  dreamteam_count: number;
  yellow_cards: number;
  red_cards: number;
  penalties_saved: number;
  penalties_missed: number;
  own_goals: number;
  price_change_percent: string;
};

export type RawBootstrap = {
  elements: RawElement[];
  teams: {
    id: number;
    code: number;
    name: string;
    short_name: string;
    position: number;
    played: number;
    win: number;
    draw: number;
    loss: number;
    points: number;
    strength: number | null;
    form: string | null;
    strength_attack_home: number;
    strength_attack_away: number;
    strength_defence_home: number;
    strength_defence_away: number;
  }[];
  events: {
    id: number;
    name: string;
    deadline_time: string;
    released: boolean;
    finished: boolean;
    is_current: boolean;
    is_next: boolean;
    is_previous: boolean;
    average_entry_score: number;
    highest_score: number;
    ranked_count: number;
    transfers_made: number;
    most_selected: number | null;
    most_transferred_in: number | null;
    most_captained: number | null;
    top_element: number | null;
    top_element_info: { id: number; points: number } | null;
    chip_plays: { chip_name: string; num_played: number }[];
  }[];
  total_players: number;
  season: string;
};

export type RawFixture = {
  id: number;
  event: number | null;
  kickoff_time: string | null;
  started: boolean;
  finished: boolean;
  team_h: number;
  team_a: number;
  team_h_score: number | null;
  team_a_score: number | null;
  team_h_difficulty: number;
  team_a_difficulty: number;
  stats?: {
    identifier: string;
    h: { value: number; element: number }[];
    a: { value: number; element: number }[];
  }[];
};
