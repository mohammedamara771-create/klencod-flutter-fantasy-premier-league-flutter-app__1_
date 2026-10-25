import 'package:flutter/material.dart';

import '../core/api.dart';
import '../core/models.dart';
import '../core/ui.dart';

class TeamScreen extends StatefulWidget {
  final Bootstrap data;

  const TeamScreen({super.key, required this.data});

  @override
  State<TeamScreen> createState() => _TeamScreenState();
}

class _TeamScreenState extends State<TeamScreen> {
  final TextEditingController _controller = TextEditingController();
  Future<_TeamPayload>? _future;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _load() {
    final entryId = int.tryParse(_controller.text.trim());
    if (entryId == null || entryId <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('أدخل رقم مدير صحيح (Entry ID)')),
      );
      return;
    }
    final event = widget.data.current?.id ?? widget.data.next?.id ?? 1;
    setState(() {
      _future = _loadPayload(entryId, event);
    });
  }

  Future<_TeamPayload> _loadPayload(int entryId, int event) async {
    final info = await FplApi.entry(entryId);
    final picks = await FplApi.latestPicks(entryId, event);
    return _TeamPayload(info: info, picks: picks);
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(14, 10, 14, 28),
      children: [
        AppCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('تابع فريقك', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800)),
              const SizedBox(height: 2),
              const Text(
                'اكتب رقم المدير (Entry ID) من رابط فريقك في موقع الفانتازي',
                style: TextStyle(fontSize: 10, color: AppColors.textMuted),
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _controller,
                      keyboardType: TextInputType.number,
                      textDirection: TextDirection.ltr,
                      onSubmitted: (_) => _load(),
                      decoration: const InputDecoration(hintText: 'مثال: 1234567'),
                    ),
                  ),
                  const SizedBox(width: 8),
                  FilledButton(
                    style: FilledButton.styleFrom(backgroundColor: AppColors.lime, foregroundColor: Colors.black, padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14)),
                    onPressed: _load,
                    child: const Text('عرض', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ],
          ),
        ),
        if (_future == null)
          const Padding(
            padding: EdgeInsets.only(top: 30),
            child: ErrorBox(message: 'أدخل رقم المدير ثم اضغط «عرض» لعرض الترتيب والتشكيلة وكل الإحصاءات.'),
          )
        else
          FutureBuilder<_TeamPayload>(
            future: _future,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) return const LoadingBox();
              if (snapshot.hasError) {
                return ErrorBox(message: '${snapshot.error}', onRetry: _load);
              }
              final payload = snapshot.data;
              if (payload == null) return const ErrorBox(message: 'لا بيانات');
              final info = payload.info;
              final picks = payload.picks;
              final starting = picks?.picks.where((pick) => pick.position <= 11).toList() ?? [];
              final bench = picks?.picks.where((pick) => pick.position > 11).toList() ?? [];

              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 12),
                  AppCard(
                    color: AppColors.violet.withOpacity(0.18),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(info.teamName, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w900)),
                        const SizedBox(height: 2),
                        Text(
                          '${info.firstName} ${info.lastName} · #${info.id}${info.region.isEmpty ? '' : ' · ${info.region}'}',
                          style: const TextStyle(fontSize: 10, color: AppColors.textMuted),
                        ),
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            Expanded(child: StatTile(label: 'الترتيب العام', value: info.overallRank == null ? '—' : formatNumber(info.overallRank!), accent: AppColors.lime)),
                            const SizedBox(width: 6),
                            Expanded(child: StatTile(label: 'مجموع النقاط', value: info.overallPoints == null ? '—' : '${info.overallPoints}')),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Row(
                          children: [
                            Expanded(child: StatTile(label: 'نقاط الجولة', value: picks == null ? '—' : '${picks.points}', accent: AppColors.mint)),
                            const SizedBox(width: 6),
                            Expanded(child: StatTile(label: 'قيمة الفريق', value: picks?.value == null ? '—' : '£${money(picks!.value!)}M')),
                            const SizedBox(width: 6),
                            Expanded(child: StatTile(label: 'البنك', value: picks?.bank == null ? '—' : '£${money(picks!.bank!)}M')),
                          ],
                        ),
                      ],
                    ),
                  ),
                  SectionHeader(title: 'التشكيلة الأساسية', subtitle: picks == null ? 'لا تشكيلة متاحة لهذه الجولة' : 'GW${picks.event}'),
                  if (starting.isEmpty)
                    const AppCard(child: Text('لم يتم العثور على تشكيلة لهذه الجولة.', style: TextStyle(fontSize: 11, color: AppColors.textMuted)))
                  else
                    AppCard(
                      child: Column(
                        children: [
                          for (final pick in starting)
                            Builder(
                              builder: (context) {
                                final player = widget.data.playerById(pick.element);
                                if (player == null) return const SizedBox.shrink();
                                return Padding(
                                  padding: const EdgeInsets.symmetric(vertical: 3),
                                  child: Row(
                                    children: [
                                      PositionChip(position: player.position),
                                      const SizedBox(width: 6),
                                      Expanded(
                                        child: Text(
                                          '${player.name}${pick.isCaptain ? ' ©' : pick.isVice ? ' Ⓥ' : ''}',
                                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                                        ),
                                      ),
                                      Text(player.teamShort, style: const TextStyle(fontSize: 10, color: AppColors.textMuted)),
                                      const SizedBox(width: 8),
                                      Text('${player.eventPoints * pick.multiplier}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.lime)),
                                    ],
                                  ),
                                );
                              },
                            ),
                        ],
                      ),
                    ),
                  if (bench.isNotEmpty) ...[
                    const SectionHeader(title: 'دكة البدلاء'),
                    AppCard(
                      child: Wrap(
                        spacing: 8,
                        runSpacing: 6,
                        children: [
                          for (final pick in bench)
                            Builder(builder: (context) {
                              final player = widget.data.playerById(pick.element);
                              if (player == null) return const SizedBox.shrink();
                              return Chip(
                                label: Text('${player.name} · ${player.eventPoints}', style: const TextStyle(fontSize: 10)),
                              );
                            }),
                        ],
                      ),
                    ),
                  ],
                ],
              );
            },
          ),
      ],
    );
  }
}

class _TeamPayload {
  final ManagerInfo info;
  final PicksData? picks;

  const _TeamPayload({required this.info, this.picks});
}
