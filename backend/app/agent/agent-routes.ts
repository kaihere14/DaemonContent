import { scriptAgentController } from "./agent-controller";

export const agentRoutes = {
  "/agent/script-generation": {
    POST: scriptAgentController,
  },
} satisfies Record<string, Record<string, (req: Request) => Promise<Response>>>;
