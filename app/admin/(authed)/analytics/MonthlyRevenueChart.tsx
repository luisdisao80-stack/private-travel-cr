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
      <div className="h-64 flex items-center justify-center text-sm text-adm-faint">
        No revenue in the last 12 months yet.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
          <CartesianGrid stroke="var(--adm-border)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            stroke="var(--adm-faint)"
            fontSize={11}
            tick={{ fill: "var(--adm-muted)" }}
          />
          <YAxis
            stroke="var(--adm-faint)"
            fontSize={11}
            tick={{ fill: "var(--adm-muted)" }}
            tickFormatter={(v: number) => `$${Math.round(v)}`}
          />
          <Tooltip
            contentStyle={{
              background: "var(--adm-surface)",
              border: "1px solid var(--adm-border)",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "var(--adm-text)" }}
            cursor={{ fill: "rgba(22, 163, 74, 0.08)" }}
            formatter={(value) => [`$${Number(value ?? 0).toFixed(0)}`, "Revenue"]}
          />
          <Bar dataKey="revenue" fill="var(--adm-ok)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
