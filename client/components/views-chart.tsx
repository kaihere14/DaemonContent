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
  views: { label: "Views", color: "var(--chart-1)" },
  reach: { label: "Reach", color: "var(--chart-2)" },
} satisfies ChartConfig;

interface ViewsChartData {
  topic: string;
  views: number;
  reach: number;
}

export function ViewsChart({ data }: { data: ViewsChartData[] }) {
  return (
    <ChartContainer config={chartConfig} className="h-[260px] w-full">
      <BarChart data={data} accessibilityLayer barGap={2}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="topic"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fontSize: 10 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fontSize: 10 }}
          tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v))}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="views" fill="var(--color-views)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="reach" fill="var(--color-reach)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
