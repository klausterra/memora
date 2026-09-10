const MEMORY_LABELS: Record<string, string> = {
  person: "Pessoa",
  project: "Projeto",
  decision: "Decisão",
  theme: "Tema",
  place: "Lugar",
  work: "Trabalho",
  relationship: "Relacionamento",
  health: "Saúde",
  money: "Dinheiro",
  emotion: "Emoção",
  idea: "Ideia",
  other: "Outro",
};

export function memoryTypeLabel(type: string): string {
  const key = type.toLowerCase();
  return MEMORY_LABELS[key] ?? type;
}

export function formatEntryDate(isoDate: string): string {
  const raw = isoDate.slice(0, 10);
  const [y, m, d] = raw.split("-").map(Number);
  if (!y || !m || !d) return isoDate;
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function friendlyApiMessage(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  if (
    /Unexpected token|Failed to fetch|NetworkError|Load failed|Not Found|<!DOCTYPE/i.test(message) ||
    message.trim() === ""
  ) {
    return "Não foi possível falar com o servidor do Memora. Tente de novo em instantes.";
  }
  if (/Not signed in|401|Invalid Firebase|token/i.test(message)) {
    return "Sua sessão expirou. Entre de novo com o Google.";
  }
  return message;
}
