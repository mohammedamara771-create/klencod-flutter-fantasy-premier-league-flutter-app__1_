import 'package:flutter/material.dart';

import '../core/api.dart';
import '../core/models.dart';
import '../core/ui.dart';

class FixturesScreen extends StatefulWidget {
  final Bootstrap data;

  const FixturesScreen({super.key, required this.data});

  @override
  State<FixturesScreen> createState() => _FixturesScreenState();
}

class _FixturesScreenState extends State<FixturesScreen> {
  late Future<List<FixtureItem>> _future;
  late int _event;

  @override
  void initState() {
    super.initState();
    _event = widget.data.next?.id ?? widget.data.current?.id ?? 1;
    _future = FplApi.fixtures();
  }

  void _reload() {
    setState(() {
      _future = FplApi.fixtures();
    });
  }

  @override
  Widget build(BuildContext context) {
    final events = widget.data.events.where((event) => event.released).toList();
    return FutureBuilder<List<FixtureItem>>(
      future: _future,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) return const LoadingBox();
        if (snapshot.hasError) return ErrorBox(message: '${snapshot.error}', onRetry: _reload);
        final all = snapshot.data ?? <FixtureItem>[];
        final list = all.where((fixture) => fixture.event == _event).toList()
          ..sort((a, b) => (a.kickoff ?? '').compareTo(b.kickoff ?? ''));

        return Column(
          children: [
            SizedBox(
              height: 44,
              child: ListView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                children: [
                  for (final event in events)
                    Padding(
                      padding: const EdgeInsets.only(left: 6),
                      child: ChoiceChip(
                        label: Text('GW${event.id}'),
                        selected: _event == event.id,
                        onSelected: (_) => setState(() => _event = event.id),
                      ),
                    ),
                ],
              ),
            ),
            Expanded(
              child: list.isEmpty
                  ? const ErrorBox(message: 'لا مباريات في هذه الجولة')
                  : ListView(
                      padding: const EdgeInsets.fromLTRB(12, 4, 12, 24),
                      children: [
                        for (final fixture in list) _FixtureCard(fixture: fixture, data: widget.data),
                        const SizedBox(height: 10),
                        const Text(
                          'صعوبة المباراة (FDR): 1 سهل — 5 صعب',
                          textAlign: TextAlign.center,
                          style: TextStyle(fontSize: 9, color: AppColors.textMuted),
                        ),
                      ],
                    ),
            ),
          ],
        );
      },
    );
  }
}

class _FixtureCard extends StatelessWidget {
  final FixtureItem fixture;
  final Bootstrap data;

  const _FixtureCard({required this.fixture, required this.data});

  @override
  Widget build(BuildContext context) {
    final home = data.teamsById[fixture.teamH];
    final away = data.teamsById[fixture.teamA];
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: AppCard(
        child: Row(
          children: [
            Expanded(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Text(home?.name ?? '', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                  const SizedBox(width: 4),
                  TeamBadge(team: home, size: 20),
                  const SizedBox(width: 4),
                  DifficultyPill(difficulty: fixture.difficultyH),
                ],
              ),
            ),
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 8),
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(color: Colors.black.withOpacity(0.35), borderRadius: BorderRadius.circular(8)),
              child: Text(
                fixture.started ? '${fixture.scoreH ?? 0} - ${fixture.scoreA ?? 0}' : 'VS',
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900),
              ),
            ),
            Expanded(
              child: Row(
                children: [
                  DifficultyPill(difficulty: fixture.difficultyA),
                  const SizedBox(width: 4),
                  TeamBadge(team: away, size: 20),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(away?.name ?? '', maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
