import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import 'models.dart';

class AppColors {
  static const Color bg = Color(0xFF07060F);
  static const Color surface = Color(0xFF141121);
  static const Color card = Color(0xFF1B1730);
  static const Color lime = Color(0xFFC8FF3D);
  static const Color mint = Color(0xFF37F5B2);
  static const Color violet = Color(0xFF7C5CFF);
  static const Color danger = Color(0xFFFF6B81);
  static const Color textMuted = Color(0xFF9A96B4);
}

ThemeData buildTheme() {
  final scheme = ColorScheme.fromSeed(
    seedColor: AppColors.lime,
    brightness: Brightness.dark,
    primary: AppColors.lime,
    secondary: AppColors.mint,
    surface: AppColors.surface,
  );
  return ThemeData(
    useMaterial3: true,
    colorScheme: scheme,
    scaffoldBackgroundColor: AppColors.bg,
    fontFamily: 'Roboto',
    appBarTheme: const AppBarTheme(
      backgroundColor: Colors.transparent,
      elevation: 0,
      centerTitle: false,
      foregroundColor: Colors.white,
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: Colors.white.withOpacity(0.05),
      hintStyle: TextStyle(color: Colors.white.withOpacity(0.35), fontSize: 13),
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: BorderSide(color: Colors.white.withOpacity(0.08)),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: BorderSide(color: Colors.white.withOpacity(0.08)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(color: AppColors.lime),
      ),
    ),
    chipTheme: ChipThemeData(
      backgroundColor: Colors.white.withOpacity(0.05),
      selectedColor: AppColors.lime,
      labelStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white),
      secondaryLabelStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.black),
      side: BorderSide.none,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
    ),
    dividerTheme: DividerThemeData(color: Colors.white.withOpacity(0.06), thickness: 1),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: AppColors.surface,
      selectedItemColor: AppColors.lime,
      unselectedItemColor: AppColors.textMuted,
      type: BottomNavigationBarType.fixed,
      showUnselectedLabels: true,
      selectedLabelStyle: TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
      unselectedLabelStyle: TextStyle(fontSize: 10),
    ),
  );
}

String money(double value) => value.toStringAsFixed(1);

String formatNumber(int value) => NumberFormat.decimalPattern('en').format(value);

String compactNumber(int value) {
  if (value >= 1000000) return '${(value / 1000000).toStringAsFixed(2)}M';
  if (value >= 1000) return '${(value / 1000).toStringAsFixed(1)}K';
  return '$value';
}

String formatDateTime(String? iso) {
  if (iso == null || iso.isEmpty) return 'غير محدد';
  try {
    final date = DateTime.parse(iso).toLocal();
    return DateFormat('EEEE d MMM · HH:mm', 'en').format(date);
  } catch (_) {
    return iso;
  }
}

Color difficultyColor(int difficulty) {
  if (difficulty <= 2) return const Color(0xFF34D399);
  if (difficulty == 3) return const Color(0xFFFBBF24);
  if (difficulty == 4) return const Color(0xFFFB923C);
  return const Color(0xFFF87171);
}

Color positionColor(String position) {
  switch (position) {
    case 'GKP':
      return const Color(0xFFFBBF24);
    case 'DEF':
      return const Color(0xFF38BDF8);
    case 'MID':
      return const Color(0xFF34D399);
    default:
      return const Color(0xFFFB7185);
  }
}

class SectionHeader extends StatelessWidget {
  final String title;
  final String? subtitle;
  final Widget? trailing;

  const SectionHeader({super.key, required this.title, this.subtitle, this.trailing});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(2, 16, 2, 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Colors.white)),
                if (subtitle != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 2),
                    child: Text(subtitle!, style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
                  ),
              ],
            ),
          ),
          if (trailing != null) trailing!,
        ],
      ),
    );
  }
}

class AppCard extends StatelessWidget {
  final Widget child;
  final EdgeInsets padding;
  final Color? color;

  const AppCard({super.key, required this.child, this.padding = const EdgeInsets.all(14), this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: padding,
      decoration: BoxDecoration(
        color: color ?? AppColors.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withOpacity(0.07)),
      ),
      child: child,
    );
  }
}

class StatTile extends StatelessWidget {
  final String label;
  final String value;
  final Color accent;

  const StatTile({super.key, required this.label, required this.value, this.accent = Colors.white});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.04),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white.withOpacity(0.06)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 10, color: AppColors.textMuted)),
          const SizedBox(height: 2),
          Text(value, maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: accent)),
        ],
      ),
    );
  }
}

class TeamBadge extends StatelessWidget {
  final Team? team;
  final double size;

  const TeamBadge({super.key, this.team, this.size = 20});

  @override
  Widget build(BuildContext context) {
    if (team == null) return const SizedBox.shrink();
    return Image.network(
      team!.badgeUrl(),
      width: size,
      height: size,
      errorBuilder: (context, error, stack) => Text(team!.short, style: TextStyle(fontSize: size * 0.5, color: AppColors.textMuted)),
    );
  }
}

class PlayerAvatar extends StatelessWidget {
  final FplPlayer player;
  final double size;

  const PlayerAvatar({super.key, required this.player, this.size = 42});

  @override
  Widget build(BuildContext context) {
    final color = positionColor(player.position);
    if (player.photo.isEmpty) {
      return Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          gradient: LinearGradient(colors: [color.withOpacity(0.5), color.withOpacity(0.1)]),
          borderRadius: BorderRadius.circular(14),
        ),
        alignment: Alignment.center,
        child: Text(player.position, style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold)),
      );
    }
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: [color.withOpacity(0.45), color.withOpacity(0.1)]),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      clipBehavior: Clip.antiAlias,
      child: Image.network(
        player.photo,
        fit: BoxFit.cover,
        errorBuilder: (context, error, stack) => Center(
          child: Text(player.position, style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold)),
        ),
      ),
    );
  }
}

class PositionChip extends StatelessWidget {
  final String position;

  const PositionChip({super.key, required this.position});

  @override
  Widget build(BuildContext context) {
    final color = positionColor(position);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: color.withOpacity(0.15),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withOpacity(0.4)),
      ),
      child: Text(posArabic(position), style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: color)),
    );
  }
}

class DifficultyPill extends StatelessWidget {
  final int difficulty;

  const DifficultyPill({super.key, required this.difficulty});

  @override
  Widget build(BuildContext context) {
    final color = difficultyColor(difficulty);
    return Container(
      width: 22,
      alignment: Alignment.center,
      padding: const EdgeInsets.symmetric(vertical: 2),
      decoration: BoxDecoration(
        color: color.withOpacity(0.15),
        borderRadius: BorderRadius.circular(7),
        border: Border.all(color: color.withOpacity(0.5)),
      ),
      child: Text('$difficulty', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: color)),
    );
  }
}

class PlayerRowTile extends StatelessWidget {
  final FplPlayer player;
  final int? rank;
  final String? metric;
  final String? metricLabel;
  final Team? team;
  final VoidCallback? onTap;

  const PlayerRowTile({
    super.key,
    required this.player,
    this.rank,
    this.metric,
    this.metricLabel,
    this.team,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 7),
        child: Row(
          children: [
            if (rank != null)
              SizedBox(
                width: 20,
                child: Text('$rank', textAlign: TextAlign.center, style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: rank! <= 3 ? AppColors.lime : AppColors.textMuted)),
              ),
            PlayerAvatar(player: player, size: 38),
            const SizedBox(width: 8),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Flexible(
                        child: Text(
                          player.name,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: Colors.white),
                        ),
                      ),
                      if (!player.available) ...[
                        const SizedBox(width: 4),
                        const Icon(Icons.error_outline, size: 12, color: AppColors.danger),
                      ],
                    ],
                  ),
                  const SizedBox(height: 2),
                  Row(
                    children: [
                      TeamBadge(team: team, size: 14),
                      const SizedBox(width: 4),
                      Text('${player.teamShort} · ${posArabic(player.position)}', style: const TextStyle(fontSize: 9, color: AppColors.textMuted)),
                      const SizedBox(width: 6),
                      Text('£${money(player.cost)}', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.mint)),
                    ],
                  ),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(metric ?? '${player.totalPoints}', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Colors.white)),
                Text(metricLabel ?? 'نقطة', style: const TextStyle(fontSize: 9, color: AppColors.textMuted)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class ErrorBox extends StatelessWidget {
  final String message;
  final VoidCallback? onRetry;

  const ErrorBox({super.key, required this.message, this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('📡', style: TextStyle(fontSize: 32)),
            const SizedBox(height: 8),
            Text(message, textAlign: TextAlign.center, style: const TextStyle(fontSize: 13, color: Colors.white70, height: 1.6)),
            if (onRetry != null) ...[
              const SizedBox(height: 12),
              FilledButton(
                style: FilledButton.styleFrom(backgroundColor: AppColors.lime, foregroundColor: Colors.black),
                onPressed: onRetry,
                child: const Text('إعادة المحاولة'),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class LoadingBox extends StatelessWidget {
  const LoadingBox({super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Padding(
        padding: EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            CircularProgressIndicator(color: AppColors.lime),
            SizedBox(height: 12),
            Text('جارٍ تحميل البيانات الرسمية…', style: TextStyle(fontSize: 12, color: AppColors.textMuted)),
          ],
        ),
      ),
    );
  }
}
