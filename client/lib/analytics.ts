export interface PostAnalytics {
  views: number;
  reach: number;
  saved: number;
  shares: number;
  comments: number;
  likes: number;
  avg_watch_time_ms: number;
  avg_watch_time_sec: number;
  engagementRate: number;
  fetched_at: string;
}

export interface Post {
  _id: string;
  instagramMediaId: string;
  topic: string;
  caption: string;
  publishedAt: string;
  createdAt: string;
  analytics: PostAnalytics | null;
}

export interface AnalyticsDashboard {
  posts: Post[];
  total: number;
  summary: {
    totalViews: number;
    totalReach: number;
    avgEngagementRate: number;
    bestPerformingPost: Post | null;
  };
}

const API_URL = process.env.API_URL ?? "http://localhost:3001";

export async function fetchAnalytics(): Promise<AnalyticsDashboard> {
  const res = await fetch(`${API_URL}/analytics`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Analytics fetch failed: ${res.status}`);
  return res.json() as Promise<AnalyticsDashboard>;
}
