import Link from "next/link";
import { Card, EmptyState, Notice, SectionTitle, StatTile } from "@/components/ui";
import { getLeague } from "@/lib/fpl/data";

export const dynamic = "force-dynamic";

const SUGGESTED = [
  { id: 314, label: "الترتيب العام (Overall)" },
  { id: 313, label: "دوري عام" },
];

export default async function LeaguesPage({ searchParams }: { searchParams: Promise<{ id?: string; page?: string }> }) {
  const params = await searchParams;
  const leagueId = Number(params.id) || 314;
  const page = Math.max(1, Number(params.page) || 1);
  const league = await getLeague(leagueId, page);

  return (
    <div className="space-y-4">
      <Card>
        <SectionTitle
          title="ترتيب الدوريات"
          subtitle="أدخل رقم الدوري من رابط standings في الواجهة الرسمية لعرض جدول الترتيب"
        />
        <form method="get" action="/leagues" className="flex flex-wrap items-center gap-2">
          <input
            name="id"
            type="number"
            min={1}
            defaultValue={leagueId}
            placeholder="رقم الدوري (مثال: 314)"
            className="min-w-40 flex-1 rounded-2xl border border-white/10 bg-black/30 px-3 py-2.5 text-xs font-bold text-white placeholder:text-white/30 focus:border-lime/60 focus:outline-none"
          />
          <button type="submit" className="rounded-2xl bg-lime px-4 py-2.5 text-xs font-extrabold text-black lime-glow">
            عرض الترتيب
          </button>
        </form>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {SUGGESTED.map((item) => (
            <Link
              key={item.id}
              href={`/leagues?id=${item.id}`}
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${leagueId === item.id ? "bg-lime text-black" : "bg-white/5 text-white/60"}`}
            >
              {item.label} · {item.id}
            </Link>
          ))}
        </div>
        <div className="mt-2">
          <Notice>
            دورياتك الخاصة: افتح الدوري في موقع الفانتازي وانسخ الرقم من الرابط
            <span className="mx-1 font-mono text-[10px]">/leagues/<b>12345</b>/standings/c</span>
            — أو ابحث في صفحة «فريقي» عن دورياتك الرسمية.
          </Notice>
        </div>
      </Card>

      {league ? (
        <>
          <section className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <StatTile label="اسم الدوري" value={<span className="text-sm">{league.name}</span>} accent="text-lime" />
            <StatTile label="أول 50 مديراً" value={league.standings.length} hint={`صفحة ${league.page}`} />
            <StatTile label="أعلى مجموع" value={league.standings[0]?.total ?? "—"} accent="text-mint" />
            <StatTile label="أكثر نقاط جولة" value={Math.max(0, ...league.standings.map((row) => row.eventPoints))} />
          </section>

          <Card>
            <SectionTitle title={`ترتيب ${league.name}`} subtitle="من الواجهة الرسمية · يمكنك فتح أي مدير لمتابعة فريقه" />
            <div className="overflow-x-auto">
              <table className="stats w-full text-[11px]">
                <thead>
                  <tr className="text-[9px] text-white/40">
                    <th className="py-1.5 pr-1 text-right font-bold">#</th>
                    <th className="py-1.5 text-right font-bold">الفريق</th>
                    <th className="py-1.5 text-right font-bold">المدير</th>
                    <th className="py-1.5 text-center font-bold">نقاط الجولة</th>
                    <th className="py-1.5 text-center font-bold">المجموع</th>
                    <th className="py-1.5 text-center font-bold" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {league.standings.map((row) => (
                    <tr key={`${row.entry}-${row.rank}`} className="text-white/75">
                      <td className={`py-1.5 pr-1 text-right font-extrabold ${row.rank <= 3 ? "text-lime" : "text-white/35"}`}>{row.rank}</td>
                      <td className="py-1.5 font-bold text-white">{row.entryName}</td>
                      <td className="py-1.5 text-[10px] text-white/45">{row.playerName}</td>
                      <td className="py-1.5 text-center">
                        {leagueId === 314 ? "—" : <span className="rounded bg-white/10 px-1.5 text-[10px] font-bold">{row.eventPoints}</span>}
                      </td>
                      <td className="py-1.5 text-center font-extrabold text-lime">{row.total}</td>
                      <td className="py-1.5 text-center">
                        <Link href={`/team?entry=${row.entry}`} className="rounded-md bg-white/5 px-1.5 py-0.5 text-[9px] font-bold text-white/60 hover:text-lime">
                          الفريق
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {!league.standings.length ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-[11px] text-white/40">
                        لا يوجد ترتيب متاح لهذا الدوري في هذه الصفحة.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex items-center justify-between">
              {league.page > 1 ? (
                <Link href={`/leagues?id=${leagueId}&page=${league.page - 1}`} className="rounded-xl bg-white/5 px-3 py-1.5 text-[10px] font-bold text-white/60">
                  ← الصفحة السابقة
                </Link>
              ) : (
                <span />
              )}
              {league.hasNext ? (
                <Link href={`/leagues?id=${leagueId}&page=${league.page + 1}`} className="rounded-xl bg-lime/15 px-3 py-1.5 text-[10px] font-bold text-lime">
                  الصفحة التالية →
                </Link>
              ) : null}
            </div>
          </Card>
        </>
      ) : (
        <EmptyState icon="🏆" title="لم يُعثر على الدوري" message="تأكد من رقم الدوري. الدوريات الخاصة تتطلب أن يكون الدوري عاماً أو أن يكون لديك رابط المشاركة." />
      )}
    </div>
  );
}
