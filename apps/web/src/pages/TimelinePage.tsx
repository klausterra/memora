import { useEffect, useState } from "react";
import { apiGet } from "../lib/api";
import type { JournalEntry } from "@memora/shared";

export function TimelinePage() {
  const [items, setItems] = useState<JournalEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void apiGet<JournalEntry[]>("/api/v1/timeline")
      .then(setItems)
      .catch((err: Error) => setError(err.message));
  }, []);

  return (
    <div>
      <h1 className="serif" style={{ fontSize: 40, marginTop: 0 }}>
        Minha história
      </h1>
      {error && <p style={{ color: "#8f3d2c" }}>{error}</p>}
      {!error && items.length === 0 && <p className="muted">Ainda não há entradas. Converse em Hoje.</p>}
      <div style={{ display: "grid", gap: 14, marginTop: 20 }}>
        {items.map((item) => (
          <article
            key={item.id}
            style={{
              borderTop: "1px solid var(--line)",
              paddingTop: 14,
            }}
          >
            <div className="muted" style={{ fontSize: 13 }}>
              {item.entryDate}
            </div>
            <h2 className="serif" style={{ fontSize: 24, margin: "6px 0" }}>
              {item.title}
            </h2>
            <p style={{ margin: 0, color: "var(--ink-soft)" }}>{item.summary}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
