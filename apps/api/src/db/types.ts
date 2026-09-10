export type SqlParams = unknown[];

export interface DbClient {
  queryOne<T extends Record<string, unknown>>(sql: string, params?: SqlParams): Promise<T | undefined>;
  queryAll<T extends Record<string, unknown>>(sql: string, params?: SqlParams): Promise<T[]>;
  execute(sql: string, params?: SqlParams): Promise<void>;
  close(): Promise<void>;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function newId(): string {
  return crypto.randomUUID();
}
