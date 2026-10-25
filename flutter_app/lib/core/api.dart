import 'dart:convert';

import 'package:http/http.dart' as http;

import 'models.dart';

/// كل الطلبات تذهب إلى الواجهة الرسمية للفانتازي (لا تحتاج مفتاح API).
///
/// يمكنك استبدالها بواجهة نسخة الويب التي بنيناها:
///   static const String base = 'https://YOUR-APP/api/fpl';
/// ثم تعديل المسارات لتطابق الحقول العربية/الإنجليزية.
class FplApi {
  static const String base = 'https://fantasy.premierleague.com/api';

  static Bootstrap? _bootstrapCache;
  static DateTime? _bootstrapAt;

  static Future<T> _get<T>(String path, T Function(dynamic data) parse) async {
    final uri = Uri.parse('$base$path');
    late http.Response response;
    try {
      response = await http
          .get(uri, headers: const {'Accept': 'application/json'})
          .timeout(const Duration(seconds: 30));
    } catch (_) {
      throw Exception('تعذّر الاتصال بالواجهة الرسمية. تحقّق من الإنترنت ثم أعد المحاولة.');
    }
    if (response.statusCode == 404) {
      throw Exception('البيانات غير موجودة (404). تأكد من الرقم المُدخل.');
    }
    if (response.statusCode != 200) {
      throw Exception('الواجهة الرسمية أعادت رمز ${response.statusCode}');
    }
    final decoded = jsonDecode(utf8.decode(response.bodyBytes));
    return parse(decoded);
  }

  static Future<Bootstrap> bootstrap({bool force = false}) async {
    final cached = _bootstrapCache;
    if (!force && cached != null && _bootstrapAt != null && DateTime.now().difference(_bootstrapAt!).inMinutes < 5) {
      return cached;
    }
    final data = await _get<Bootstrap>('/bootstrap-static/', (dynamic json) {
      return Bootstrap.fromJson(json as Map<String, dynamic>);
    });
    _bootstrapCache = data;
    _bootstrapAt = DateTime.now();
    return data;
  }

  static Future<List<FixtureItem>> fixtures() {
    return _get<List<FixtureItem>>('/fixtures/', (dynamic json) {
      return (json as List<dynamic>)
          .map((item) => FixtureItem.fromJson(item as Map<String, dynamic>))
          .toList();
    });
  }

  static Future<PlayerSummary> elementSummary(int playerId) {
    return _get<PlayerSummary>('/element-summary/$playerId/', (dynamic json) {
      return PlayerSummary.fromJson(json as Map<String, dynamic>);
    });
  }

  static Future<ManagerInfo> entry(int entryId) {
    return _get<ManagerInfo>('/entry/$entryId/', (dynamic json) {
      return ManagerInfo.fromJson(json as Map<String, dynamic>);
    });
  }

  static Future<PicksData?> picks(int entryId, int event) async {
    try {
      return await _get<PicksData>('/entry/$entryId/event/$event/picks/', (dynamic json) {
        return PicksData.fromJson(json as Map<String, dynamic>, event);
      });
    } catch (_) {
      return null;
    }
  }

  /// أحدث جولة لعبت فيها تشكيلة المدير (بعض المديرين يبدأون في جولة متأخرة)
  static Future<PicksData?> latestPicks(int entryId, int preferredEvent) async {
    final direct = await picks(entryId, preferredEvent);
    if (direct != null && direct.picks.isNotEmpty) return direct;
    for (var event = preferredEvent - 1; event > 0; event--) {
      final fallback = await picks(entryId, event);
      if (fallback != null && fallback.picks.isNotEmpty) return fallback;
    }
    return null;
  }
}
