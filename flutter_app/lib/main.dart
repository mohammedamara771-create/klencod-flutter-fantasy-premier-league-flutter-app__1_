import 'package:flutter/material.dart';

import 'core/api.dart';
import 'core/models.dart';
import 'core/ui.dart';
import 'screens/fixtures_screen.dart';
import 'screens/home_screen.dart';
import 'screens/players_screen.dart';
import 'screens/stats_screen.dart';
import 'screens/team_screen.dart';

void main() {
  runApp(const FplArenaApp());
}

class FplArenaApp extends StatelessWidget {
  const FplArenaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'فانتازي أرينا',
      debugShowCheckedModeBanner: false,
      theme: buildTheme(),
      locale: const Locale('ar'),
      builder: (context, child) => Directionality(
        textDirection: TextDirection.rtl,
        child: child ?? const SizedBox.shrink(),
      ),
      home: const RootShell(),
    );
  }
}

class RootShell extends StatefulWidget {
  const RootShell({super.key});

  @override
  State<RootShell> createState() => _RootShellState();
}

class _RootShellState extends State<RootShell> {
  int _index = 0;
  late Future<Bootstrap> _future;

  static const List<String> _titles = ['الرئيسية', 'اللاعبون', 'فريقي', 'المباريات', 'الإحصاءات'];

  @override
  void initState() {
    super.initState();
    _future = FplApi.bootstrap();
  }

  void _refresh() {
    setState(() {
      _future = FplApi.bootstrap(force: true);
    });
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<Bootstrap>(
      future: _future,
      builder: (context, snapshot) {
        final data = snapshot.data;
        return Scaffold(
          appBar: AppBar(
            title: Row(
              children: [
                Container(
                  width: 30,
                  height: 30,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(color: AppColors.lime, borderRadius: BorderRadius.circular(10)),
                  child: const Text('⚽', style: TextStyle(fontSize: 15)),
                ),
                const SizedBox(width: 8),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(_titles[_index], style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                    const Text('فانتازي الدوري الإنجليزي · بيانات رسمية', style: TextStyle(fontSize: 9, color: AppColors.textMuted)),
                  ],
                ),
              ],
            ),
            actions: [
              IconButton(
                tooltip: 'تحديث البيانات',
                onPressed: snapshot.connectionState == ConnectionState.waiting ? null : _refresh,
                icon: const Icon(Icons.refresh, size: 20),
              ),
            ],
          ),
          body: data == null
              ? (snapshot.hasError
                  ? ErrorBox(message: '${snapshot.error}', onRetry: _refresh)
                  : const LoadingBox())
              : IndexedStack(
                  index: _index,
                  children: [
                    HomeScreen(data: data),
                    PlayersScreen(data: data),
                    TeamScreen(data: data),
                    FixturesScreen(data: data),
                    StatsScreen(data: data),
                  ],
                ),
          bottomNavigationBar: BottomNavigationBar(
            currentIndex: _index,
            onTap: (value) => setState(() => _index = value),
            items: const [
              BottomNavigationBarItem(icon: Icon(Icons.home_rounded), label: 'الرئيسية'),
              BottomNavigationBarItem(icon: Icon(Icons.people_alt_rounded), label: 'اللاعبون'),
              BottomNavigationBarItem(icon: Icon(Icons.shield_rounded), label: 'فريقي'),
              BottomNavigationBarItem(icon: Icon(Icons.calendar_month_rounded), label: 'المباريات'),
              BottomNavigationBarItem(icon: Icon(Icons.bar_chart_rounded), label: 'الإحصاءات'),
            ],
          ),
        );
      },
    );
  }
}