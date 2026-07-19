"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { RouteAggregate } from "./lib/aggregate";

type Props = { data: RouteAggregate[] };

export default function TopRoutesChart({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center text-sm text-gray-500">
        No route revenue in the last 30 days yet.
      </div>
    );
  }

  // Reverse so the biggest bar sits at the top when layout is horizontal.
  const chartData = [...data].reverse();
  const rowHeight = 32;
  const chartHeight = Math.max(chartData.length * rowHeight + 32, 200);

  return (
    <div className="w-full" style={{ height: chartHeight }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 4, right: 24, left: 4, bottom: 4 }}
        >
          <CartesianGrid stroke="#27272a" strokeDasharray="3 3" horizontal={false} />
          <XAxis
            type="number"
            stroke="#71717a"
            fontSize={11}
            tick={{ fill: "#a1a1aa" }}
            tickFormatter={(v: number) => `$${Math.round(v)}`}
          />
          <YAxis
            type="category"
            dataKey="route"
            stroke="#71717a"
            fontSize={11}
            tick={{ fill: "#a1a1aa" }}
            width={160}
          />
          <Tooltip
            contentStyle={{
              background: "#09090b",
              border: "1px solid #27272a",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "#e4e4e7" }}
            cursor={{ fill: "rgba(234, 88, 12, 0.08)" }}
            formatter={(value, _name, item) => {
              const trips = (item?.payload?.trips as number | undefined) ?? 0;
              return [
                `$${Number(value ?? 0).toFixed(0)} (${trips} trip${trips === 1 ? "" : "s"})`,
                "Revenue",
              ];
            }}
          />
          <Bar dataKey="revenue" fill="#ea580c" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
