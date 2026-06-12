import { routes } from "./app/app";
import { connectDB } from "./app/utils/db/connectDB";

await connectDB();

const server = Bun.serve({
  routes,
  port: process.env.PORT ?? 3001,
  idleTimeout: 0,
});

console.log(`Server running on http://localhost:${server.port}`);
