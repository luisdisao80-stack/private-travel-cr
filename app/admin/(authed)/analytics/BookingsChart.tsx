"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { DailyPoint } from "./lib/aggregate";

type Props = { data: DailyPoint[] };

export default function BookingsChart({ data }: Props) {
  const hasData = data.some((d) => d.bookings > 0);
  if (!hasData) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-adm-faint">
        No bookings in the last 30 days yet.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
          <CartesianGrid stroke="var(--adm-border)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            stroke="var(--adm-faint)"
            fontSize={11}
            interval="preserveStartEnd"
            minTickGap={24}
            tick={{ fill: "var(--adm-muted)" }}
          />
          <YAxis
            stroke="var(--adm-faint)"
            fontSize={11}
            tick={{ fill: "var(--adm-muted)" }}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              background: "var(--adm-surface)",
              border: "1px solid var(--adm-border)",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "var(--adm-text)" }}
            formatter={(value) => [`${Number(value ?? 0)}`, "Bookings"]}
          />
          <Line
            type="monotone"
            dataKey="bookings"
            stroke="var(--adm-accent)"
            strokeWidth={2}
            dot={{ r: 2, fill: "var(--adm-accent)" }}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
