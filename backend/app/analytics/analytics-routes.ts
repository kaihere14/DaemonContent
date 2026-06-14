import { withErrorHandler } from "../errors/error-handler";
import {
  syncAnalytics,
  evolvePromptsHandler,
  fetchAllPostWithAnalyticsData,
} from "./analytics-controller";

export const analyticsRoutes = {
  "/analytics/sync": {
    POST: withErrorHandler(syncAnalytics),
  },
  "/analytics/evolve": {
    POST: withErrorHandler(evolvePromptsHandler),
  },
  "/analytics": {
    GET: withErrorHandler(fetchAllPostWithAnalyticsData),
  },
} satisfies Record<string, Record<string, (req: Request) => Promise<Response>>>;
