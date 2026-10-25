import 'package:flutter/material.dart';

import '../core/models.dart';
import '../core/ui.dart';
import 'player_screen.dart';

class HomeScreen extends StatelessWidget {
  final Bootstrap data;

  const HomeScreen({super.key, required this.data});

  @override
  Widget build(BuildContext context) {
    final current = data.current;
    final next = data.next;
    final players = data.players;
    final best = [...players]..sort((a, b) => b.totalPoints.compareTo(a.totalPoints));
    final form = players.where((player) => player.minutes >= 180).toList()
      ..sort((a, b) => b.form.compareTo(a.form));
    final risers = players.where((player) => player.priceChange > 0).toList()
      ..sort((a, b) => b.priceChange.compareTo(a.priceChange));
    final fallers = players.where((player) => player.priceChange < 0).toList()
      ..sort((a, b) => a.priceChange.compareTo(b.priceChange));

    return ListView(
      padding: const EdgeInsets.fromLTRB(14, 10, 14, 24),
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(24),
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [AppColors.violet.withOpacity(0.45), AppColors.card, AppColors.bg],
            ),
            border: Border.all(color: Colors.white.withOpacity(0.08)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Text('⚽', style: TextStyle(fontSize: 22)),
                  const SizedBox(width: 8),
                  const Expanded(
                    child: Text('فانتازي أرينا', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Colors.white)),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(color: AppColors.lime.withOpacity(0.15), borderRadius: BorderRadius.circular(20)),
                    child: const Text('بيانات رسمية', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: AppColors.lime)),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Text(
                '${current?.name ?? 'الجولة الحالية'} · ${compactNumber(data.totalPlayers)} مدير مسجّل',
                style: const TextStyle(fontSize: 12, color: Colors.white70),
              ),
              const SizedBox(height: 4),
              Text(
                'الموعد النهائي: ${formatDateTime(next?.deadline ?? current?.deadline)}',
                style: const TextStyle(fontSize: 10, color: AppColors.textMuted),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(child: StatTile(label: 'متوسط الجولة', value: '${current?.averageScore ?? 0}', accent: AppColors.lime)),
                  const SizedBox(width: 8),
                  Expanded(child: StatTile(label: 'أعلى نتيجة', value: '${current?.highestScore ?? 0}')),
                  const SizedBox(width: 8),
                  Expanded(child: StatTile(label: 'لاعبون', value: '${data.players.length}', accent: AppColors.mint)),
                ],
              ),
            ],
          ),
        ),
        const SectionHeader(title: 'أفضل اللاعبين هذا الموسم', subtitle: 'حسب مجموع النقاط من الواجهة الرسمية'),
        AppCard(
          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
          child: Column(
            children: [
              for (var index = 0; index < 6 && index < best.length; index++)
                PlayerRowTile(
                  player: best[index],
                  rank: index + 1,
                  team: data.teamOf(best[index]),
                  onTap: () => Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => PlayerScreen(data: data, player: best[index]),
                    ),
                  ),
                ),
            ],
          ),
        ),
        const SectionHeader(title: 'أعلى فورمة', subtitle: 'متوسط النقاط في آخر 5 مباريات'),
        AppCard(
          child: Column(
            children: [
              for (final player in form.take(5))
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 5),
                  child: Row(
                    children: [
                      SizedBox(
                        width: 34,
                        child: Text(player.form.toStringAsFixed(1), style: const TextStyle(color: AppColors.lime, fontWeight: FontWeight.bold, fontSize: 12)),
                      ),
                      Expanded(
                        child: Text(player.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                      ),
                      Text(player.teamShort, style: const TextStyle(fontSize: 10, color: AppColors.textMuted)),
                      const SizedBox(width: 8),
                      Text('£${money(player.cost)}', style: const TextStyle(fontSize: 10, color: AppColors.mint)),
                    ],
                  ),
                ),
            ],
          ),
        ),
        Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SectionHeader(title: 'أسعار ترتفع ▲'),
                  AppCard(
                    child: Column(
                      children: [
                        for (final player in risers.take(4))
                          Padding(
                            padding: const EdgeInsets.symmetric(vertical: 4),
                            child: Row(
                              children: [
                                Expanded(child: Text(player.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 11))),
                                Text('+${player.priceChange.toStringAsFixed(1)}', style: const TextStyle(fontSize: 10, color: AppColors.mint, fontWeight: FontWeight.bold)),
                              ],
                            ),
                          ),
                        if (risers.isEmpty) const Text('لا تغييرات', style: TextStyle(fontSize: 10, color: AppColors.textMuted)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SectionHeader(title: 'أسعار تنخفض ▼'),
                  AppCard(
                    child: Column(
                      children: [
                        for (final player in fallers.take(4))
                          Padding(
                            padding: const EdgeInsets.symmetric(vertical: 4),
                            child: Row(
                              children: [
                                Expanded(child: Text(player.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 11))),
                                Text(player.priceChange.toStringAsFixed(1), style: const TextStyle(fontSize: 10, color: AppColors.danger, fontWeight: FontWeight.bold)),
                              ],
                            ),
                          ),
                        if (fallers.isEmpty) const Text('لا تغييرات', style: TextStyle(fontSize: 10, color: AppColors.textMuted)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        const SectionHeader(title: 'أشهر اللاعبين امتلاكاً'),
        AppCard(
          child: Column(
            children: [
              for (final player in ([...players]..sort((a, b) => b.selected.compareTo(a.selected))).take(5))
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 5),
                  child: Column(
                    children: [
                      Row(
                        children: [
                          Expanded(child: Text(player.name, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold))),
                          Text('${player.selected.toStringAsFixed(1)}%', style: const TextStyle(fontSize: 10, color: AppColors.mint, fontWeight: FontWeight.bold)),
                        ],
                      ),
                      const SizedBox(height: 4),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(10),
                        child: LinearProgressIndicator(
                          value: (player.selected / 100).clamp(0.0, 1.0),
                          minHeight: 5,
                          backgroundColor: Colors.white10,
                          valueColor: const AlwaysStoppedAnimation(AppColors.mint),
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
        ),
        const SizedBox(height: 14),
        const Text(
          'المصدر: fantasy.premierleague.com/api — تطبيق غير تابع رسمياً للفانتازي.',
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 9, color: AppColors.textMuted, height: 1.6),
        ),
      ],
    );
  }
}
