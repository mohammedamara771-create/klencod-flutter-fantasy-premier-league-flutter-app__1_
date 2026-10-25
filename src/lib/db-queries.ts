import { db } from "@/db";
import { squadPlayers, squads, trackedManagers, watchlist } from "@/db/schema";
import { desc, inArray } from "drizzle-orm";

export type WatchRow = typeof watchlist.$inferSelect;
export type TrackedManagerRow = typeof trackedManagers.$inferSelect;
export type SquadRow = typeof squads.$inferSelect;
export type SquadPlayerRow = typeof squadPlayers.$inferSelect;

export async function getWatchlist(): Promise<WatchRow[]> {
  try {
    return await db.select().from(watchlist).orderBy(desc(watchlist.createdAt));
  } catch {
    return [];
  }
}

export async function getTrackedManagers(): Promise<TrackedManagerRow[]> {
  try {
    return await db.select().from(trackedManagers).orderBy(desc(trackedManagers.createdAt));
  } catch {
    return [];
  }
}

export async function getSavedSquads(): Promise<{ squad: SquadRow; players: SquadPlayerRow[] }[]> {
  try {
    const squadRows = await db.select().from(squads).orderBy(desc(squads.createdAt)).limit(12);
    if (!squadRows.length) return [];
    const playerRows = await db
      .select()
      .from(squadPlayers)
      .where(
        inArray(
          squadPlayers.squadId,
          squadRows.map((row) => row.id),
        ),
      );
    return squadRows.map((squad) => ({
      squad,
      players: playerRows.filter((player) => player.squadId === squad.id),
    }));
  } catch {
    return [];
  }
}
