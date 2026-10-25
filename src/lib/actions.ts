"use server";

import { db } from "@/db";
import { squadPlayers, squads, trackedManagers, watchlist } from "@/db/schema";
import { refreshGameData } from "@/lib/fpl/data";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

function refreshAll() {
  revalidatePath("/");
  revalidatePath("/team");
  revalidatePath("/builder");
  revalidatePath("/players");
}

export async function toggleWatchAction(formData: FormData): Promise<void> {
  const playerId = Number(formData.get("playerId"));
  if (!Number.isFinite(playerId) || playerId <= 0) return;

  const existing = await db.select().from(watchlist).where(eq(watchlist.playerId, playerId)).limit(1);
  if (existing.length) {
    await db.delete(watchlist).where(eq(watchlist.playerId, playerId));
  } else {
    await db.insert(watchlist).values({
      playerId,
      playerName: String(formData.get("playerName") ?? "لاعب"),
      position: String(formData.get("position") ?? "MID"),
      teamShort: String(formData.get("teamShort") ?? ""),
      cost: Number(formData.get("cost") ?? 0),
      totalPoints: Number(formData.get("totalPoints") ?? 0),
    });
  }
  refreshAll();
}

export async function trackManagerAction(formData: FormData): Promise<void> {
  const entryId = Number(formData.get("entryId"));
  if (!Number.isFinite(entryId) || entryId <= 0) return;
  await db
    .insert(trackedManagers)
    .values({
      entryId,
      managerName: String(formData.get("managerName") ?? "مدير"),
      teamName: String(formData.get("teamName") ?? `فريق ${entryId}`),
    })
    .onConflictDoNothing({ target: trackedManagers.entryId });
  refreshAll();
}

export async function untrackManagerAction(formData: FormData): Promise<void> {
  const entryId = Number(formData.get("entryId"));
  if (!Number.isFinite(entryId)) return;
  await db.delete(trackedManagers).where(eq(trackedManagers.entryId, entryId));
  refreshAll();
}

type SquadInput = {
  name: string;
  formation: string;
  spent: number;
  bank: number;
  captain: number | null;
  players: {
    id: number;
    webName: string;
    position: string;
    teamShort: string;
    cost: number;
    totalPoints: number;
    bench: boolean;
  }[];
};

export async function saveSquadAction(formData: FormData) {
  let input: SquadInput;
  try {
    input = JSON.parse(String(formData.get("payload") ?? "{}")) as SquadInput;
  } catch {
    return { ok: false, message: "بيانات التشكيلة غير صالحة" };
  }

  if (!input.players?.length) return { ok: false, message: "التشكيلة فارغة" };
  if (input.players.length !== 15) return { ok: false, message: "يجب اختيار 15 لاعباً" };
  if (!input.name?.trim()) return { ok: false, message: "أدخل اسماً للتشكيلة" };

  const [squad] = await db
    .insert(squads)
    .values({
      name: input.name.trim().slice(0, 60),
      formation: input.formation,
      spent: input.spent.toFixed(1),
      bank: input.bank.toFixed(1),
    })
    .returning({ id: squads.id });

  const order: Record<string, number> = { GKP: 0, DEF: 1, MID: 2, FWD: 3 };
  const sorted = [...input.players].sort((a, b) => (order[a.position] ?? 9) - (order[b.position] ?? 9));

  await db.insert(squadPlayers).values(
    sorted.map((player) => ({
      squadId: squad.id,
      playerId: player.id,
      playerName: player.webName,
      position: player.position,
      teamShort: player.teamShort,
      cost: player.cost,
      totalPoints: player.totalPoints,
      isCaptain: input.captain === player.id,
      isBench: player.bench,
    })),
  );

  refreshAll();
  return { ok: true, message: "تم حفظ التشكيلة" };
}

export async function deleteSquadAction(formData: FormData): Promise<void> {
  const id = Number(formData.get("squadId"));
  if (!Number.isFinite(id)) return;
  await db.delete(squads).where(eq(squads.id, id));
  refreshAll();
}

export async function syncDataAction() {
  try {
    const data = await refreshGameData();
    refreshAll();
    return { ok: true, players: data.players.length, updatedAt: data.updatedAt };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "تعذّرت المزامنة" };
  }
}
