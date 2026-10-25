// نماذج بيانات فانتازي الدوري الإنجليزي (مطابقة للواجهة الرسمية)
int asInt(dynamic value, [int fallback = 0]) {
  if (value is int) return value;
  if (value is num) return value.toInt();
  if (value is String) return int.tryParse(value) ?? fallback;
  return fallback;
}

double asDouble(dynamic value, [double fallback = 0]) {
  if (value is double) return value;
  if (value is num) return value.toDouble();
  if (value is String) return double.tryParse(value) ?? fallback;
  return fallback;
}

String posCode(int type) {
  if (type == 1) return 'GKP';
  if (type == 2) return 'DEF';
  if (type == 3) return 'MID';
  return 'FWD';
}

String posArabic(String position) {
  switch (position) {
    case 'GKP':
      return 'حارس';
    case 'DEF':
      return 'مدافع';
    case 'MID':
      return 'وسط';
    case 'FWD':
      return 'مهاجم';
    default:
      return position;
  }
}

class Team {
  final int id;
  final String name;
  final String short;
  final int code;
  final int strength;
  final int position;
  final int played;
  final int points;
  final int win;
  final int draw;
  final int loss;
  final String? form;

  const Team({
    required this.id,
    required this.name,
    required this.short,
    required this.code,
    required this.strength,
    required this.position,
    required this.played,
    required this.points,
    required this.win,
    required this.draw,
    required this.loss,
    this.form,
  });

  factory Team.fromJson(Map<String, dynamic> json) {
    return Team(
      id: asInt(json['id']),
      name: '${json['name'] ?? ''}',
      short: '${json['short_name'] ?? ''}',
      code: asInt(json['code']),
      strength: asInt(json['strength'], 3),
      position: asInt(json['position']),
      played: asInt(json['played']),
      points: asInt(json['points']),
      win: asInt(json['win']),
      draw: asInt(json['draw']),
      loss: asInt(json['loss']),
      form: json['form'] as String?,
    );
  }

  String badgeUrl([int size = 50]) =>
      'https://resources.premierleague.com/premierleague/badges/$size/t$code.png';
}

class FplPlayer {
  final int id;
  final String name;
  final String fullName;
  final String photo;
  final int teamId;
  final String teamShort;
  final int teamCode;
  final String position;
  final double cost;
  final double costChangeStart;
  final int totalPoints;
  final int eventPoints;
  final double form;
  final double ppg;
  final int minutes;
  final int goals;
  final int assists;
  final int cleanSheets;
  final int goalsConceded;
  final int saves;
  final int bonus;
  final int bps;
  final double xg;
  final double xa;
  final double xgi;
  final double ict;
  final int defcon;
  final double selected;
  final String status;
  final String news;
  final int chance;
  final int transfersIn;
  final int transfersOut;
  final double valueForm;
  final double valueSeason;
  final double priceChange;
  final int dreamteam;

  const FplPlayer({
    required this.id,
    required this.name,
    required this.fullName,
    required this.photo,
    required this.teamId,
    required this.teamShort,
    required this.teamCode,
    required this.position,
    required this.cost,
    required this.costChangeStart,
    required this.totalPoints,
    required this.eventPoints,
    required this.form,
    required this.ppg,
    required this.minutes,
    required this.goals,
    required this.assists,
    required this.cleanSheets,
    required this.goalsConceded,
    required this.saves,
    required this.bonus,
    required this.bps,
    required this.xg,
    required this.xa,
    required this.xgi,
    required this.ict,
    required this.defcon,
    required this.selected,
    required this.status,
    required this.news,
    required this.chance,
    required this.transfersIn,
    required this.transfersOut,
    required this.valueForm,
    required this.valueSeason,
    required this.priceChange,
    required this.dreamteam,
  });

  factory FplPlayer.fromJson(Map<String, dynamic> json, Map<int, Team> teams) {
    final teamId = asInt(json['team']);
    final team = teams[teamId];
    final photo = '${json['photo'] ?? ''}';
    return FplPlayer(
      id: asInt(json['id']),
      name: '${json['web_name'] ?? ''}',
      fullName: '${json['first_name'] ?? ''} ${json['second_name'] ?? ''}'.trim(),
      photo: photo.isEmpty
          ? ''
          : 'https://resources.premierleague.com/premierleague/photos/players/110x140/p${photo.replaceAll('.jpg', '.png')}',
      teamId: teamId,
      teamShort: team?.short ?? '',
      teamCode: team?.code ?? asInt(json['team_code']),
      position: posCode(asInt(json['element_type'])),
      cost: asDouble(json['now_cost']) / 10,
      costChangeStart: asDouble(json['cost_change_start']) / 10,
      totalPoints: asInt(json['total_points']),
      eventPoints: asInt(json['event_points']),
      form: asDouble(json['form']),
      ppg: asDouble(json['points_per_game']),
      minutes: asInt(json['minutes']),
      goals: asInt(json['goals_scored']),
      assists: asInt(json['assists']),
      cleanSheets: asInt(json['clean_sheets']),
      goalsConceded: asInt(json['goals_conceded']),
      saves: asInt(json['saves']),
      bonus: asInt(json['bonus']),
      bps: asInt(json['bps']),
      xg: asDouble(json['expected_goals']),
      xa: asDouble(json['expected_assists']),
      xgi: asDouble(json['expected_goal_involvements']),
      ict: asDouble(json['ict_index']),
      defcon: asInt(json['defensive_contribution']),
      selected: asDouble(json['selected_by_percent']),
      status: '${json['status'] ?? 'a'}',
      news: '${json['news'] ?? ''}',
      chance: asInt(json['chance_of_playing_next_round'], -1),
      transfersIn: asInt(json['transfers_in']),
      transfersOut: asInt(json['transfers_out']),
      valueForm: asDouble(json['value_form']),
      valueSeason: asDouble(json['value_season']),
      priceChange: asDouble(json['cost_change_event']) / 10,
      dreamteam: asInt(json['dreamteam_count']),
    );
  }

  bool get available => status == 'a';
}

class Gameweek {
  final int id;
  final String name;
  final String deadline;
  final bool finished;
  final bool isCurrent;
  final bool isNext;
  final int averageScore;
  final int highestScore;
  final int rankedCount;
  final int transfersMade;

  const Gameweek({
    required this.id,
    required this.name,
    required this.deadline,
    required this.finished,
    required this.isCurrent,
    required this.isNext,
    required this.averageScore,
    required this.highestScore,
    required this.rankedCount,
    required this.transfersMade,
  });

  factory Gameweek.fromJson(Map<String, dynamic> json) {
    return Gameweek(
      id: asInt(json['id']),
      name: '${json['name'] ?? ''}',
      deadline: '${json['deadline_time'] ?? ''}',
      finished: json['finished'] == true,
      isCurrent: json['is_current'] == true,
      isNext: json['is_next'] == true,
      averageScore: asInt(json['average_entry_score']),
      highestScore: asInt(json['highest_score']),
      rankedCount: asInt(json['ranked_count']),
      transfersMade: asInt(json['transfers_made']),
    );
  }
}

class Bootstrap {
  final List<FplPlayer> players;
  final List<Team> teams;
  final List<Gameweek> events;
  final int totalPlayers;
  final Map<int, Team> teamsById;

  const Bootstrap({
    required this.players,
    required this.teams,
    required this.events,
    required this.totalPlayers,
    required this.teamsById,
  });

  factory Bootstrap.fromJson(Map<String, dynamic> json) {
    final teams = (json['teams'] as List<dynamic>? ?? [])
        .map((item) => Team.fromJson(item as Map<String, dynamic>))
        .toList();
    final teamsById = {for (final team in teams) team.id: team};
    final players = (json['elements'] as List<dynamic>? ?? [])
        .map((item) => FplPlayer.fromJson(item as Map<String, dynamic>, teamsById))
        .toList();
    final events = (json['events'] as List<dynamic>? ?? [])
        .map((item) => Gameweek.fromJson(item as Map<String, dynamic>))
        .toList();
    return Bootstrap(
      players: players,
      teams: teams,
      events: events,
      totalPlayers: asInt(json['total_players']),
      teamsById: teamsById,
    );
  }

  Gameweek? get current => firstWhereOrNull(events, (event) => event.isCurrent);
  Gameweek? get next => firstWhereOrNull(events, (event) => event.isNext);
  Team? teamOf(FplPlayer player) => teamsById[player.teamId];
  FplPlayer? playerById(int id) => firstWhereOrNull(players, (player) => player.id == id);
}

T? firstWhereOrNull<T>(List<T> items, bool Function(T item) test) {
  for (final item in items) {
    if (test(item)) return item;
  }
  return null;
}

class FixtureItem {
  final int id;
  final int? event;
  final String? kickoff;
  final int teamH;
  final int teamA;
  final int? scoreH;
  final int? scoreA;
  final int difficultyH;
  final int difficultyA;
  final bool started;
  final bool finished;

  const FixtureItem({
    required this.id,
    required this.event,
    required this.kickoff,
    required this.teamH,
    required this.teamA,
    required this.scoreH,
    required this.scoreA,
    required this.difficultyH,
    required this.difficultyA,
    required this.started,
    required this.finished,
  });

  factory FixtureItem.fromJson(Map<String, dynamic> json) {
    return FixtureItem(
      id: asInt(json['id']),
      event: json['event'] == null ? null : asInt(json['event']),
      kickoff: json['kickoff_time'] as String?,
      teamH: asInt(json['team_h']),
      teamA: asInt(json['team_a']),
      scoreH: json['team_h_score'] == null ? null : asInt(json['team_h_score']),
      scoreA: json['team_a_score'] == null ? null : asInt(json['team_a_score']),
      difficultyH: asInt(json['team_h_difficulty'], 3),
      difficultyA: asInt(json['team_a_difficulty'], 3),
      started: json['started'] == true,
      finished: json['finished'] == true,
    );
  }
}

class PlayerHistoryRow {
  final int round;
  final int opponent;
  final bool wasHome;
  final int points;
  final int minutes;
  final int goals;
  final int assists;
  final int bonus;
  final int bps;
  final double xg;
  final double xa;
  final double xgi;

  const PlayerHistoryRow({
    required this.round,
    required this.opponent,
    required this.wasHome,
    required this.points,
    required this.minutes,
    required this.goals,
    required this.assists,
    required this.bonus,
    required this.bps,
    required this.xg,
    required this.xa,
    required this.xgi,
  });

  factory PlayerHistoryRow.fromJson(Map<String, dynamic> json) {
    return PlayerHistoryRow(
      round: asInt(json['round']),
      opponent: asInt(json['opponent_team']),
      wasHome: json['was_home'] == true,
      points: asInt(json['total_points']),
      minutes: asInt(json['minutes']),
      goals: asInt(json['goals_scored']),
      assists: asInt(json['assists']),
      bonus: asInt(json['bonus']),
      bps: asInt(json['bps']),
      xg: asDouble(json['expected_goals']),
      xa: asDouble(json['expected_assists']),
      xgi: asDouble(json['expected_goal_involvements']),
    );
  }
}

class PlayerFixtureRow {
  final int id;
  final int? event;
  final int opponent;
  final bool isHome;
  final int difficulty;
  final String eventName;

  const PlayerFixtureRow({
    required this.id,
    required this.event,
    required this.opponent,
    required this.isHome,
    required this.difficulty,
    required this.eventName,
  });

  factory PlayerFixtureRow.fromJson(Map<String, dynamic> json) {
    final isHome = json['is_home'] == true;
    return PlayerFixtureRow(
      id: asInt(json['id']),
      event: json['event'] == null ? null : asInt(json['event']),
      opponent: isHome ? asInt(json['team_a']) : asInt(json['team_h']),
      isHome: isHome,
      difficulty: asInt(json['difficulty'], 3),
      eventName: '${json['event_name'] ?? ''}',
    );
  }
}

class PastSeasonRow {
  final String season;
  final int points;
  final int goals;
  final int assists;
  final int bonus;
  final int minutes;

  const PastSeasonRow({
    required this.season,
    required this.points,
    required this.goals,
    required this.assists,
    required this.bonus,
    required this.minutes,
  });

  factory PastSeasonRow.fromJson(Map<String, dynamic> json) {
    return PastSeasonRow(
      season: '${json['season_name'] ?? ''}',
      points: asInt(json['total_points']),
      goals: asInt(json['goals_scored']),
      assists: asInt(json['assists']),
      bonus: asInt(json['bonus']),
      minutes: asInt(json['minutes']),
    );
  }
}

class PlayerSummary {
  final List<PlayerFixtureRow> fixtures;
  final List<PlayerHistoryRow> history;
  final List<PastSeasonRow> past;

  const PlayerSummary({
    required this.fixtures,
    required this.history,
    required this.past,
  });

  factory PlayerSummary.fromJson(Map<String, dynamic> json) {
    return PlayerSummary(
      fixtures: (json['fixtures'] as List<dynamic>? ?? [])
          .map((item) => PlayerFixtureRow.fromJson(item as Map<String, dynamic>))
          .toList(),
      history: (json['history'] as List<dynamic>? ?? [])
          .map((item) => PlayerHistoryRow.fromJson(item as Map<String, dynamic>))
          .toList(),
      past: (json['history_past'] as List<dynamic>? ?? [])
          .map((item) => PastSeasonRow.fromJson(item as Map<String, dynamic>))
          .toList(),
    );
  }
}

class ManagerInfo {
  final int id;
  final String firstName;
  final String lastName;
  final String teamName;
  final int? overallRank;
  final int? overallPoints;
  final int? eventPoints;
  final double? bank;
  final double? value;
  final int? favouriteTeam;
  final int yearsActive;
  final String region;
  final int? currentEvent;

  const ManagerInfo({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.teamName,
    required this.overallRank,
    required this.overallPoints,
    required this.eventPoints,
    required this.bank,
    required this.value,
    required this.favouriteTeam,
    required this.yearsActive,
    required this.region,
    required this.currentEvent,
  });

  factory ManagerInfo.fromJson(Map<String, dynamic> json) {
    return ManagerInfo(
      id: asInt(json['id']),
      firstName: '${json['player_first_name'] ?? ''}',
      lastName: '${json['player_last_name'] ?? ''}',
      teamName: '${json['name'] ?? ''}',
      overallRank: json['summary_overall_rank'] == null ? null : asInt(json['summary_overall_rank']),
      overallPoints: json['summary_overall_points'] == null ? null : asInt(json['summary_overall_points']),
      eventPoints: json['summary_event_points'] == null ? null : asInt(json['summary_event_points']),
      bank: json['last_deadline_bank'] == null ? null : asDouble(json['last_deadline_bank']) / 10,
      value: json['last_deadline_value'] == null ? null : asDouble(json['last_deadline_value']) / 10,
      favouriteTeam: json['favourite_team'] == null ? null : asInt(json['favourite_team']),
      yearsActive: asInt(json['years_active']),
      region: '${json['player_region_name'] ?? ''}',
      currentEvent: json['current_event'] == null ? null : asInt(json['current_event']),
    );
  }
}

class PickItem {
  final int element;
  final int position;
  final int multiplier;
  final bool isCaptain;
  final bool isVice;

  const PickItem({
    required this.element,
    required this.position,
    required this.multiplier,
    required this.isCaptain,
    required this.isVice,
  });

  factory PickItem.fromJson(Map<String, dynamic> json) {
    return PickItem(
      element: asInt(json['element']),
      position: asInt(json['position']),
      multiplier: asInt(json['multiplier']),
      isCaptain: json['is_captain'] == true,
      isVice: json['is_vice_captain'] == true,
    );
  }
}

class PicksData {
  final String? activeChip;
  final int event;
  final int points;
  final double? bank;
  final double? value;
  final List<PickItem> picks;

  const PicksData({
    required this.activeChip,
    required this.event,
    required this.points,
    required this.bank,
    required this.value,
    required this.picks,
  });

  factory PicksData.fromJson(Map<String, dynamic> json, int event) {
    final history = (json['entry_history'] as Map<String, dynamic>?) ?? const {};
    return PicksData(
      activeChip: json['active_chip'] as String?,
      event: event,
      points: asInt(history['points']),
      bank: history['bank'] == null ? null : asDouble(history['bank']) / 10,
      value: history['value'] == null ? null : asDouble(history['value']) / 10,
      picks: (json['picks'] as List<dynamic>? ?? [])
          .map((item) => PickItem.fromJson(item as Map<String, dynamic>))
          .toList(),
    );
  }
}
