export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-48 animate-pulse rounded-[28px] border border-white/10 bg-white/5" />
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-16 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="h-72 animate-pulse rounded-3xl border border-white/10 bg-white/5" />
        ))}
      </div>
      <p className="text-center text-[11px] text-white/35">جارٍ تحميل البيانات من الواجهة الرسمية…</p>
    </div>
  );
}
