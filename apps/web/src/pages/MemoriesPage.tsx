import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../lib/api";
import { formatEntryDate, friendlyApiMessage, memoryTypeLabel } from "../lib/format";
import type { MemoryItem } from "@memora/shared";

export function MemoriesPage() {
  const [items, setItems] = useState<MemoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void apiGet<MemoryItem[]>("/api/v1/memories")
      .then(setItems)
      .catch((err: Error) => setError(friendlyApiMessage(err)));
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, MemoryItem[]>();
    for (const item of items) {
      const key = item.memoryType.toLowerCase();
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0], "pt-BR"));
  }, [items]);

  return (
    <div>
      <h1 className="serif" style={{ fontSize: 40, marginTop: 0 }}>
        Memórias
      </h1>
      <p className="muted" style={{ marginTop: -8 }}>
        Assuntos e fatos extraídos das suas conversas, classificados automaticamente.
      </p>
      {error && <p style={{ color: "#8f3d2c" }}>{error}</p>}
      {!error && items.length === 0 && (
        <p className="muted">
          As memórias aparecem ao encerrar uma conversa em <Link to="/app">Hoje</Link>.
        </p>
      )}
      <div style={{ display: "grid", gap: 28, marginTop: 24 }}>
        {grouped.map(([type, list]) => (
          <section key={type}>
            <h2 style={{ fontSize: 18, margin: "0 0 12px", letterSpacing: "0.04em" }}>
              {memoryTypeLabel(type)}
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {list.map((item) => (
                <div
                  key={item.id}
                  style={{
                    border: "1px dashed var(--gold)",
                    background: "#f3ead4",
                    borderRadius: 16,
                    padding: "10px 14px",
                    maxWidth: 340,
                  }}
                >
                  <div>{item.content}</div>
                  {item.createdAt && (
                    <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>
                      {formatEntryDate(item.createdAt)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
