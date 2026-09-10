import type { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import { pickIcebreaker } from "@memora/shared";
import { authenticateRequest, type AuthUser } from "./auth.js";
import { getDb, newId, nowIso } from "./db/index.js";
import { streamAssistantReply, summarizeSessionWithAi } from "./ai.js";

async function requireUser(request: FastifyRequest): Promise<AuthUser> {
  return authenticateRequest(request);
}

export async function registerRoutes(app: FastifyInstance): Promise<void> {
  app.get("/health", async () => ({ ok: true, service: "memora-api" }));

  app.get("/api/v1/me", async (request, reply) => {
    try {
      const user = await requireUser(request);
      return {
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          preferredName: user.preferredName,
          role: user.role,
          timezone: user.timezone,
        },
        error: null,
      };
    } catch (err) {
      const status = (err as { statusCode?: number }).statusCode ?? 500;
      return reply.code(status).send({ success: false, data: null, error: (err as Error).message });
    }
  });

  app.post("/api/v1/chat/sessions", async (request, reply) => {
    try {
      const user = await requireUser(request);
      const database = getDb();
      const id = newId();
      const icebreaker = pickIcebreaker();
      const startedAt = nowIso();
      await database.execute(
        `INSERT INTO journal_sessions (id, user_id, mode, status, icebreaker, started_at, ended_at)
         VALUES (?, ?, 'free', 'active', ?, ?, NULL)`,
        [id, user.id, icebreaker, startedAt],
      );

      return {
        success: true,
        data: { id, status: "active", icebreaker, startedAt, endedAt: null },
        error: null,
      };
    } catch (err) {
      const status = (err as { statusCode?: number }).statusCode ?? 500;
      return reply.code(status).send({ success: false, data: null, error: (err as Error).message });
    }
  });

  app.get("/api/v1/chat/sessions", async (request, reply) => {
    try {
      const user = await requireUser(request);
      const rows = await getDb().queryAll(
        `SELECT id, status, icebreaker, started_at as "startedAt", ended_at as "endedAt"
         FROM journal_sessions WHERE user_id = ? ORDER BY started_at DESC LIMIT 50`,
        [user.id],
      );
      return { success: true, data: rows, error: null };
    } catch (err) {
      const status = (err as { statusCode?: number }).statusCode ?? 500;
      return reply.code(status).send({ success: false, data: null, error: (err as Error).message });
    }
  });

  app.get("/api/v1/chat/sessions/:id", async (request, reply) => {
    try {
      const user = await requireUser(request);
      const { id } = request.params as { id: string };
      const session = await getDb().queryOne(
        `SELECT id, status, icebreaker, started_at as "startedAt", ended_at as "endedAt"
         FROM journal_sessions WHERE id = ? AND user_id = ?`,
        [id, user.id],
      );
      if (!session) {
        return reply.code(404).send({ success: false, data: null, error: "Session not found" });
      }
      const messages = await getDb().queryAll(
        `SELECT id, session_id as "sessionId", role, content, created_at as "createdAt"
         FROM messages WHERE session_id = ? ORDER BY created_at ASC`,
        [id],
      );
      return { success: true, data: { session, messages }, error: null };
    } catch (err) {
      const status = (err as { statusCode?: number }).statusCode ?? 500;
      return reply.code(status).send({ success: false, data: null, error: (err as Error).message });
    }
  });

  app.post("/api/v1/chat/sessions/:id/messages", async (request, reply) => {
    try {
      const user = await requireUser(request);
      const { id } = request.params as { id: string };
      const body = z.object({ content: z.string().min(1).max(8000) }).parse(request.body);

      const database = getDb();
      const session = await database.queryOne<{ id: string; status: string; icebreaker: string }>(
        `SELECT * FROM journal_sessions WHERE id = ? AND user_id = ?`,
        [id, user.id],
      );

      if (!session) {
        return reply.code(404).send({ success: false, data: null, error: "Session not found" });
      }
      if (session.status === "finished") {
        return reply.code(409).send({ success: false, data: null, error: "Session already finished" });
      }

      const history = await database.queryAll<{ role: "user" | "assistant"; content: string }>(
        `SELECT role, content FROM messages WHERE session_id = ? ORDER BY created_at ASC`,
        [id],
      );

      const userMessageId = newId();
      const userCreatedAt = nowIso();
      await database.execute(
        `INSERT INTO messages (id, session_id, role, content, created_at) VALUES (?, ?, 'user', ?, ?)`,
        [userMessageId, id, body.content, userCreatedAt],
      );

      reply.hijack();
      reply.raw.writeHead(200, {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": request.headers.origin ?? "*",
        "Access-Control-Allow-Credentials": "true",
      });

      const writeEvent = (event: string, data: unknown) => {
        reply.raw.write(`event: ${event}\n`);
        reply.raw.write(`data: ${JSON.stringify(data)}\n\n`);
      };

      writeEvent("user_message", {
        id: userMessageId,
        sessionId: id,
        role: "user",
        content: body.content,
        createdAt: userCreatedAt,
      });

      let assistantText = "";
      try {
        for await (const chunk of streamAssistantReply({
          icebreaker: session.icebreaker,
          history: history.filter((m) => m.role === "user" || m.role === "assistant"),
          latestUserMessage: body.content,
        })) {
          assistantText += chunk;
          writeEvent("delta", { text: chunk });
        }
      } catch (streamErr) {
        writeEvent("error", { message: (streamErr as Error).message });
        reply.raw.end();
        return;
      }

      const assistantId = newId();
      const assistantCreatedAt = nowIso();
      await database.execute(
        `INSERT INTO messages (id, session_id, role, content, created_at) VALUES (?, ?, 'assistant', ?, ?)`,
        [assistantId, id, assistantText, assistantCreatedAt],
      );

      writeEvent("assistant_message", {
        id: assistantId,
        sessionId: id,
        role: "assistant",
        content: assistantText,
        createdAt: assistantCreatedAt,
      });
      writeEvent("done", { ok: true });
      reply.raw.end();
    } catch (err) {
      if (!reply.raw.headersSent) {
        const status = (err as { statusCode?: number }).statusCode ?? 500;
        return reply.code(status).send({ success: false, data: null, error: (err as Error).message });
      }
      reply.raw.end();
    }
  });

  app.post("/api/v1/chat/sessions/:id/finish", async (request, reply) => {
    try {
      const user = await requireUser(request);
      const { id } = request.params as { id: string };
      const database = getDb();
      const session = await database.queryOne<{ id: string; status: string }>(
        `SELECT * FROM journal_sessions WHERE id = ? AND user_id = ?`,
        [id, user.id],
      );

      if (!session) {
        return reply.code(404).send({ success: false, data: null, error: "Session not found" });
      }
      if (session.status === "finished") {
        const entry = await database.queryOne(`SELECT * FROM journal_entries WHERE session_id = ?`, [id]);
        return { success: true, data: { entry }, error: null };
      }

      const messages = await database.queryAll<{ role: string; content: string }>(
        `SELECT role, content FROM messages WHERE session_id = ? ORDER BY created_at ASC`,
        [id],
      );

      const summarized = await summarizeSessionWithAi(messages);
      const entryId = newId();
      const createdAt = nowIso();
      const entryDate = createdAt.slice(0, 10);

      await database.execute(
        `UPDATE journal_sessions SET status = 'finished', ended_at = ? WHERE id = ? AND user_id = ?`,
        [createdAt, id, user.id],
      );

      await database.execute(
        `INSERT INTO journal_entries (id, user_id, session_id, title, summary, content, entry_date, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          entryId,
          user.id,
          id,
          summarized.title,
          summarized.summary,
          summarized.content,
          entryDate,
          createdAt,
        ],
      );

      for (const memory of summarized.memories.filter((m) => m.importance >= 0.6)) {
        await database.execute(
          `INSERT INTO memories (id, user_id, memory_type, content, importance, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [newId(), user.id, memory.type, memory.content, memory.importance, createdAt, createdAt],
        );
      }

      return {
        success: true,
        data: {
          entry: {
            id: entryId,
            sessionId: id,
            title: summarized.title,
            summary: summarized.summary,
            content: summarized.content,
            entryDate,
            createdAt,
          },
          topics: summarized.topics,
          memoriesExtracted: summarized.memories.length,
        },
        error: null,
      };
    } catch (err) {
      const status = (err as { statusCode?: number }).statusCode ?? 500;
      return reply.code(status).send({ success: false, data: null, error: (err as Error).message });
    }
  });

  app.get("/api/v1/journal", async (request, reply) => {
    try {
      const user = await requireUser(request);
      const rows = await getDb().queryAll(
        `SELECT id, session_id as "sessionId", title, summary, content, entry_date as "entryDate", created_at as "createdAt"
         FROM journal_entries WHERE user_id = ? ORDER BY entry_date DESC, created_at DESC LIMIT 100`,
        [user.id],
      );
      return { success: true, data: rows, error: null };
    } catch (err) {
      const status = (err as { statusCode?: number }).statusCode ?? 500;
      return reply.code(status).send({ success: false, data: null, error: (err as Error).message });
    }
  });

  app.get("/api/v1/timeline", async (request, reply) => {
    try {
      const user = await requireUser(request);
      const rows = await getDb().queryAll(
        `SELECT id, title, summary, entry_date as "entryDate", created_at as "createdAt"
         FROM journal_entries WHERE user_id = ? ORDER BY entry_date DESC, created_at DESC LIMIT 100`,
        [user.id],
      );
      return { success: true, data: rows, error: null };
    } catch (err) {
      const status = (err as { statusCode?: number }).statusCode ?? 500;
      return reply.code(status).send({ success: false, data: null, error: (err as Error).message });
    }
  });

  app.get("/api/v1/memories", async (request, reply) => {
    try {
      const user = await requireUser(request);
      const rows = await getDb().queryAll(
        `SELECT id, memory_type as "memoryType", content, importance, created_at as "createdAt"
         FROM memories WHERE user_id = ? ORDER BY created_at DESC LIMIT 100`,
        [user.id],
      );
      return { success: true, data: rows, error: null };
    } catch (err) {
      const status = (err as { statusCode?: number }).statusCode ?? 500;
      return reply.code(status).send({ success: false, data: null, error: (err as Error).message });
    }
  });
}
