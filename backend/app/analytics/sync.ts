import { Reel } from "../utils/models/reels-modal";
import { fetchReelAnalytics } from "./instagram";

export async function syncAllReelAnalytics(): Promise<number> {
  const reels = await Reel.find({ instagramMediaId: { $exists: true, $ne: null } });

  let updated = 0;
  for (const reel of reels) {
    const analytics = await fetchReelAnalytics(reel.instagramMediaId);
    reel.analytics = analytics;
    await reel.save();
    console.log(
      `[Analytics] ${reel.instagramMediaId} → views: ${analytics.views}, saves: ${analytics.saved}, avg_watch: ${(analytics.avg_watch_time_ms / 1000).toFixed(1)}s`
    );
    updated++;
  }

  return updated;
}
