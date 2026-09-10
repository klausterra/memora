import { useEffect, useState } from "react";
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

  return (
    <div>
      <h1 className="serif" style={{ fontSize: 40, marginTop: 0 }}>
        Memórias
      </h1>
      {error && <p style={{ color: "#8f3d2c" }}>{error}</p>}
      {!error && items.length === 0 && (
        <p className="muted">
          As memórias aparecem ao encerrar uma conversa em{" "}
          <Link to="/app">Hoje</Link>.
        </p>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 20 }}>
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              border: "1px dashed var(--gold)",
              background: "#f3ead4",
              borderRadius: 16,
              padding: "10px 14px",
              maxWidth: 320,
            }}
          >
            <div style={{ fontSize: 12, letterSpacing: "0.08em", color: "var(--ink-soft)" }}>
              {memoryTypeLabel(item.memoryType)}
              {item.createdAt ? ` · ${formatEntryDate(item.createdAt)}` : ""}
            </div>
            <div style={{ marginTop: 4 }}>{item.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
