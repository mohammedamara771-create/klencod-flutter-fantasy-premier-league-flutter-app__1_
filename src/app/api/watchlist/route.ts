import { db } from "@/db";
import { watchlist } from "@/db/schema";
import { getWatchlist } from "@/lib/db-queries";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await getWatchlist();
  return Response.json({ ok: true, items: rows });
}

export async function POST(request: Request) {
  let body: {
    playerId?: number;
    playerName?: string;
    position?: string;
    teamShort?: string;
    cost?: number;
    totalPoints?: number;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ ok: false, message: "طلب غير صالح" }, { status: 400 });
  }

  const playerId = Number(body.playerId);
  if (!Number.isFinite(playerId) || playerId <= 0) {
    return Response.json({ ok: false, message: "رقم لاعب غير صالح" }, { status: 400 });
  }

  const existing = await db.select().from(watchlist).where(eq(watchlist.playerId, playerId)).limit(1);
  if (existing.length) {
    await db.delete(watchlist).where(eq(watchlist.playerId, playerId));
    return Response.json({ ok: true, watching: false });
  }

  await db.insert(watchlist).values({
    playerId,
    playerName: String(body.playerName ?? "لاعب").slice(0, 60),
    position: String(body.position ?? "MID").slice(0, 4),
    teamShort: String(body.teamShort ?? "").slice(0, 6),
    cost: Number(body.cost ?? 0),
    totalPoints: Number(body.totalPoints ?? 0),
  });
  return Response.json({ ok: true, watching: true });
}
