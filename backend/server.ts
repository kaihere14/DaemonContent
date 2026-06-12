import { routes } from "./app/app";

const server = Bun.serve({
  routes,
  port: process.env.PORT ?? 3001,
});

console.log(`Server running on http://localhost:${server.port}`);
