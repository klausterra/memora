import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { apiPost, streamMessage } from "../lib/api";
import type { ChatMessage, ChatSession } from "@memora/shared";

export function TodayPage() {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [finishedTitle, setFinishedTitle] = useState<string | null>(null);

  const dateLabel = useMemo(
    () =>
      new Date().toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
    [],
  );

  async function startSession() {
    setError(null);
    setFinishedTitle(null);
    setBusy(true);
    try {
      const created = await apiPost<ChatSession>("/api/v1/chat/sessions");
      setSession(created);
      setMessages([]);
      setStreaming("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function sendMessage(event: FormEvent) {
    event.preventDefault();
    if (!session || !draft.trim() || busy) return;
    const content = draft.trim();
    setDraft("");
    setBusy(true);
    setError(null);
    setStreaming("");

    const optimistic: ChatMessage = {
      id: `local-${Date.now()}`,
      sessionId: session.id,
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      let assistant = "";
      await streamMessage(session.id, content, {
        onDelta: (text) => {
          assistant += text;
          setStreaming(assistant);
        },
        onAssistantMessage: (msg) => {
          const m = msg as ChatMessage;
          setMessages((prev) => [...prev, m]);
          setStreaming("");
        },
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function finishSession() {
    if (!session) return;
    setBusy(true);
    setError(null);
    try {
      const result = await apiPost<{ entry: { title: string } }>(
        `/api/v1/chat/sessions/${session.id}/finish`,
      );
      setFinishedTitle(result.entry.title);
      setSession(null);
      setMessages([]);
      setStreaming("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <p className="muted" style={{ textTransform: "capitalize", marginBottom: 8 }}>
        {dateLabel}
      </p>
      <h1 className="serif" style={{ fontSize: "clamp(34px, 5vw, 48px)", marginTop: 0 }}>
        O que vale a pena guardar de hoje?
      </h1>

      {!session && (
        <div style={{ marginTop: 24 }}>
          <button className="btn btn-primary" onClick={() => void startSession()} disabled={busy}>
            Começar conversa
          </button>
          {finishedTitle && (
            <p style={{ marginTop: 16 }}>
              Sessão salva: <strong>{finishedTitle}</strong>
            </p>
          )}
        </div>
      )}

      {session && (
        <div
          style={{
            marginTop: 20,
            background: "var(--card)",
            border: "1px solid var(--line)",
            borderRadius: 28,
            padding: 20,
          }}
        >
          <p className="serif" style={{ fontSize: 24, marginTop: 0 }}>
            {session.icebreaker}
          </p>

          <div style={{ display: "grid", gap: 12, minHeight: 180 }}>
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  maxWidth: "88%",
                  marginLeft: m.role === "user" ? "auto" : 0,
                  background: m.role === "user" ? "var(--ink)" : "#efe4d3",
                  color: m.role === "user" ? "#f7f0e6" : "var(--ink)",
                  borderRadius: 16,
                  padding: "12px 14px",
                  whiteSpace: "pre-wrap",
                }}
              >
                {m.content}
              </div>
            ))}
            {streaming && (
              <div
                style={{
                  maxWidth: "88%",
                  background: "#efe4d3",
                  borderRadius: 16,
                  padding: "12px 14px",
                  whiteSpace: "pre-wrap",
                }}
              >
                {streaming}
              </div>
            )}
          </div>

          <form onSubmit={(e) => void sendMessage(e)} style={{ marginTop: 16, display: "grid", gap: 10 }}>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Comece por onde quiser…"
              rows={3}
              style={{
                width: "100%",
                borderRadius: 16,
                border: "1px solid var(--line)",
                background: "#fffaf3",
                padding: 12,
                resize: "vertical",
              }}
            />
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className="btn btn-primary" type="submit" disabled={busy || !draft.trim()}>
                Enviar
              </button>
              <button className="btn btn-ghost" type="button" onClick={() => void finishSession()} disabled={busy}>
                Encerrar e salvar
              </button>
            </div>
          </form>
        </div>
      )}

      {error && (
        <p style={{ color: "#8f3d2c", marginTop: 16 }}>
          {error}
          {/Invalid Firebase token|token/i.test(error)
            ? " — a API precisa das credenciais Firebase Admin (GOOGLE_APPLICATION_CREDENTIALS)."
            : ""}
        </p>
      )}
    </div>
  );
}
