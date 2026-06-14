"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  likes: { label: "Likes", color: "var(--chart-1)" },
  comments: { label: "Comments", color: "var(--chart-2)" },
  saved: { label: "Saved", color: "var(--chart-3)" },
  shares: { label: "Shares", color: "var(--chart-4)" },
} satisfies ChartConfig;

interface EngagementChartData {
  topic: string;
  likes: number;
  comments: number;
  saved: number;
  shares: number;
}

export function EngagementChart({ data }: { data: EngagementChartData[] }) {
  return (
    <ChartContainer config={chartConfig} className="h-[260px] w-full">
      <BarChart data={data} accessibilityLayer barGap={1}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="topic"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fontSize: 10 }}
        />
        <YAxis tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 10 }} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="likes" fill="var(--color-likes)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="comments" fill="var(--color-comments)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="saved" fill="var(--color-saved)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="shares" fill="var(--color-shares)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
