import { auth } from "./firebase";
import { friendlyApiMessage } from "./format";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(friendlyApiMessage(new Error(message)));
    this.status = status;
  }
}

async function authHeader(): Promise<HeadersInit> {
  const user = auth.currentUser;
  if (!user) throw new ApiError(401, "Not signed in");
  const token = await user.getIdToken();
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

async function parseEnvelope<T>(res: Response): Promise<T> {
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new ApiError(res.status || 502, "Unexpected token '<'");
  }
  let json: { success: boolean; data: T; error: string | null };
  try {
    json = (await res.json()) as { success: boolean; data: T; error: string | null };
  } catch {
    throw new ApiError(res.status || 502, "Unexpected token '<'");
  }
  if (!res.ok || !json.success) {
    throw new ApiError(res.status, json.error ?? "Request failed");
  }
  return json.data;
}

export async function apiGet<T>(path: string): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`, { headers: await authHeader() });
    return await parseEnvelope<T>(res);
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(0, err instanceof Error ? err.message : "Failed to fetch");
  }
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: await authHeader(),
      // Fastify rejects empty body when Content-Type is application/json
      body: JSON.stringify(body ?? {}),
    });
    return await parseEnvelope<T>(res);
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(0, err instanceof Error ? err.message : "Failed to fetch");
  }
}

export async function streamMessage(
  sessionId: string,
  content: string,
  handlers: {
    onDelta: (text: string) => void;
    onUserMessage?: (msg: unknown) => void;
    onAssistantMessage?: (msg: unknown) => void;
  },
): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/v1/chat/sessions/${sessionId}/messages`, {
      method: "POST",
      headers: await authHeader(),
      body: JSON.stringify({ content }),
    });
  } catch (err) {
    throw new ApiError(0, err instanceof Error ? err.message : "Failed to fetch");
  }

  if (!res.ok || !res.body) {
    const text = await res.text();
    throw new ApiError(res.status, text || "Stream failed");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";

    for (const part of parts) {
      const lines = part.split("\n");
      let event = "message";
      let data = "";
      for (const line of lines) {
        if (line.startsWith("event:")) event = line.slice(6).trim();
        if (line.startsWith("data:")) data += line.slice(5).trim();
      }
      if (!data) continue;
      const parsed = JSON.parse(data) as Record<string, unknown>;
      if (event === "delta" && typeof parsed.text === "string") handlers.onDelta(parsed.text);
      if (event === "user_message") handlers.onUserMessage?.(parsed);
      if (event === "assistant_message") handlers.onAssistantMessage?.(parsed);
      if (event === "error") throw new ApiError(500, String(parsed.message ?? "AI error"));
    }
  }
}
