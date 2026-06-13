import { AppError } from "../errors/app-error";
import type { IReelAnalytics } from "../utils/models/reels-modal";

const INSTAGRAM_API = "https://graph.instagram.com/v25.0";
const METRICS = "views,reach,saved,shares,comments,likes,ig_reels_avg_watch_time";

interface InsightItem {
  name: string;
  values: [{ value: number }];
}

interface InsightsResponse {
  data?: InsightItem[];
  error?: { message: string };
}

export async function fetchReelAnalytics(reelId: string): Promise<IReelAnalytics> {
  const token = process.env.META_ACCESS_TOKEN;
  const url = `${INSTAGRAM_API}/${reelId}/insights?metric=${METRICS}&access_token=${token}`;

  const res = await fetch(url);
  const json = (await res.json()) as InsightsResponse;

  if (!res.ok || !json.data) {
    throw new AppError(
      `Instagram API error for reel ${reelId}: ${json.error?.message ?? res.statusText}`,
      500
    );
  }

  const map: Record<string, number> = {};
  for (const item of json.data) {
    map[item.name] = item.values[0].value;
  }

  return {
    views: map["views"] ?? 0,
    reach: map["reach"] ?? 0,
    saved: map["saved"] ?? 0,
    shares: map["shares"] ?? 0,
    comments: map["comments"] ?? 0,
    likes: map["likes"] ?? 0,
    avg_watch_time_ms: map["ig_reels_avg_watch_time"] ?? 0,
    fetched_at: new Date(),
  };
}
