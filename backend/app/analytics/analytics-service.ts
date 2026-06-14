import { Reel, type IReelAnalytics } from "../utils/models/reels-modal";
import type {
  IPostAnalytics,
  IPostAnalyticsSummary,
  IAnalyticsDashboardResponse,
} from "../types/analytics-types";

function computeEngagementRate(a: IReelAnalytics): number {
  if (a.reach === 0) return 0;
  return ((a.likes + a.comments + a.saved + a.shares) / a.reach) * 100;
}

function mapReelToSummary(reel: any): IPostAnalyticsSummary {
  const raw: IReelAnalytics | null = reel.analytics ?? null;

  const analytics: IPostAnalytics | null = raw
    ? {
        ...raw,
        avg_watch_time_sec: raw.avg_watch_time_ms / 1000,
        engagementRate: Math.round(computeEngagementRate(raw) * 100) / 100,
      }
    : null;

  return {
    _id: reel._id.toString(),
    instagramMediaId: reel.instagramMediaId,
    topic: reel.topic,
    caption: reel.caption,
    publishedAt: reel.publishedAt,
    createdAt: reel.createdAt,
    analytics,
  };
}

export async function getAllPostsWithAnalytics(): Promise<IAnalyticsDashboardResponse> {
  const reels = await Reel.find({}).sort({ publishedAt: -1 }).lean();

  const posts: IPostAnalyticsSummary[] = reels.map(mapReelToSummary);

  const withAnalytics = posts.filter((p) => p.analytics !== null);

  const totalViews = withAnalytics.reduce((sum, p) => sum + (p.analytics?.views ?? 0), 0);
  const totalReach = withAnalytics.reduce((sum, p) => sum + (p.analytics?.reach ?? 0), 0);

  const avgEngagementRate =
    withAnalytics.length > 0
      ? Math.round(
          (withAnalytics.reduce((sum, p) => sum + (p.analytics?.engagementRate ?? 0), 0) /
            withAnalytics.length) *
            100
        ) / 100
      : 0;

  const bestPerformingPost =
    withAnalytics.length > 0
      ? withAnalytics.reduce((best, p) =>
          (p.analytics?.views ?? 0) > (best.analytics?.views ?? 0) ? p : best
        )
      : null;

  return {
    posts,
    total: posts.length,
    summary: {
      totalViews,
      totalReach,
      avgEngagementRate,
      bestPerformingPost,
    },
  };
}
