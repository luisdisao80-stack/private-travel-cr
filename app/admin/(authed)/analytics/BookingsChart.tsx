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
      <div className="h-64 flex items-center justify-center text-sm text-gray-500">
        No bookings in the last 30 days yet.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
          <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            stroke="#71717a"
            fontSize={11}
            interval="preserveStartEnd"
            minTickGap={24}
            tick={{ fill: "#a1a1aa" }}
          />
          <YAxis
            stroke="#71717a"
            fontSize={11}
            tick={{ fill: "#a1a1aa" }}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              background: "#09090b",
              border: "1px solid #27272a",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "#e4e4e7" }}
            formatter={(value) => [`${Number(value ?? 0)}`, "Bookings"]}
          />
          <Line
            type="monotone"
            dataKey="bookings"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ r: 2, fill: "#f59e0b" }}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
