import OpenAI from "openai";

const SYSTEM_PROMPT = `Você é o Memora, uma memória pessoal inteligente.
Fale pouco. Reaja ao conteúdo antes de perguntar.
Faça no máximo uma pergunta por vez.
Não faça interrogatório. Não peça tags, humor ou categorias.
Tom calmo, humano, editorial. Respostas curtas (2-4 frases).`;

export async function generateAssistantReply(input: {
  icebreaker: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
  latestUserMessage: string;
}): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return stubReply(input.latestUserMessage);
  }

  const client = new OpenAI({ apiKey });
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  const completion = await client.chat.completions.create({
    model,
    temperature: 0.7,
    max_tokens: 220,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "system",
        content: `Pergunta inicial desta sessão: ${input.icebreaker}`,
      },
      ...input.history.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: input.latestUserMessage },
    ],
  });

  return completion.choices[0]?.message?.content?.trim() || stubReply(input.latestUserMessage);
}

export async function* streamAssistantReply(input: {
  icebreaker: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
  latestUserMessage: string;
}): AsyncGenerator<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const text = stubReply(input.latestUserMessage);
    for (const chunk of text.split(/(\s+)/)) {
      if (chunk) {
        yield chunk;
        await new Promise((r) => setTimeout(r, 18));
      }
    }
    return;
  }

  const client = new OpenAI({ apiKey });
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const stream = await client.chat.completions.create({
    model,
    temperature: 0.7,
    max_tokens: 220,
    stream: true,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "system",
        content: `Pergunta inicial desta sessão: ${input.icebreaker}`,
      },
      ...input.history.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: input.latestUserMessage },
    ],
  });

  for await (const part of stream) {
    const delta = part.choices[0]?.delta?.content;
    if (delta) yield delta;
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
