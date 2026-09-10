import { config } from "dotenv";
config({ path: ".env" });

import { summarizeSessionWithAi } from "../src/ai.ts";

console.log("AI_BACKEND", process.env.AI_BACKEND, "PROJECT", process.env.VERTEX_PROJECT);

const r = await summarizeSessionWithAi([
  {
    role: "user",
    content:
      "Hoje falei com a Ana sobre o projeto Knox e decidi adiar o lançamento. Estou ansioso com o prazo.",
  },
  { role: "assistant", content: "O adiamento alivia ou só empurra a pressão?" },
  { role: "user", content: "Alivia um pouco, mas ainda penso no dinheiro do mês." },
]);

console.log(JSON.stringify(r, null, 2));
