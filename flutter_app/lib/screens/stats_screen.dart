import 'package:flutter/material.dart';

import '../core/models.dart';
import '../core/ui.dart';
import 'player_screen.dart';

class _Category {
  final String label;
  final String short;
  final double Function(FplPlayer) value;
  final String Function(FplPlayer)? format;

  const _Category(this.label, this.short, this.value, [this.format]);
}

class StatsScreen extends StatefulWidget {
  final Bootstrap data;

  const StatsScreen({super.key, required this.data});

  @override
  State<StatsScreen> createState() => _StatsScreenState();
}

class _StatsScreenState extends State<StatsScreen> {
  int _index = 0;

  late final List<_Category> categories = [
    _Category('أعلى مجموع نقاط', 'نقاط', (p) => p.totalPoints.toDouble()),
    _Category('أفضل فورمة', 'فورمة', (p) => p.form),
    _Category('الهدافون', 'أهداف', (p) => p.goals.toDouble()),
    _Category('صنّاع الأهداف', 'صناعة', (p) => p.assists.toDouble()),
    _Category('الأهداف المتوقعة xG', 'xG', (p) => p.xg, (p) => p.xg.toStringAsFixed(2)),
    _Category('الصناعة المتوقعة xA', 'xA', (p) => p.xa, (p) => p.xa.toStringAsFixed(2)),
    _Category('المشاركة في الأهداف xGI', 'xGI', (p) => p.xgi, (p) => p.xgi.toStringAsFixed(2)),
    _Category('مؤشر ICT', 'ICT', (p) => p.ict, (p) => p.ict.toStringAsFixed(1)),
    _Category('نقاط البونص', 'بونص', (p) => p.bonus.toDouble()),
    _Category('نقاط BPS', 'BPS', (p) => p.bps.toDouble()),
    _Category('أكثر تصدياً', 'تصديات', (p) => p.saves.toDouble()),
    _Category('الشباك النظيفة', 'كلين شيت', (p) => p.cleanSheets.toDouble()),
    _Category('المساهمة الدفاعية', 'دفاع', (p) => p.defcon.toDouble()),
    _Category('الأفضل قيمة/سعر', 'قيمة', (p) => p.cost > 0 ? p.totalPoints / p.cost : 0, (p) => (p.totalPoints / p.cost).toStringAsFixed(1)),
    _Category('الأكثر امتلاكاً', 'امتلاك', (p) => p.selected, (p) => '${p.selected.toStringAsFixed(1)}%'),
  ];

  @override
  Widget build(BuildContext context) {
    final category = categories[_index];
    final ranked = widget.data.players.where((player) => player.minutes > 0).toList()
      ..sort((a, b) => category.value(b).compareTo(category.value(a)));
    final top = ranked.take(25).toList();
    final max = top.isEmpty ? 1.0 : category.value(top.first);

    return Column(
      children: [
        SizedBox(
          height: 42,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
            itemCount: categories.length,
            itemBuilder: (context, index) {
              final item = categories[index];
              return Padding(
                padding: const EdgeInsets.only(left: 6),
                child: ChoiceChip(
                  label: Text(item.short),
                  selected: _index == index,
                  onSelected: (_) => setState(() => _index = index),
                ),
              );
            },
          ),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
          child: Row(
            children: [
              Text(category.label, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800)),
              const Spacer(),
              Text('${ranked.length} لاعباً', style: const TextStyle(fontSize: 10, color: AppColors.textMuted)),
            ],
          ),
        ),
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.fromLTRB(12, 2, 12, 24),
            itemCount: top.length,
            itemBuilder: (context, index) {
              final player = top[index];
              final value = category.value(player);
              final display = category.format != null ? category.format!(player) : '${value.toInt()}';
              return Padding(
                padding: const EdgeInsets.only(bottom: 6),
                child: InkWell(
                  borderRadius: BorderRadius.circular(16),
                  onTap: () => Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => PlayerScreen(data: widget.data, player: player)),
                  ),
                  child: AppCard(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                    child: Row(
                      children: [
                        SizedBox(
                          width: 20,
                          child: Text(
                            '${index + 1}',
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: index < 3 ? AppColors.lime : AppColors.textMuted),
                          ),
                        ),
                        PlayerAvatar(player: player, size: 34),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Expanded(
                                    child: Text(player.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                  ),
                                  Text(display, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppColors.lime)),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Row(
                                children: [
                                  TeamBadge(team: widget.data.teamOf(player), size: 13),
                                  const SizedBox(width: 4),
                                  Text(
                                    '${player.teamShort} · ${posArabic(player.position)} · £${money(player.cost)}',
                                    style: const TextStyle(fontSize: 9, color: AppColors.textMuted),
                                  ),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: ClipRRect(
                                      borderRadius: BorderRadius.circular(8),
                                      child: LinearProgressIndicator(
                                        value: max > 0 ? (value / max).clamp(0.0, 1.0) : 0,
                                        minHeight: 4,
                                        backgroundColor: Colors.white10,
                                        valueColor: AlwaysStoppedAnimation(index < 3 ? AppColors.lime : AppColors.violet),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}
