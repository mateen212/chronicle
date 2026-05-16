"use client";

import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const TYPE_COLORS: Record<string, string> = {
  movie: "#6366f1", series: "#8b5cf6", anime: "#ec4899", manga: "#f43f5e",
  book: "#10b981", project: "#3b82f6", course: "#f59e0b", game: "#14b8a6",
};

type Props = { data: { type: string; avg: number }[] };

export function AvgRatingChart({ data }: Props) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">No ratings yet.</p>;
  }
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="type" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 12 }} />
          <YAxis domain={[0, 10]} stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(v) => [(v as number)?.toFixed(1) ?? "0", "avg rating"]}
            contentStyle={{
              background: "rgba(15,15,35,0.9)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
            }}
          />
          <Bar dataKey="avg" radius={[6, 6, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={TYPE_COLORS[entry.type] ?? "#6366f1"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
