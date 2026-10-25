import { getManagerHistory, getManagerInfo, getPicks } from "@/lib/fpl/data";

export const dynamic = "force-dynamic";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

/** ملخص فريق مدير في الفانتازي + تشكيلة الجولة + سجل الموسم */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ entryId: string }> },
) {
  const { entryId } = await params;
  const id = Number(entryId);
  if (!Number.isFinite(id) || id <= 0) {
    return Response.json({ ok: false, message: "معرّف مدير غير صالح" }, { status: 400, headers: CORS });
  }

  try {
    const info = await getManagerInfo(id);
    if (!info) {
      return Response.json({ ok: false, message: "لم يُعثر على المدير" }, { status: 404, headers: CORS });
    }
    const history = await getManagerHistory(id);
    const gwParam = Number(new URL(request.url).searchParams.get("gw"));
    const latestEvent =
      gwParam ||
      [...(history?.current ?? [])].reverse().find((row) => row.totalPoints > 0)?.event ||
      info.currentEvent ||
      1;
    const picks = await getPicks(id, latestEvent);

    return Response.json(
      { ok: true, source: "https://fantasy.premierleague.com/api", manager: info, history, picks },
      { headers: CORS },
    );
  } catch (error) {
    return Response.json(
      { ok: false, message: error instanceof Error ? error.message : "خطأ غير متوقع" },
      { status: 502, headers: CORS },
    );
  }
}
