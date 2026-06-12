import { scriptAgentController } from "./agent-controller";
import { withErrorHandler } from "../errors/error-handler";

export const agentRoutes = {
  "/agent/script-generation": {
    POST: withErrorHandler(scriptAgentController),
  },
} satisfies Record<string, Record<string, (req: Request) => Promise<Response>>>;
