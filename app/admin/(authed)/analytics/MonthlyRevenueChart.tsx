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
import type { MonthlyPoint } from "./lib/aggregate";

type Props = { data: MonthlyPoint[] };

export default function MonthlyRevenueChart({ data }: Props) {
  const hasData = data.some((d) => d.revenue > 0);
  if (!hasData) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-gray-500">
        No revenue in the last 12 months yet.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
          <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            stroke="#71717a"
            fontSize={11}
            tick={{ fill: "#a1a1aa" }}
          />
          <YAxis
            stroke="#71717a"
            fontSize={11}
            tick={{ fill: "#a1a1aa" }}
            tickFormatter={(v: number) => `$${Math.round(v)}`}
          />
          <Tooltip
            contentStyle={{
              background: "#09090b",
              border: "1px solid #27272a",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "#e4e4e7" }}
            cursor={{ fill: "rgba(22, 163, 74, 0.08)" }}
            formatter={(value) => [`$${Number(value ?? 0).toFixed(0)}`, "Revenue"]}
          />
          <Bar dataKey="revenue" fill="#16a34a" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
