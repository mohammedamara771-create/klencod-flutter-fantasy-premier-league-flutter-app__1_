import 'package:flutter/material.dart';

import '../core/models.dart';
import '../core/ui.dart';
import 'player_screen.dart';

class PlayersScreen extends StatefulWidget {
  final Bootstrap data;

  const PlayersScreen({super.key, required this.data});

  @override
  State<PlayersScreen> createState() => _PlayersScreenState();
}

class _PlayersScreenState extends State<PlayersScreen> {
  final TextEditingController _search = TextEditingController();
  String _position = 'ALL';
  String _sort = 'points';
  bool _availableOnly = false;
  double _maxPrice = 16;

  static const Map<String, String> _sortLabels = {
    'points': 'النقاط',
    'form': 'الفورمة',
    'goals': 'الأهداف',
    'assists': 'الصناعة',
    'xgi': 'xGI',
    'cost': 'السعر (الأرخص)',
    'selected': 'الامتلاك',
    'ppg': 'نقاط/مباراة',
    'value': 'القيمة',
  };

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  List<FplPlayer> _filtered() {
    final query = _search.text.trim().toLowerCase();
    final list = widget.data.players.where((player) {
      if (_position != 'ALL' && player.position != _position) return false;
      if (player.cost > _maxPrice) return false;
      if (_availableOnly && !player.available) return false;
      if (query.isEmpty) return true;
      return player.name.toLowerCase().contains(query) || player.teamShort.toLowerCase().contains(query);
    }).toList();

    int compare(FplPlayer a, FplPlayer b) {
      switch (_sort) {
        case 'form':
          return b.form.compareTo(a.form);
        case 'goals':
          return b.goals.compareTo(a.goals);
        case 'assists':
          return b.assists.compareTo(a.assists);
        case 'xgi':
          return b.xgi.compareTo(a.xgi);
        case 'cost':
          return a.cost.compareTo(b.cost);
        case 'selected':
          return b.selected.compareTo(a.selected);
        case 'ppg':
          return b.ppg.compareTo(a.ppg);
        case 'value':
          return b.valueSeason.compareTo(a.valueSeason);
        default:
          return b.totalPoints.compareTo(a.totalPoints);
      }
    }

    list.sort(compare);
    return list;
  }

  @override
  Widget build(BuildContext context) {
    final players = _filtered();
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(14, 10, 14, 6),
          child: Column(
            children: [
              TextField(
                controller: _search,
                onChanged: (_) => setState(() {}),
                style: const TextStyle(fontSize: 13),
                decoration: InputDecoration(
                  hintText: 'ابحث باسم اللاعب أو النادي…',
                  prefixIcon: const Icon(Icons.search, size: 18, color: AppColors.textMuted),
                  suffixIcon: _search.text.isEmpty
                      ? null
                      : IconButton(
                          icon: const Icon(Icons.close, size: 16),
                          onPressed: () {
                            _search.clear();
                            setState(() {});
                          },
                        ),
                ),
              ),
              const SizedBox(height: 8),
              SizedBox(
                height: 32,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  children: [
                    for (final item in const [
                      ['ALL', 'الكل'],
                      ['GKP', 'حراس'],
                      ['DEF', 'دفاع'],
                      ['MID', 'وسط'],
                      ['FWD', 'هجوم'],
                    ])
                      Padding(
                        padding: const EdgeInsets.only(left: 6),
                        child: ChoiceChip(
                          label: Text(item[1]),
                          selected: _position == item[0],
                          onSelected: (_) => setState(() => _position = item[0]),
                        ),
                      ),
                  ],
                ),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: DropdownButtonFormField<String>(
                      value: _sort,
                      dropdownColor: AppColors.card,
                      style: const TextStyle(fontSize: 11, color: Colors.white),
                      decoration: const InputDecoration(contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 6)),
                      items: _sortLabels.entries
                          .map((entry) => DropdownMenuItem(value: entry.key, child: Text('ترتيب: ${entry.value}')))
                          .toList(),
                      onChanged: (value) => setState(() => _sort = value ?? 'points'),
                    ),
                  ),
                  const SizedBox(width: 8),
                  FilterChip(
                    label: const Text('متاح'),
                    selected: _availableOnly,
                    onSelected: (value) => setState(() => _availableOnly = value),
                  ),
                ],
              ),
              Row(
                children: [
                  const Text('السعر ≤', style: TextStyle(fontSize: 10, color: AppColors.textMuted)),
                  Expanded(
                    child: Slider(
                      value: _maxPrice,
                      min: 4,
                      max: 16,
                      divisions: 24,
                      activeColor: AppColors.lime,
                      label: '£${_maxPrice.toStringAsFixed(1)}',
                      onChanged: (value) => setState(() => _maxPrice = value),
                    ),
                  ),
                  Text('£${_maxPrice.toStringAsFixed(1)}', style: const TextStyle(fontSize: 11, color: AppColors.mint, fontWeight: FontWeight.bold)),
                ],
              ),
              Align(
                alignment: Alignment.centerRight,
                child: Text('${players.length} لاعباً مطابقاً', style: const TextStyle(fontSize: 10, color: AppColors.textMuted)),
              ),
            ],
          ),
        ),
        Expanded(
          child: players.isEmpty
              ? const ErrorBox(message: 'لا يوجد لاعبون مطابقون للفلاتر الحالية')
              : ListView.separated(
                  padding: const EdgeInsets.fromLTRB(12, 4, 12, 24),
                  itemCount: players.length,
                  separatorBuilder: (_, __) => Divider(color: Colors.white.withOpacity(0.05), height: 1),
                  itemBuilder: (context, index) {
                    final player = players[index];
                    return PlayerRowTile(
                      player: player,
                      team: widget.data.teamOf(player),
                      metric: _sort == 'cost' ? '£${money(player.cost)}' : null,
                      metricLabel: _sort == 'cost' ? 'السعر' : null,
                      onTap: () => Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => PlayerScreen(data: widget.data, player: player)),
                      ),
                    );
                  },
                ),
        ),
      ],
    );
  }
}
