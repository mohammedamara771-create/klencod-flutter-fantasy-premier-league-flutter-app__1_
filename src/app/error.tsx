"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="glass mx-auto max-w-md rounded-3xl p-6 text-center">
      <span className="text-3xl">📡</span>
      <h2 className="mt-2 text-base font-extrabold text-white">تعذّر تحميل البيانات الرسمية</h2>
      <p className="mt-1 text-xs leading-5 text-white/50">
        واجهة الفانتازي الرسمية لم تستجب أو لا توجد نسخة محفوظة بعد. تحقّق من الاتصال ثم أعد المحاولة.
      </p>
      <p className="mt-2 break-words rounded-xl bg-black/30 px-2 py-1 text-[10px] text-white/30">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-full bg-lime px-4 py-2 text-xs font-extrabold text-black lime-glow"
      >
        إعادة المحاولة
      </button>
    </div>
  );
}
