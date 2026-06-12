import { withErrorHandler } from "../errors/error-handler";
import { aiDataCall, userDataCall } from "./agent-controller";

export const agentRoutes = {
  "/agent/user-generation": {
    POST: withErrorHandler(userDataCall),
  },
  "/agent/agent-generation": {
    POST: withErrorHandler(aiDataCall),
  },
} satisfies Record<string, Record<string, (req: Request) => Promise<Response>>>;
