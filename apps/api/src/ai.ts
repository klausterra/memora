import { existsSync } from "node:fs";
import { GoogleAuth } from "google-auth-library";

const SYSTEM_PROMPT = `Você é o Memora, uma memória pessoal inteligente.
Fale pouco. Reaja ao conteúdo antes de perguntar.
Faça no máximo uma pergunta por vez.
Não faça interrogatório. Não peça tags, humor ou categorias.
Tom calmo, humano, editorial. Respostas curtas (2-4 frases).`;

type ChatTurn = { role: "user" | "assistant"; content: string };

type VertexConfig = {
  project: string;
  location: string;
  model: string;
};

function vertexConfig(): VertexConfig {
  return {
    project: process.env.VERTEX_PROJECT ?? process.env.GCP_PROJECT_ID ?? "hipercube-500101",
    location: process.env.VERTEX_LOCATION ?? "us-central1",
    model: process.env.VERTEX_MODEL ?? "gemini-2.5-flash",
  };
}

function vertexEnabled(): boolean {
  return (process.env.AI_BACKEND ?? "vertex").toLowerCase() !== "stub";
}

function endpoint(stream: boolean): string {
  const { project, location, model } = vertexConfig();
  const method = stream ? "streamGenerateContent" : "generateContent";
  return `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/publishers/google/models/${model}:${method}`;
}

let authClient: GoogleAuth | null = null;

function resolveGcloudBin(): string {
  if (process.platform !== "win32") return "gcloud";
  const candidates = [
    "C:\\Program Files (x86)\\Google\\Cloud SDK\\google-cloud-sdk\\bin\\gcloud.cmd",
    "C:\\Users\\klaus\\AppData\\Local\\Google\\Cloud SDK\\google-cloud-sdk\\bin\\gcloud.cmd",
  ];
  return candidates.find((p) => existsSync(p)) ?? "gcloud.cmd";
}

async function accessToken(): Promise<string> {
  if (process.env.VERTEX_ACCESS_TOKEN) {
    return process.env.VERTEX_ACCESS_TOKEN;
  }

  const forceAdc =
    process.env.VERTEX_FORCE_ADC === "1" || Boolean(process.env.K_SERVICE);

  // Local: prefer gcloud user (ADC global costuma apontar para outro projeto, ex. Athos)
  if (!forceAdc) {
    try {
      const { execFileSync } = await import("node:child_process");
      const bin = resolveGcloudBin();
      if (process.platform === "win32") {
        return execFileSync("cmd.exe", ["/c", bin, "auth", "print-access-token"], {
          encoding: "utf8",
          stdio: ["ignore", "pipe", "pipe"],
        }).trim();
      }
      return execFileSync(bin, ["auth", "print-access-token"], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      }).trim();
    } catch {
      // fall through to ADC
    }
  }

  // Evita SA global de outro projeto (ex. Athos) sem permissão no Hipercube
  const previousGac = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!forceAdc && previousGac) {
    delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
  }
  try {
    authClient = new GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });
    const client = await authClient.getClient();
    const token = await client.getAccessToken();
    if (!token.token) throw new Error("Vertex: sem access token");
    return token.token;
  } finally {
    if (previousGac) process.env.GOOGLE_APPLICATION_CREDENTIALS = previousGac;
  }
}

function toVertexContents(input: {
  icebreaker: string;
  history: ChatTurn[];
  latestUserMessage: string;
}): { systemInstruction: { parts: Array<{ text: string }> }; contents: Array<{ role: string; parts: Array<{ text: string }> }> } {
  const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];
  for (const m of input.history) {
    contents.push({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    });
  }
  contents.push({ role: "user", parts: [{ text: input.latestUserMessage }] });
  return {
    systemInstruction: {
      parts: [
        { text: SYSTEM_PROMPT },
        { text: `Pergunta inicial desta sessão: ${input.icebreaker}` },
      ],
    },
    contents,
  };
}

function extractText(payload: unknown): string {
  const body = payload as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const parts = body.candidates?.[0]?.content?.parts ?? [];
  return parts.map((p) => p.text ?? "").join("").trim();
}

export async function generateAssistantReply(input: {
  icebreaker: string;
  history: ChatTurn[];
  latestUserMessage: string;
}): Promise<string> {
  if (!vertexEnabled()) return stubReply(input.latestUserMessage);
  try {
    const token = await accessToken();
    const res = await fetch(endpoint(false), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...toVertexContents(input),
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 320,
        },
      }),
    });
    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`Vertex ${res.status}: ${detail.slice(0, 300)}`);
    }
    const json = (await res.json()) as unknown;
    return extractText(json) || stubReply(input.latestUserMessage);
  } catch (err) {
    console.error("[ai] vertex failed, using stub", err);
    return stubReply(input.latestUserMessage);
  }
}

export async function* streamAssistantReply(input: {
  icebreaker: string;
  history: ChatTurn[];
  latestUserMessage: string;
}): AsyncGenerator<string> {
  if (!vertexEnabled()) {
    const text = stubReply(input.latestUserMessage);
    for (const chunk of text.split(/(\s+)/)) {
      if (chunk) {
        yield chunk;
        await new Promise((r) => setTimeout(r, 18));
      }
    }
    return;
  }

  try {
    const token = await accessToken();
    const res = await fetch(endpoint(true), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...toVertexContents(input),
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 320,
        },
      }),
    });

    if (!res.ok || !res.body) {
      const detail = await res.text();
      throw new Error(`Vertex stream ${res.status}: ${detail.slice(0, 300)}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let raw = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      raw += decoder.decode(value, { stream: true });
    }

    let yielded = false;
    try {
      const parsed = JSON.parse(raw.trim()) as unknown;
      const items = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        const text = extractText(item);
        if (text) {
          yielded = true;
          yield text;
        }
      }
    } catch {
      // ignore parse errors; fall through
    }

    if (!yielded) {
      const full = await generateAssistantReply(input);
      yield full;
    }
  } catch (err) {
    console.error("[ai] vertex stream failed, using stub", err);
    const text = stubReply(input.latestUserMessage);
    for (const chunk of text.split(/(\s+)/)) {
      if (chunk) yield chunk;
    }
  }
}

function stubReply(text: string): string {
  if (/frustr|errando|trav/i.test(text)) {
    return "Parece que alguma coisa saiu diferente do que você esperava. O que mais pesou hoje?";
  }
  if (/decid|simplif/i.test(text)) {
    return "Isso já soa como uma virada. O que você não quer perder se escolher esse caminho?";
  }
  return "Ficou registrado. Se isso virasse uma frase para o seu eu daqui a um ano, qual seria?";
}

export function summarizeSession(messages: Array<{ role: string; content: string }>): {
  title: string;
  summary: string;
  content: string;
  memories: Array<{ type: string; content: string; importance: number }>;
} {
  const userBits = messages.filter((m) => m.role === "user").map((m) => m.content);
  const joined = userBits.join("\n");
  const firstLine = userBits[0]?.trim() || "Sessão de diário";
  const title = firstLine.length > 60 ? `${firstLine.slice(0, 57)}…` : firstLine;
  const summary =
    userBits.length === 0
      ? "Sessão sem mensagens do usuário."
      : `Registro de ${userBits.length} momento(s) conversado(s).`;

  const memories: Array<{ type: string; content: string; importance: number }> = [];
  const person = joined.match(/(?:com o|com a|e o|e a)\s+([A-Za-zÁÉÍÓÚÂÊÔÃáéíóúãõç]{2,})/i);
  if (person && !["projeto", "produto"].includes(person[1]!.toLowerCase())) {
    memories.push({
      type: "person",
      content: `Mencionou ${person[1]}`,
      importance: 0.72,
    });
  }
  const project = joined.match(/(?:projeto|produto|empresa|app)\s+([A-ZÁÉÍÓÚÂÊÔÃ][\w-]+)/i);
  if (project) {
    memories.push({
      type: "project",
      content: `Falou do projeto ${project[1]}`,
      importance: 0.8,
    });
  }
  if (/decid|simplif|vou|vamos/i.test(joined)) {
    memories.push({
      type: "decision",
      content: "Possível decisão em aberto registrada na sessão.",
      importance: 0.7,
    });
  }

  return { title, summary, content: joined || firstLine, memories };
}
