import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import type { DbClient, SqlParams } from "./types.js";
import { migrate } from "./migrate.js";

function asSqlValues(params: SqlParams): SQLInputValue[] {
  return params as SQLInputValue[];
}

export function createSqliteClient(path: string): DbClient {
  mkdirSync(dirname(path), { recursive: true });
  const database = new DatabaseSync(path);
  database.exec("PRAGMA journal_mode = WAL;");
  database.exec("PRAGMA foreign_keys = ON;");

  const client: DbClient = {
    async queryOne<T extends Record<string, unknown>>(sql: string, params: SqlParams = []) {
      return database.prepare(sql).get(...asSqlValues(params)) as T | undefined;
    },
    async queryAll<T extends Record<string, unknown>>(sql: string, params: SqlParams = []) {
      return database.prepare(sql).all(...asSqlValues(params)) as T[];
    },
    async execute(sql: string, params: SqlParams = []) {
      if (params.length === 0 && /^\s*(CREATE|PRAGMA)/i.test(sql)) {
        database.exec(sql);
        return;
      }
      database.prepare(sql).run(...asSqlValues(params));
    },
    async close() {
      database.close();
    },
  };

  return client;
}

export async function openSqlite(path: string): Promise<DbClient> {
  const client = createSqliteClient(path);
  await migrate(client);
  return client;
}
