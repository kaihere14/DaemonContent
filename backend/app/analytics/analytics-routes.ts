import { withErrorHandler } from "../errors/error-handler";
import { syncAnalytics, evolvePromptsHandler } from "./analytics-controller";

export const analyticsRoutes = {
  "/analytics/sync": {
    POST: withErrorHandler(syncAnalytics),
  },
  "/analytics/evolve": {
    POST: withErrorHandler(evolvePromptsHandler),
  },
} satisfies Record<string, Record<string, (req: Request) => Promise<Response>>>;
