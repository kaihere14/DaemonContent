import type { Post } from "@/lib/analytics";
import { fetchAnalytics } from "@/lib/analytics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ViewsChart } from "@/components/views-chart";
import { EngagementChart } from "@/components/engagement-chart";
import {
  Activity,
  Bookmark,
  Clock,
  Eye,
  Film,
  Heart,
  MessageCircle,
  Share2,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 text-muted-foreground">
          {icon}
          <CardDescription className="text-xs uppercase tracking-widest font-medium">
            {label}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold tabular-nums tracking-tight">{value}</p>
        {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function MetricPill({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-xl border border-border bg-muted/40 px-4 py-3">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <span className="text-lg font-semibold tabular-nums tracking-tight">{value}</span>
    </div>
  );
}

function PostRow({ post }: { post: Post }) {
  const a = post.analytics;
  return (
    <TableRow>
      <TableCell className="pl-6 py-3">
        <p className="max-w-[200px] text-xs font-medium leading-relaxed line-clamp-2">
          {post.topic}
        </p>
      </TableCell>
      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
        {fmtDate(post.publishedAt)}
      </TableCell>
      <TableCell className="text-right tabular-nums text-sm">{a ? fmt(a.views) : "—"}</TableCell>
      <TableCell className="text-right tabular-nums text-sm">{a ? fmt(a.reach) : "—"}</TableCell>
      <TableCell className="text-right tabular-nums text-sm">{a ? fmt(a.likes) : "—"}</TableCell>
      <TableCell className="text-right tabular-nums text-sm">{a ? fmt(a.comments) : "—"}</TableCell>
      <TableCell className="text-right tabular-nums text-sm">{a ? fmt(a.saved) : "—"}</TableCell>
      <TableCell className="text-right tabular-nums text-sm">{a ? fmt(a.shares) : "—"}</TableCell>
      <TableCell className="text-right">
        {a ? (
          <Badge variant="secondary" className="font-mono text-xs">
            {a.engagementRate.toFixed(2)}%
          </Badge>
        ) : (
          "—"
        )}
      </TableCell>
      <TableCell className="pr-6 text-right tabular-nums text-sm text-muted-foreground">
        {a ? `${a.avg_watch_time_sec.toFixed(1)}s` : "—"}
      </TableCell>
    </TableRow>
  );
}

export default async function Page() {
  let data;
  try {
    data = await fetchAnalytics();
  } catch {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2 text-destructive">
              <Activity className="h-4 w-4" />
              <CardTitle>Backend unreachable</CardTitle>
            </div>
            <CardDescription>
              Make sure the backend is running on{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">localhost:3001</code>{" "}
              and try refreshing.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const { posts, total, summary } = data;
  const postsWithAnalytics = posts.filter((p) => p.analytics !== null);
  const chartPosts = postsWithAnalytics.slice(0, 10).reverse();

  const viewsChartData = chartPosts.map((p) => ({
    topic: p.topic.length > 14 ? p.topic.slice(0, 14) + "…" : p.topic,
    views: p.analytics!.views,
    reach: p.analytics!.reach,
  }));

  const engagementChartData = chartPosts.map((p) => ({
    topic: p.topic.length > 14 ? p.topic.slice(0, 14) + "…" : p.topic,
    likes: p.analytics!.likes,
    comments: p.analytics!.comments,
    saved: p.analytics!.saved,
    shares: p.analytics!.shares,
  }));

  const best = summary.bestPerformingPost;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl space-y-8 px-6 py-10">
        {/* Header */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-muted-foreground" />
              <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
            </div>
            <p className="text-sm text-muted-foreground">Instagram Reel performance overview</p>
          </div>
          <Badge variant="outline" className="self-start text-xs sm:self-auto">
            {total} {total === 1 ? "reel" : "reels"} published
          </Badge>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            icon={<Eye className="h-3.5 w-3.5" />}
            label="Total Views"
            value={fmt(summary.totalViews)}
            sub={`across ${postsWithAnalytics.length} synced reels`}
          />
          <StatCard
            icon={<Users className="h-3.5 w-3.5" />}
            label="Total Reach"
            value={fmt(summary.totalReach)}
          />
          <StatCard
            icon={<TrendingUp className="h-3.5 w-3.5" />}
            label="Avg Engagement"
            value={`${summary.avgEngagementRate.toFixed(2)}%`}
            sub="(likes + comments + saves + shares) / reach"
          />
          <StatCard
            icon={<Film className="h-3.5 w-3.5" />}
            label="Total Posts"
            value={String(total)}
            sub={`${total - postsWithAnalytics.length} pending sync`}
          />
        </div>

        {/* Charts */}
        {chartPosts.length > 0 && (
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Views & Reach</CardTitle>
                <CardDescription>Most recent 10 reels with analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <ViewsChart data={viewsChartData} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Engagement Breakdown</CardTitle>
                <CardDescription>Likes, comments, saves & shares per reel</CardDescription>
              </CardHeader>
              <CardContent>
                <EngagementChart data={engagementChartData} />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Best performing post */}
        {best?.analytics && (
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Star className="h-3.5 w-3.5" />
                    <span className="text-xs uppercase tracking-widest font-medium">
                      Best Performing Reel
                    </span>
                  </div>
                  <CardTitle className="text-base leading-snug">{best.topic}</CardTitle>
                </div>
                <Badge variant="outline" className="shrink-0 text-xs">
                  {fmtDate(best.publishedAt)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                <MetricPill
                  icon={<Eye className="h-3.5 w-3.5" />}
                  label="Views"
                  value={fmt(best.analytics.views)}
                />
                <MetricPill
                  icon={<Users className="h-3.5 w-3.5" />}
                  label="Reach"
                  value={fmt(best.analytics.reach)}
                />
                <MetricPill
                  icon={<Heart className="h-3.5 w-3.5" />}
                  label="Likes"
                  value={fmt(best.analytics.likes)}
                />
                <MetricPill
                  icon={<MessageCircle className="h-3.5 w-3.5" />}
                  label="Comments"
                  value={fmt(best.analytics.comments)}
                />
                <MetricPill
                  icon={<Bookmark className="h-3.5 w-3.5" />}
                  label="Saved"
                  value={fmt(best.analytics.saved)}
                />
                <MetricPill
                  icon={<Share2 className="h-3.5 w-3.5" />}
                  label="Shares"
                  value={fmt(best.analytics.shares)}
                />
                <MetricPill
                  icon={<Clock className="h-3.5 w-3.5" />}
                  label="Avg Watch"
                  value={`${best.analytics.avg_watch_time_sec.toFixed(1)}s`}
                />
              </div>
              <Separator />
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {best.caption}
              </p>
            </CardContent>
          </Card>
        )}

        {/* All posts table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Reels</CardTitle>
                <CardDescription>
                  {postsWithAnalytics.length} of {total} have analytics synced
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                <Film className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No reels published yet</p>
              </div>
            ) : (
              <ScrollArea className="h-[480px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6 w-[220px]">Topic</TableHead>
                      <TableHead>Published</TableHead>
                      <TableHead className="text-right">Views</TableHead>
                      <TableHead className="text-right">Reach</TableHead>
                      <TableHead className="text-right">Likes</TableHead>
                      <TableHead className="text-right">Comments</TableHead>
                      <TableHead className="text-right">Saved</TableHead>
                      <TableHead className="text-right">Shares</TableHead>
                      <TableHead className="text-right">Engagement</TableHead>
                      <TableHead className="pr-6 text-right">Watch Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.map((post) => (
                      <PostRow key={post._id} post={post} />
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
