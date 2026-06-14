import type { IReelAnalytics } from "../utils/models/reels-modal";

export interface IPostAnalytics extends IReelAnalytics {
  avg_watch_time_sec: number;
  engagementRate: number;
}

export interface IPostAnalyticsSummary {
  _id: string;
  instagramMediaId: string;
  topic: string;
  caption: string;
  publishedAt: Date;
  createdAt: Date;
  analytics: IPostAnalytics | null;
}

export interface IAnalyticsDashboardResponse {
  posts: IPostAnalyticsSummary[];
  total: number;
  summary: {
    totalViews: number;
    totalReach: number;
    avgEngagementRate: number;
    bestPerformingPost: IPostAnalyticsSummary | null;
  };
}
