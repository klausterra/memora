export const ADMIN_EMAILS = [
  "klausqterra@gmail.com",
  "wanieleterra@gmail.com",
] as const;

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return (ADMIN_EMAILS as readonly string[]).includes(email.toLowerCase().trim());
}

export type UserRole = "user" | "admin";

export type SessionStatus = "created" | "active" | "finishing" | "finished";

export type MessageRole = "user" | "assistant" | "system";

export interface PublicUser {
  id: string;
  email: string | null;
  name: string | null;
  preferredName: string | null;
  role: UserRole;
  timezone: string;
}

export interface ChatSession {
  id: string;
  status: SessionStatus;
  icebreaker: string;
  startedAt: string;
  endedAt: string | null;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  sessionId: string | null;
  title: string;
  summary: string;
  content: string;
  entryDate: string;
  createdAt: string;
}

export interface MemoryItem {
  id: string;
  memoryType: string;
  content: string;
  importance: number;
  createdAt: string;
}

/** Categories used when classifying conversation topics */
export const TOPIC_CATEGORIES = [
  "work",
  "relationship",
  "health",
  "money",
  "emotion",
  "decision",
  "project",
  "person",
  "idea",
  "place",
  "theme",
  "other",
] as const;

export type TopicCategory = (typeof TOPIC_CATEGORIES)[number];

export interface ConversationTopic {
  label: string;
  category: TopicCategory | string;
  importance: number;
}

export const ICEBREAKERS = [
  "O que vale a pena guardar de hoje?",
  "O que ficou na sua cabeça hoje?",
  "Se hoje virasse uma página, o que estaria nela?",
  "Aconteceu alguma coisa que você gostaria de lembrar daqui a alguns anos?",
  "Tem algo que ainda está ocupando sua cabeça?",
  "Estou aqui. Comece por onde quiser.",
] as const;

export function pickIcebreaker(date = new Date()): string {
  return ICEBREAKERS[date.getDate() % ICEBREAKERS.length]!;
}
