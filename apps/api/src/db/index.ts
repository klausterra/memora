import type { DbClient } from "./types.js";

export { newId, nowIso } from "./types.js";
export type { DbClient } from "./types.js";

let db: DbClient | null = null;
let initPromise: Promise<DbClient> | null = null;

export async function initDb(): Promise<DbClient> {
  if (db) return db;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const databaseUrl = process.env.DATABASE_URL?.trim();
    if (databaseUrl) {
      const { openPostgres } = await import("./postgres.js");
      db = await openPostgres(databaseUrl);
      console.log("[db] using postgres");
    } else {
      const { openSqlite } = await import("./sqlite.js");
      const path = process.env.DATABASE_PATH ?? "./data/memora.sqlite";
      db = await openSqlite(path);
      console.log(`[db] using sqlite path=${path}`);
    }
    return db;
  })();

  try {
    return await initPromise;
  } catch (err) {
    initPromise = null;
    throw err;
  }
}

export function getDb(): DbClient {
  if (!db) {
    throw new Error("Database not initialized. Call await initDb() before handling requests.");
  }
  return db;
}
