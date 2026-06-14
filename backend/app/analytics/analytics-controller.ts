import { syncAllReelAnalytics } from "./sync";
import { evolvePrompts } from "./evolve";
import { getAllPostsWithAnalytics } from "./analytics-service";

export const syncAnalytics = async (_req: Request): Promise<Response> => {
  const count = await syncAllReelAnalytics();
  return Response.json({ updated: count });
};

export const evolvePromptsHandler = async (_req: Request): Promise<Response> => {
  const result = await evolvePrompts();
  return Response.json({ updated: true, ...result });
};

export const fetchAllPostWithAnalyticsData = async (_req: Request): Promise<Response> => {
  const data = await getAllPostsWithAnalytics();
  return Response.json(data);
};
