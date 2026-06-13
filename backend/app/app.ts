import { agentRoutes } from "./agent/agent-routes";
import { analyticsRoutes } from "./analytics/analytics-routes";
import path from "path";

const OUTPUTS_DIR = path.resolve(import.meta.dir, "../outputs");

export const routes = {
  "/": {
    GET: () => Response.json({ message: "Server is running" }),
  },
  "/outputs/:filename": {
    GET: async (req: Request & { params: { filename: string } }) => {
      const file = Bun.file(path.join(OUTPUTS_DIR, req.params.filename));
      if (!(await file.exists())) return new Response("Not found", { status: 404 });
      return new Response(file);
    },
  },
  ...agentRoutes,
  ...analyticsRoutes,
};
