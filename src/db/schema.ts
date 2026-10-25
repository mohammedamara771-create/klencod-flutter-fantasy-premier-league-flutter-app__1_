import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgTable,
  real,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/** كاش كامل لبيانات الواجهة الرسمية (نسخة احتياطية عند انقطاع الاتصال) */
export const fplSnapshots = pgTable(
  "fpl_snapshots",
  {
    id: serial("id").primaryKey(),
    kind: text("kind").notNull(),
    season: text("season"),
    payload: jsonb("payload").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("fpl_snapshots_kind_idx").on(table.kind)],
);

/** جدول اللاعبين المُطبع لتسريع البحث والإحصاءات */
export const fplPlayers = pgTable("fpl_players", {
  id: integer("id").primaryKey(),
  webName: text("web_name").notNull(),
  fullName: text("full_name").notNull(),
  teamId: integer("team_id").notNull(),
  teamShort: text("team_short").notNull(),
  position: text("position").notNull(),
  cost: real("cost").notNull(),
  totalPoints: integer("total_points").notNull().default(0),
  eventPoints: integer("event_points").notNull().default(0),
  form: real("form").notNull().default(0),
  minutes: integer("minutes").notNull().default(0),
  goals: integer("goals").notNull().default(0),
  assists: integer("assists").notNull().default(0),
  cleanSheets: integer("clean_sheets").notNull().default(0),
  bonus: integer("bonus").notNull().default(0),
  selected: real("selected").notNull().default(0),
  expectedGoals: real("expected_goals").notNull().default(0),
  expectedAssists: real("expected_assists").notNull().default(0),
  status: text("status").notNull().default("a"),
  news: text("news").notNull().default(""),
  photo: text("photo"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const fplTeams = pgTable("fpl_teams", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  shortName: text("short_name").notNull(),
  code: integer("code").notNull(),
  strength: integer("strength").notNull().default(0),
  position: integer("position").notNull().default(0),
  points: integer("points").notNull().default(0),
  played: integer("played").notNull().default(0),
});

/** قائمة المتابعة (المفضلة) */
export const watchlist = pgTable(
  "watchlist",
  {
    id: serial("id").primaryKey(),
    playerId: integer("player_id").notNull(),
    playerName: text("player_name").notNull(),
    position: text("position").notNull(),
    teamShort: text("team_short").notNull(),
    cost: real("cost").notNull(),
    totalPoints: integer("total_points").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("watchlist_player_idx").on(table.playerId)],
);

/** مديرو الفانتازي المحفوظون لمتابعة فرقهم */
export const trackedManagers = pgTable(
  "tracked_managers",
  {
    id: serial("id").primaryKey(),
    entryId: integer("entry_id").notNull(),
    managerName: text("manager_name").notNull(),
    teamName: text("team_name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("tracked_managers_entry_idx").on(table.entryId)],
);

/** تشكيلات مبنية داخل التطبيق */
export const squads = pgTable("squads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  formation: text("formation").notNull().default("4-4-2"),
  spent: numeric("spent", { precision: 6, scale: 1 }).notNull().default("0"),
  bank: numeric("bank", { precision: 6, scale: 1 }).notNull().default("100"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const squadPlayers = pgTable("squad_players", {
  id: serial("id").primaryKey(),
  squadId: integer("squad_id")
    .notNull()
    .references(() => squads.id, { onDelete: "cascade" }),
  playerId: integer("player_id").notNull(),
  playerName: text("player_name").notNull(),
  position: text("position").notNull(),
  teamShort: text("team_short").notNull(),
  cost: real("cost").notNull(),
  totalPoints: integer("total_points").notNull().default(0),
  isCaptain: boolean("is_captain").notNull().default(false),
  isBench: boolean("is_bench").notNull().default(false),
});

export const syncLogs = pgTable("sync_logs", {
  id: serial("id").primaryKey(),
  source: text("source").notNull().default("official-api"),
  status: text("status").notNull().default("ok"),
  players: integer("players").notNull().default(0),
  teams: integer("teams").notNull().default(0),
  message: text("message"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
