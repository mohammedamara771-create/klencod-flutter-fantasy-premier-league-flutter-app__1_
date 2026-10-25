import Link from "next/link";

export default function NotFound() {
  return (
    <div className="glass mx-auto max-w-md rounded-3xl p-8 text-center">
      <span className="text-4xl">🧭</span>
      <h1 className="mt-2 text-lg font-black text-white">الصفحة أو اللاعب غير موجود</h1>
      <p className="mt-1 text-xs leading-5 text-white/50">
        قد يكون اللاعب قد أُزيل من اللعبة أو أن الرابط غير صحيح. جرّب البحث في قاعدة اللاعبين.
      </p>
      <div className="mt-4 flex justify-center gap-2">
        <Link href="/players" className="rounded-full bg-lime px-4 py-2 text-xs font-extrabold text-black">
          قاعدة اللاعبين
        </Link>
        <Link href="/" className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-extrabold text-white">
          الرئيسية
        </Link>
      </div>
    </div>
  );
}
