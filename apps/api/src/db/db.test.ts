import { describe, expect, it } from "vitest";
import { toPgParams } from "./postgres.js";
import { openSqlite } from "./sqlite.js";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

describe("toPgParams", () => {
  it("rewrites question marks to numbered params", () => {
    expect(toPgParams("SELECT * FROM t WHERE a = ? AND b = ?")).toBe(
      "SELECT * FROM t WHERE a = $1 AND b = $2",
    );
  });
});

describe("sqlite adapter", () => {
  it("migrates and inserts a user", async () => {
    const dir = mkdtempSync(join(tmpdir(), "memora-db-"));
    const db = await openSqlite(join(dir, "test.sqlite"));
    await db.execute(
      `INSERT INTO users (id, firebase_uid, email, name, preferred_name, role, timezone, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ["u1", "fb1", "a@b.c", "A", "A", "user", "America/Sao_Paulo", "t", "t"],
    );
    const row = await db.queryOne<{ id: string }>("SELECT id FROM users WHERE firebase_uid = ?", ["fb1"]);
    expect(row?.id).toBe("u1");
    await db.close();
  });
});
