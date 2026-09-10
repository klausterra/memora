import { createRemoteJWKSet, jwtVerify } from "jose";
import { isAdminEmail, type PublicUser } from "@memora/shared";
import type { FastifyRequest } from "fastify";
import { getDb, newId, nowIso } from "./db.js";

export type AuthUser = PublicUser & { firebaseUid: string };

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID ?? "hipercube-dev-train";
const jwks = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"),
);

function upsertUser(firebaseUid: string, email: string | null, name: string | null): AuthUser {
  const database = getDb();
  const existing = database
    .prepare("SELECT * FROM users WHERE firebase_uid = ?")
    .get(firebaseUid) as
    | {
        id: string;
        email: string | null;
        name: string | null;
        preferred_name: string | null;
        role: "user" | "admin";
        timezone: string;
      }
    | undefined;

  const role = isAdminEmail(email) ? "admin" : "user";
  const ts = nowIso();

  if (!existing) {
    const id = newId();
    database
      .prepare(
        `INSERT INTO users (id, firebase_uid, email, name, preferred_name, role, timezone, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, 'America/Sao_Paulo', ?, ?)`,
      )
      .run(id, firebaseUid, email, name, name?.split(" ")[0] ?? null, role, ts, ts);

    return {
      id,
      firebaseUid,
      email,
      name,
      preferredName: name?.split(" ")[0] ?? null,
      role,
      timezone: "America/Sao_Paulo",
    };
  }

  database
    .prepare(
      `UPDATE users SET email = ?, name = ?, role = ?, updated_at = ?
       WHERE firebase_uid = ?`,
    )
    .run(email, name, role, ts, firebaseUid);

  return {
    id: existing.id,
    firebaseUid,
    email,
    name,
    preferredName: existing.preferred_name,
    role,
    timezone: existing.timezone,
  };
}

export async function authenticateRequest(request: FastifyRequest): Promise<AuthUser> {
  const header = request.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    if (process.env.DEV_AUTH_BYPASS === "1") {
      return upsertUser("dev-bypass", "klausqterra@gmail.com", "Klaus (dev)");
    }
    const err = new Error("Missing bearer token");
    (err as Error & { statusCode: number }).statusCode = 401;
    throw err;
  }

  const token = header.slice("Bearer ".length).trim();

  if (process.env.DEV_AUTH_BYPASS === "1" && token === "dev") {
    return upsertUser("dev-bypass", "klausqterra@gmail.com", "Klaus (dev)");
  }

  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer: `https://securetoken.google.com/${PROJECT_ID}`,
      audience: PROJECT_ID,
    });

    const uid = String(payload.user_id ?? payload.sub ?? "");
    if (!uid) throw new Error("Token sem uid");

    return upsertUser(
      uid,
      typeof payload.email === "string" ? payload.email : null,
      typeof payload.name === "string"
        ? payload.name
        : typeof payload.email === "string"
          ? payload.email
          : null,
    );
  } catch (cause) {
    const err = new Error("Invalid Firebase token");
    (err as Error & { statusCode: number; cause?: unknown }).statusCode = 401;
    (err as Error & { cause?: unknown }).cause = cause;
    throw err;
  }
}
