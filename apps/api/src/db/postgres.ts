import pg from "pg";
import type { DbClient, SqlParams } from "./types.js";
import { migrate } from "./migrate.js";

const { Pool } = pg;

/** Convert `?` placeholders to Postgres `$1`, `$2`, ... */
export function toPgParams(sql: string): string {
  let index = 0;
  return sql.replace(/\?/g, () => {
    index += 1;
    return `$${index}`;
  });
}

export async function openPostgres(connectionString: string): Promise<DbClient> {
  const pool = new Pool({
    connectionString,
    max: 5,
    idleTimeoutMillis: 30_000,
  });

  const client: DbClient = {
    async queryOne<T extends Record<string, unknown>>(sql: string, params: SqlParams = []) {
      const result = await pool.query(toPgParams(sql), params);
      return result.rows[0] as T | undefined;
    },
    async queryAll<T extends Record<string, unknown>>(sql: string, params: SqlParams = []) {
      const result = await pool.query(toPgParams(sql), params);
      return result.rows as T[];
    },
    async execute(sql: string, params: SqlParams = []) {
      await pool.query(toPgParams(sql), params);
    },
    async close() {
      await pool.end();
    },
  };

  await migrate(client);
  return client;
}
