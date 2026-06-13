import { routes } from "./app/app";
import { connectDB } from "./app/utils/db/connectDB";
import { seedPromptConfigs } from "./app/utils/db/seed-prompts";

await connectDB();
await seedPromptConfigs();

const server = Bun.serve({
  routes,
  port: process.env.PORT ?? 3001,
  idleTimeout: 0,
});

console.log(`[Server] Running on http://localhost:${server.port}`);
