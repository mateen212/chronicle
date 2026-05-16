"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const TYPE_COLORS: Record<string, string> = {
  movie: "#6366f1",
  series: "#8b5cf6",
  anime: "#ec4899",
  manga: "#f43f5e",
  book: "#10b981",
  project: "#3b82f6",
  course: "#f59e0b",
  game: "#14b8a6",
};

type Props = {
  data: Array<{ type: string; count: number }>;
};

export function ProfileStats({ data }: Props) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">No data yet.</p>;
  }

  const chartData = data.map((d) => ({ name: d.type, value: d.count }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={TYPE_COLORS[entry.name] ?? "#6366f1"}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [value as number, "items"]}
          contentStyle={{
            background: "rgba(15,15,35,0.9)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "12px",
          }}
        />
        <Legend
          formatter={(value) => (
            <span className="capitalize text-sm">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
