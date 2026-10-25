import Link from "next/link";
import { Badge, Card, Notice, SectionTitle } from "@/components/ui";

export const metadata = {
  title: "تنزيل مشروع Flutter | فانتازي أرينا",
  description: "حمّل مشروع Flutter كامل لتطبيق فانتازي أرينا وافتحه في Klencode IDE بخطوات بسيطة.",
};

const FILES = [
  ["lib/main.dart", "الهيكل، التنقل السفلي، تحميل البيانات الرسمية"],
  ["lib/core/models.dart", "نماذج اللاعبين والأندية والجولات والمديرين"],
  ["lib/core/api.dart", "الاتصال بالواجهة الرسمية + كاش 5 دقائق"],
  ["lib/core/ui.dart", "الثيم الداكن، الكروت، شارات الأندية، عناصر الإحصاءات"],
  ["lib/screens/home_screen.dart", "الرئيسية: أفضل اللاعبين، الفورمة، الأسعار، الامتلاك"],
  ["lib/screens/players_screen.dart", "بحث وفلترة وفرز قاعدة اللاعبين"],
  ["lib/screens/player_screen.dart", "كل إحصاءات اللاعب + سجل الجولات + المواسم"],
  ["lib/screens/team_screen.dart", "فريق المدير: الترتيب، القيمة، البنك، التشكيلة"],
  ["lib/screens/fixtures_screen.dart", "جدول المباريات وصعوبة الخصم FDR"],
  ["lib/screens/stats_screen.dart", "15 تصنيفاً إحصائياً"],
];

const STEPS = [
  {
    title: "حمّل ملف المشروع",
    text: "اضغط زر التنزيل بالأسفل لتحصل على fpl-arena-flutter.zip ثم فك الضغط على هاتفك أو حاسوبك.",
  },
  {
    title: "أنشئ مشروع Flutter في Klencode IDE",
    text: "من القائمة: New Project ← Flutter ← اسم الحزمة fpl_arena (أو استورد المجلد مباشرة إن كان المحرر يدعم Open Folder).",
  },
  {
    title: "انسخ ملفات lib",
    text: "استبدل مجلد lib بالكامل بمحتوى lib من الحزمة، وانسخ pubspec.yaml أيضاً (أو أضف http و intl إلى Dependencies).",
  },
  {
    title: "شغّل Pub Get",
    text: "اضغط Get Packages / Pub Get من داخل المحرر حتى يتم تنزيل http و intl.",
  },
  {
    title: "إن طلب المحرر مجلدات المنصات",
    text: "في طرفية Klencode (Terminal) اكتب: flutter create . ثم flutter pub get — لتوليد android و ios ثم شغّل التطبيق.",
  },
  {
    title: "شغّل التطبيق",
    text: "اضغط Run (▶) على المحاكي أو جهازك. البيانات تُجلب مباشرة من fantasy.premierleague.com/api بدون أي مفتاح.",
  },
];

export default function DownloadPage() {
  return (
    <div className="space-y-4">
      <section className="relative overflow-hidden rounded-[26px] border border-white/10 bg-gradient-to-bl from-mint/20 via-[#14112a] to-[#0a0913] p-5 sm:p-7">
        <div className="absolute -left-10 -top-14 h-44 w-44 rounded-full bg-lime/20 blur-3xl" />
        <div className="relative flex flex-wrap items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.png" alt="أيقونة فانتازي أرينا" className="floaty h-16 w-16 rounded-2xl border border-white/15 object-cover" />
          <div className="min-w-0 flex-1">
            <Badge className="border-lime/30 bg-lime/10 text-lime">مشروع Flutter جاهز</Badge>
            <h1 className="mt-2 text-xl font-black leading-tight sm:text-2xl">
              نزّل مشروع Flutter وضعه في Klencode IDE
            </h1>
            <p className="mt-1 max-w-xl text-[11px] leading-5 text-white/55">
              13 ملف Dart + pubspec.yaml، واجهة عربية RTL بثيم داكن، 5 شاشات وواجهة اتصال كاملة بالواجهة الرسمية
              للفانتازي. حجم الملف صغير (26KB) — ملفات مصدرية وليست APK جاهزاً.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto">
            <a
              href="/downloads/fpl-arena-flutter.zip"
              download
              className="rounded-2xl bg-lime px-5 py-3 text-center text-xs font-extrabold text-black lime-glow"
            >
              ⬇ تنزيل مشروع Flutter (ZIP)
            </a>
            <a
              href="/api/fpl?limit=20"
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-white/15 bg-white/5 px-5 py-2.5 text-center text-[11px] font-extrabold text-white/80"
            >
              تجربة واجهة JSON العامة
            </a>
          </div>
        </div>
      </section>

      <Notice tone="warn">
        مهم: هذا ملف <b>مصدر مشروع Flutter</b> وليس ملف تثبيت APK. تطبيقات Flutter تُبنى وتُثبّت من داخل Klencode IDE
        (Run) أو بأمر <span className="font-mono">flutter build apk</span>. هذه البيئة تبني وتستضيف نسخة الويب فقط.
      </Notice>

      <Card>
        <SectionTitle title="خطوات التركيب في Klencode IDE" subtitle="ستة خطوات فقط حتى يعمل التطبيق على جهازك" />
        <ol className="space-y-2.5">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-2.5 rounded-2xl bg-white/[0.03] p-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lime/15 text-[11px] font-extrabold text-lime">
                {index + 1}
              </span>
              <div>
                <p className="text-xs font-extrabold text-white">{step.title}</p>
                <p className="mt-0.5 text-[11px] leading-5 text-white/50">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
        <Card>
          <SectionTitle title="ما داخل الحزمة" subtitle="كل ملف ووظيفته" />
          <div className="space-y-1">
            {FILES.map(([file, desc]) => (
              <div key={file} className="flex flex-wrap items-center gap-2 rounded-xl bg-white/[0.03] px-2 py-1.5">
                <span className="font-mono text-[10px] font-bold text-mint" dir="ltr">{file}</span>
                <span className="text-[10px] text-white/45">{desc}</span>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <SectionTitle title="ماذا يعرض التطبيق؟" />
            <ul className="space-y-1.5 text-[11px] leading-5 text-white/60">
              <li>• الرئيسية: الجولة الحالية، متوسط النقاط، أفضل اللاعبين، الفورمة، تغيّر الأسعار، الامتلاك.</li>
              <li>• اللاعبون: بحث عربي/إنجليزي، فلترة بالمركز والسعر والتوفر، وفرز بـ 9 مؤشرات.</li>
              <li>• صفحة اللاعب: xG، xA، xGI، ICT، بونص، BPS، تصديات، تاريخ الجولات والمواسم السابقة.</li>
              <li>• فريقي: أدخل Entry ID لعرض الترتيب العام، قيمة الفريق، البنك، التشكيلة والكابتن والدكة.</li>
              <li>• المباريات: كل الجولات مع صعوبة المباراة FDR.</li>
              <li>• الإحصاءات: 15 تصنيفاً بينها الهدافون وصنّاع الأهداف والأفضل قيمة.</li>
            </ul>
          </Card>

          <Card>
            <SectionTitle title="روابط سريعة" />
            <div className="grid gap-1.5 text-[11px]">
              <a className="rounded-xl bg-white/[0.04] px-2.5 py-2 font-bold text-lime" href="/downloads/fpl-arena-flutter.zip" download>
                📦 fpl-arena-flutter.zip
              </a>
              <a className="rounded-xl bg-white/[0.04] px-2.5 py-2 font-mono text-mint" dir="ltr" href="/api/fpl?position=FWD&limit=10" target="_blank" rel="noreferrer">
                /api/fpl?position=FWD&amp;limit=10
              </a>
              <a className="rounded-xl bg-white/[0.04] px-2.5 py-2 font-mono text-mint" dir="ltr" href="/api/fpl/manager/1" target="_blank" rel="noreferrer">
                /api/fpl/manager/1
              </a>
              <Link className="rounded-xl bg-white/[0.04] px-2.5 py-2 font-bold text-white/70" href="/team">
                🔎 تجربة «فريقي» في نسخة الويب
              </Link>
            </div>
            <p className="mt-2 text-[10px] leading-5 text-white/35">
              يمكنك جعل تطبيق Flutter يقرأ من واجهة هذا الموقع بدل الواجهة الرسمية: عدّل
              <span className="mx-1 font-mono text-white/50">FplApi.base</span>
              في <span className="font-mono text-white/50">lib/core/api.dart</span>.
            </p>
          </Card>
        </div>
      </div>

      <Card>
        <SectionTitle title="حلول للمشاكل الشائعة" />
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            { q: "Pub Get يفشل", a: "تأكد من إصدار Dart 3 أو أحدث، ثم نفّذ flutter pub get من الطرفية. إن استمر: flutter clean." },
            { q: "مجلد android غير موجود", a: "نفّذ flutter create . داخل مجلد المشروع لتوليد مجلدات المنصات مع بقاء ملفات lib." },
            { q: "صفحة البيانات فارغة", a: "الواجهة الرسمية تحتاج إنترنت مستقراً؛ أعد المحاولة من أيقونة التحديث أعلى الشاشة." },
            { q: "الخط العربي غير مثالي", a: "أضف خط Cairo عبر google_fonts أو ضع ملف ttf في assets وحدّث theme في lib/core/ui.dart." },
          ].map((item) => (
            <div key={item.q} className="rounded-2xl bg-white/[0.03] p-2.5">
              <p className="text-[11px] font-extrabold text-white">{item.q}</p>
              <p className="mt-0.5 text-[10px] leading-5 text-white/45">{item.a}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
