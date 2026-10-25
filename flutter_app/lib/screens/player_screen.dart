import 'package:flutter/material.dart';

import '../core/api.dart';
import '../core/models.dart';
import '../core/ui.dart';

class PlayerScreen extends StatefulWidget {
  final Bootstrap data;
  final FplPlayer player;

  const PlayerScreen({super.key, required this.data, required this.player});

  @override
  State<PlayerScreen> createState() => _PlayerScreenState();
}

class _PlayerScreenState extends State<PlayerScreen> {
  late Future<PlayerSummary> _future;

  @override
  void initState() {
    super.initState();
    _future = FplApi.elementSummary(widget.player.id);
  }

  void _reload() {
    setState(() {
      _future = FplApi.elementSummary(widget.player.id);
    });
  }

  @override
  Widget build(BuildContext context) {
    final player = widget.player;
    final team = widget.data.teamOf(player);
    return Scaffold(
      appBar: AppBar(
        title: Text(player.name, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
      ),
      body: FutureBuilder<PlayerSummary>(
        future: _future,
        builder: (context, snapshot) {
          final summary = snapshot.data;
          final history = [...(summary?.history ?? <PlayerHistoryRow>[])]..sort((a, b) => b.round.compareTo(a.round));
          return ListView(
            padding: const EdgeInsets.fromLTRB(14, 8, 14, 28),
            children: [
              AppCard(
                child: Row(
                  children: [
                    PlayerAvatar(player: player, size: 72),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(player.name, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w900)),
                          const SizedBox(height: 2),
                          Text(player.fullName, style: const TextStyle(fontSize: 10, color: AppColors.textMuted)),
                          const SizedBox(height: 6),
                          Row(
                            children: [
                              TeamBadge(team: team, size: 16),
                              const SizedBox(width: 4),
                              Text('${team?.name ?? player.teamShort}', style: const TextStyle(fontSize: 11, color: Colors.white70)),
                              const SizedBox(width: 6),
                              PositionChip(position: player.position),
                            ],
                          ),
                          const SizedBox(height: 6),
                          Wrap(
                            spacing: 6,
                            runSpacing: 4,
                            children: [
                              Text('£${money(player.cost)}M', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.mint)),
                              Text('${player.totalPoints} نقطة', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                              Text('${player.selected.toStringAsFixed(1)}% امتلاك', style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              if (!player.available && player.news.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: AppCard(
                    color: AppColors.danger.withOpacity(0.12),
                    child: Text(player.news, style: const TextStyle(fontSize: 11, color: AppColors.danger, height: 1.6)),
                  ),
                ),
              const SectionHeader(title: 'إحصاءات الموسم'),
              GridView.count(
                crossAxisCount: 3,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                mainAxisSpacing: 6,
                crossAxisSpacing: 6,
                childAspectRatio: 1.65,
                children: [
                  StatTile(label: 'نقاط', value: '${player.totalPoints}', accent: AppColors.lime),
                  StatTile(label: 'نقاط/مباراة', value: player.ppg.toStringAsFixed(1)),
                  StatTile(label: 'فورمة', value: player.form.toStringAsFixed(1), accent: AppColors.mint),
                  StatTile(label: 'دقائق', value: '${player.minutes}'),
                  StatTile(label: 'أهداف', value: '${player.goals}', accent: AppColors.mint),
                  StatTile(label: 'صناعة', value: '${player.assists}', accent: AppColors.mint),
                  StatTile(label: 'xG', value: player.xg.toStringAsFixed(2)),
                  StatTile(label: 'xA', value: player.xa.toStringAsFixed(2)),
                  StatTile(label: 'xGI', value: player.xgi.toStringAsFixed(2)),
                  StatTile(label: 'ICT', value: player.ict.toStringAsFixed(1)),
                  StatTile(label: 'بونص', value: '${player.bonus}'),
                  StatTile(label: 'BPS', value: '${player.bps}'),
                  StatTile(label: 'شباك نظيفة', value: '${player.cleanSheets}'),
                  StatTile(label: 'تصديات', value: '${player.saves}'),
                  StatTile(label: 'دفاعي', value: '${player.defcon}'),
                ],
              ),
              const SectionHeader(title: 'المباريات القادمة', subtitle: 'صعوبة الخصم (1 سهل — 5 صعب)'),
              AppCard(
                child: Column(
                  children: [
                    if (summary == null && snapshot.connectionState == ConnectionState.waiting)
                      const Padding(padding: EdgeInsets.all(12), child: CircularProgressIndicator(color: AppColors.lime))
                    else if (summary != null && summary.fixtures.isEmpty)
                      const Text('لا مباريات قادمة', style: TextStyle(fontSize: 11, color: AppColors.textMuted)),
                    if (summary != null)
                      for (final fixture in summary.fixtures.take(6))
                        Padding(
                          padding: const EdgeInsets.symmetric(vertical: 4),
                          child: Row(
                            children: [
                              DifficultyPill(difficulty: fixture.difficulty),
                              const SizedBox(width: 6),
                              TeamBadge(team: widget.data.teamsById[fixture.opponent], size: 18),
                              const SizedBox(width: 6),
                              Text(widget.data.teamsById[fixture.opponent]?.short ?? '—', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                              const SizedBox(width: 6),
                              Text(fixture.isHome ? 'على أرضه' : 'خارج الديار', style: const TextStyle(fontSize: 10, color: AppColors.textMuted)),
                              const Spacer(),
                              Text(fixture.eventName, style: const TextStyle(fontSize: 9, color: AppColors.textMuted)),
                            ],
                          ),
                        ),
                  ],
                ),
              ),
              SectionHeader(
                title: 'سجل الجولات',
                subtitle: '${history.length} مباراة هذا الموسم',
                trailing: snapshot.hasError
                    ? TextButton(onPressed: _reload, child: const Text('تحديث', style: TextStyle(fontSize: 11)))
                    : null,
              ),
              AppCard(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                child: Column(
                  children: [
                    if (snapshot.hasError)
                      ErrorBox(message: '${snapshot.error}', onRetry: _reload)
                    else if (history.isEmpty)
                      const Padding(
                        padding: EdgeInsets.all(12),
                        child: Text('لا سجل مباريات بعد', style: TextStyle(fontSize: 11, color: AppColors.textMuted)),
                      )
                    else ...[
                      const Row(
                        children: [
                          SizedBox(width: 34, child: Text('جولة', style: TextStyle(fontSize: 9, color: AppColors.textMuted))),
                          Expanded(child: Text('الخصم', style: TextStyle(fontSize: 9, color: AppColors.textMuted))),
                          SizedBox(width: 26, child: Text('د', textAlign: TextAlign.center, style: TextStyle(fontSize: 9, color: AppColors.textMuted))),
                          SizedBox(width: 26, child: Text('أ', textAlign: TextAlign.center, style: TextStyle(fontSize: 9, color: AppColors.textMuted))),
                          SizedBox(width: 34, child: Text('بونص', textAlign: TextAlign.center, style: TextStyle(fontSize: 9, color: AppColors.textMuted))),
                          SizedBox(width: 40, child: Text('نقاط', textAlign: TextAlign.center, style: TextStyle(fontSize: 9, color: AppColors.textMuted))),
                        ],
                      ),
                      for (final row in history.take(12))
                        Padding(
                          padding: const EdgeInsets.symmetric(vertical: 3),
                          child: Row(
                            children: [
                              SizedBox(width: 34, child: Text('${row.round}', style: const TextStyle(fontSize: 10, color: AppColors.textMuted))),
                              Expanded(
                                child: Row(
                                  children: [
                                    TeamBadge(team: widget.data.teamsById[row.opponent], size: 15),
                                    const SizedBox(width: 4),
                                    Text(
                                      '${widget.data.teamsById[row.opponent]?.short ?? '—'} (${row.wasHome ? 'ض' : 'خ'})',
                                      style: const TextStyle(fontSize: 10),
                                    ),
                                  ],
                                ),
                              ),
                              SizedBox(width: 26, child: Text('${row.minutes}', textAlign: TextAlign.center, style: const TextStyle(fontSize: 10))),
                              SizedBox(width: 26, child: Text('${row.goals + row.assists}', textAlign: TextAlign.center, style: const TextStyle(fontSize: 10))),
                              SizedBox(width: 34, child: Text('${row.bonus}', textAlign: TextAlign.center, style: const TextStyle(fontSize: 10))),
                              SizedBox(
                                width: 40,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(vertical: 2),
                                  decoration: BoxDecoration(
                                    color: row.points >= 6 ? AppColors.lime.withOpacity(0.2) : Colors.white10,
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    '${row.points}',
                                    textAlign: TextAlign.center,
                                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: row.points >= 6 ? AppColors.lime : Colors.white),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                    ],
                  ],
                ),
              ),
              if (summary != null && summary.past.isNotEmpty) ...[
                const SectionHeader(title: 'المواسم السابقة'),
                AppCard(
                  child: Column(
                    children: [
                      for (final season in summary.past.reversed.take(3))
                        Padding(
                          padding: const EdgeInsets.symmetric(vertical: 4),
                          child: Row(
                            children: [
                              SizedBox(width: 70, child: Text(season.season, style: const TextStyle(fontSize: 11, color: AppColors.textMuted))),
                              Text('${season.points} نقطة', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.lime)),
                              const Spacer(),
                              Text('${season.goals} هدف · ${season.assists} صناعة', style: const TextStyle(fontSize: 10, color: AppColors.textMuted)),
                            ],
                          ),
                        ),
                    ],
                  ),
                ),
              ],
              const SizedBox(height: 12),
              Text(
                'آخر تحديث للبيانات: الآن · المصدر الواجهة الرسمية',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 9, color: AppColors.textMuted.withOpacity(0.8)),
              ),
            ],
          );
        },
      ),
    );
  }
}
