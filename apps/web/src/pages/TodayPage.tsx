import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { pickIcebreaker, type ChatMessage, type ChatSession, type ConversationTopic } from "@memora/shared";
import { apiGet, apiPost, streamMessage } from "../lib/api";
import { friendlyApiMessage, memoryTypeLabel } from "../lib/format";

export function TodayPage() {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState("");
  const [busy, setBusy] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [finishedTitle, setFinishedTitle] = useState<string | null>(null);
  const [finishedSummary, setFinishedSummary] = useState<string | null>(null);
  const [finishedTopics, setFinishedTopics] = useState<ConversationTopic[]>([]);

  const icebreaker = useMemo(() => pickIcebreaker(), []);
  const dateLabel = useMemo(
    () =>
      new Date().toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
    [],
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoadingSession(true);
      try {
        const sessions = await apiGet<ChatSession[]>("/api/v1/chat/sessions");
        const active = sessions.find((s) => s.status === "active");
        if (!active || cancelled) return;
        const detail = await apiGet<{ session: ChatSession; messages: ChatMessage[] }>(
          `/api/v1/chat/sessions/${active.id}`,
        );
        if (cancelled) return;
        setSession(detail.session);
        setMessages(detail.messages.filter((m) => m.role === "user" || m.role === "assistant"));
      } catch (err) {
        if (!cancelled) setError(friendlyApiMessage(err));
      } finally {
        if (!cancelled) setLoadingSession(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function startSession() {
    setError(null);
    setFinishedTitle(null);
    setFinishedSummary(null);
    setFinishedTopics([]);
    setBusy(true);
    try {
      const created = await apiPost<ChatSession>("/api/v1/chat/sessions");
      setSession(created);
      setMessages([]);
      setStreaming("");
    } catch (err) {
      setError(friendlyApiMessage(err));
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
      setError(friendlyApiMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function finishSession() {
    if (!session) return;
    setBusy(true);
    setError(null);
    try {
      const result = await apiPost<{
        entry: { title: string; summary: string };
        topics: ConversationTopic[];
      }>(`/api/v1/chat/sessions/${session.id}/finish`);
      setFinishedTitle(result.entry.title);
      setFinishedSummary(result.entry.summary);
      setFinishedTopics(result.topics ?? []);
      setSession(null);
      setMessages([]);
      setStreaming("");
    } catch (err) {
      setError(friendlyApiMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const headline = session?.icebreaker ?? icebreaker;

  return (
    <div>
      <p className="muted" style={{ textTransform: "capitalize", marginBottom: 8 }}>
        {dateLabel}
      </p>
      <h1 className="serif" style={{ fontSize: "clamp(34px, 5vw, 48px)", marginTop: 0 }}>
        {headline}
      </h1>

      {loadingSession && <p className="muted">Procurando conversa em aberto…</p>}

      {!loadingSession && !session && (
        <div style={{ marginTop: 24 }}>
          <button className="btn btn-primary" onClick={() => void startSession()} disabled={busy}>
            Começar conversa
          </button>
          {finishedTitle && (
            <div style={{ marginTop: 20 }}>
              <p style={{ margin: "0 0 8px" }}>
                Sessão salva: <strong>{finishedTitle}</strong>
                {" · "}
                <Link to="/app/timeline">Ver na Timeline</Link>
                {" · "}
                <Link to="/app/memories">Ver memórias</Link>
              </p>
              {finishedSummary && (
                <p className="muted" style={{ marginTop: 0 }}>
                  {finishedSummary}
                </p>
              )}
              {finishedTopics.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div className="muted" style={{ fontSize: 13, marginBottom: 8 }}>
                    Assuntos extraídos
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {finishedTopics.map((topic) => (
                      <span
                        key={`${topic.category}-${topic.label}`}
                        style={{
                          fontSize: 13,
                          border: "1px dashed var(--gold)",
                          background: "#f3ead4",
                          padding: "8px 12px",
                          borderRadius: 999,
                        }}
                      >
                        {memoryTypeLabel(topic.category)} · {topic.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
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
          {messages.length === 0 && !streaming && (
            <p className="muted" style={{ marginTop: 0 }}>
              Responda ao quebra-gelo acima — ou comece por qualquer memória do dia.
            </p>
          )}

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

      {error && <p style={{ color: "#8f3d2c", marginTop: 16 }}>{error}</p>}
    </div>
  );
}
