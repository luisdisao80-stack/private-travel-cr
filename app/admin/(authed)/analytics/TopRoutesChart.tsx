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
      <div className="h-72 flex items-center justify-center text-sm text-adm-faint">
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
          <CartesianGrid stroke="var(--adm-border)" strokeDasharray="3 3" horizontal={false} />
          <XAxis
            type="number"
            stroke="var(--adm-faint)"
            fontSize={11}
            tick={{ fill: "var(--adm-muted)" }}
            tickFormatter={(v: number) => `$${Math.round(v)}`}
          />
          <YAxis
            type="category"
            dataKey="route"
            stroke="var(--adm-faint)"
            fontSize={11}
            tick={{ fill: "var(--adm-muted)" }}
            width={160}
          />
          <Tooltip
            contentStyle={{
              background: "var(--adm-surface)",
              border: "1px solid var(--adm-border)",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "var(--adm-text)" }}
            cursor={{ fill: "rgba(234, 88, 12, 0.08)" }}
            formatter={(value, _name, item) => {
              const trips = (item?.payload?.trips as number | undefined) ?? 0;
              return [
                `$${Number(value ?? 0).toFixed(0)} (${trips} trip${trips === 1 ? "" : "s"})`,
                "Revenue",
              ];
            }}
          />
          <Bar dataKey="revenue" fill="var(--adm-accent)" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
