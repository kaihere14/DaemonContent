import { agentRoutes } from "./agent/agent-routes";

export const routes = {
  "/": {
    GET: () => Response.json({ message: "Server is running" }),
  },
  ...agentRoutes,
};
