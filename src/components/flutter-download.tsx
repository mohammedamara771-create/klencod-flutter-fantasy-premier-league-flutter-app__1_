"use client";

import { useEffect, useState } from "react";

export default function FlutterDownload({ files }: { files: string[] }) {
  const [origin, setOrigin] = useState("");
  const [code, setCode] = useState("جارٍ تحميل الكود…");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
    fetch("/api/flutter/file?path=single_file/main.dart")
      .then((res) => res.text())
      .then(setCode)
      .catch(() => setCode("// تعذر تحميل الكود"));
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-5">
      <section className="card border-rose-400/30 bg-rose-400/5 p-5">
        <h2 className="text-lg font-black text-rose-200">
          ⚠️ خطأ: Expected to find project root in current working directory
        </h2>
        <p className="mt-2 text-sm text-slate-200">
          معناه أن <b>pubspec.yaml</b> غير موجود في <b>جذر المستودع</b>. يحدث
          هذا عند رفع المجلد <code dir="ltr">fpl_stats/</code> نفسه بدل محتوياته،
          أو عند رفع ملف <code dir="ltr">main.dart</code> وحده.
        </p>
        <p className="mt-2 text-sm text-emerald-200">
          ✅ تم إصلاحه: حزمة ZIP الجديدة تضع الملفات في الجذر مباشرة، وتحتوي على
          مجلد <code dir="ltr">android/</code> وملف
          <code dir="ltr"> .github/workflows/build-apk.yml</code> لبناء APK
          تلقائياً.
        </p>
        <pre
          dir="ltr"
          className="mt-3 overflow-x-auto rounded-xl bg-black/50 p-3 text-left font-mono text-[11px] text-slate-200"
        >
{`جذر المستودع يجب أن يبدو هكذا:

  pubspec.yaml          ✅ في الجذر
  analysis_options.yaml
  .gitignore
  lib/
  android/
  .github/workflows/build-apk.yml

وليس هكذا:

  fpl_stats/            ❌ مجلد إضافي
     pubspec.yaml`}
        </pre>
      </section>

      <section className="card glow p-5">
        <h2 className="text-lg font-black text-white">
          ١. حمّل المشروع كاملاً (ملف ZIP)
        </h2>
        <p className="mt-1 text-sm text-slate-300">
          الملفات في <b>جذر</b> الأرشيف (pubspec.yaml + lib + android +
          workflow)، وعنوان الخادم مضبوط تلقائياً على:{" "}
          <code dir="ltr" className="rounded bg-black/40 px-1.5 text-cyan-200">
            {origin || "..."}
          </code>
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href="/api/flutter/zip"
            className="rounded-xl bg-gradient-to-l from-[#00ff87] to-[#04f5ff] px-5 py-2.5 text-sm font-black text-[#37003c]"
          >
            ⬇️ تنزيل مشروع Flutter (ZIP)
          </a>
          <a
            href="/api/flutter/file?path=single_file/main.dart&download=1"
            className="rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-bold text-white"
          >
            ⬇️ تنزيل main.dart (ملف واحد)
          </a>
          <button
            type="button"
            onClick={copy}
            className="rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-5 py-2.5 text-sm font-bold text-emerald-200"
          >
            {copied ? "✅ تم النسخ" : "📋 نسخ كود main.dart"}
          </button>
        </div>
      </section>

      <section className="card p-5">
        <h2 className="text-lg font-black text-white">
          ٢. خطوات الرفع والبناء (GitHub / KlenCode)
        </h2>
        <ol className="mt-3 space-y-2 text-sm text-slate-200">
          {[
            "نزّل ملف ZIP ثم فُكّ الضغط عنه على جهازك.",
            "ارفع «محتويات» المجلد (وليس المجلد نفسه) إلى جذر المستودع: pubspec.yaml و lib و android و .github.",
            "في GitHub: Add file ← Upload files ← اسحب كل الملفات ← Commit. تأكد أن pubspec.yaml ظاهر في الجذر.",
            "افتح تبويب Actions ← شغّل «بناء تطبيق APK» ← انتظر حتى تظهر علامة ✅.",
            "نزّل ملف APK من قسم Artifacts باسم fpl-stats-apk وثبّته على هاتفك.",
            "داخل KlenCode IDE: افتح المشروع ← Pub Get ← Run ▶ أو Build APK.",
          ].map((step, index) => (
            <li key={step} className="flex gap-3 rounded-xl bg-white/5 p-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#00ff87] text-xs font-black text-[#37003c]">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <p className="mt-3 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-xs text-emerald-100">
          صلاحية الإنترنت مُضافة مسبقاً في
          <code dir="ltr" className="mx-1 rounded bg-black/40 px-1">
            android/app/src/main/AndroidManifest.xml
          </code>
          كما يضيفها ملف الـ workflow تلقائياً عند البناء، ويعيد توليد مجلد
          android بما يطابق إصدار Flutter على الخادم لتفادي أخطاء Gradle.
        </p>
        <p className="mt-2 rounded-xl border border-amber-400/20 bg-amber-400/10 p-3 text-xs text-amber-100">
          إذا كان مشروعك داخل مجلد فرعي في المستودع، أضف إلى خطوات الـ workflow:
          <code dir="ltr" className="mx-1 rounded bg-black/40 px-1">
            working-directory: اسم_المجلد
          </code>
        </p>
      </section>

      <section className="card p-5">
        <h2 className="text-lg font-black text-white">٣. ملفات المشروع</h2>
        <p className="text-xs text-slate-400">
          اضغط على أي ملف لعرضه أو تنزيله بشكل منفصل ({files.length} ملفاً).
        </p>
        <div className="mt-3 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
          {files.map((file) => (
            <a
              key={file}
              href={`/api/flutter/file?path=${encodeURIComponent(file)}&download=1`}
              dir="ltr"
              className="truncate rounded-lg bg-white/5 px-3 py-2 text-left font-mono text-[11px] text-cyan-200 hover:bg-white/10"
            >
              {file}
            </a>
          ))}
        </div>
      </section>

      <section className="card p-5">
        <h2 className="text-lg font-black text-white">
          ٤. معاينة كود main.dart (نسخة الملف الواحد)
        </h2>
        <pre
          dir="ltr"
          className="mt-3 max-h-[480px] overflow-auto rounded-xl bg-black/50 p-4 text-left font-mono text-[11px] leading-relaxed text-emerald-100"
        >
          {code}
        </pre>
      </section>
    </div>
  );
}
