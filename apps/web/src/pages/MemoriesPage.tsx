import { useEffect, useState } from "react";
import { apiGet } from "../lib/api";
import type { MemoryItem } from "@memora/shared";

export function MemoriesPage() {
  const [items, setItems] = useState<MemoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void apiGet<MemoryItem[]>("/api/v1/memories")
      .then(setItems)
      .catch((err: Error) => setError(err.message));
  }, []);

  return (
    <div>
      <h1 className="serif" style={{ fontSize: 40, marginTop: 0 }}>
        Memórias
      </h1>
      {error && <p style={{ color: "#8f3d2c" }}>{error}</p>}
      {!error && items.length === 0 && (
        <p className="muted">As memórias aparecem ao encerrar uma conversa.</p>
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
            <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {item.memoryType}
            </div>
            <div>{item.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
