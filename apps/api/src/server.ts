import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { registerRoutes } from "./routes.js";
import { getDb } from "./db.js";

const port = Number(process.env.PORT ?? 8787);
const host = process.env.HOST ?? "0.0.0.0";

const origins = (process.env.CORS_ORIGIN ?? "http://localhost:5173")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

async function main() {
  getDb();

  const app = Fastify({ logger: true });
  await app.register(cors, {
    origin: origins,
    credentials: true,
    allowedHeaders: ["Authorization", "Content-Type"],
  });

  await registerRoutes(app);

  await app.listen({ port, host });
  app.log.info(`Memora API on http://${host}:${port}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
