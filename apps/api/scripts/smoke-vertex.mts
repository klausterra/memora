import "dotenv/config";
import { generateAssistantReply } from "../src/ai.ts";

const t = await generateAssistantReply({
  icebreaker: "O que vale a pena guardar?",
  history: [],
  latestUserMessage: "Hoje conversei com o Joao sobre o Atlas e quero simplificar.",
});
console.log("AI:", t);
