import { auth } from "./firebase";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
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

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { headers: await authHeader() });
  const json = (await res.json()) as { success: boolean; data: T; error: string | null };
  if (!res.ok || !json.success) throw new ApiError(res.status, json.error ?? "Request failed");
  return json.data;
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: await authHeader(),
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = (await res.json()) as { success: boolean; data: T; error: string | null };
  if (!res.ok || !json.success) throw new ApiError(res.status, json.error ?? "Request failed");
  return json.data;
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
  const res = await fetch(`${API_BASE}/api/v1/chat/sessions/${sessionId}/messages`, {
    method: "POST",
    headers: await authHeader(),
    body: JSON.stringify({ content }),
  });

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
