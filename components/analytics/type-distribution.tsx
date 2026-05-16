"use client";

import { motion } from "framer-motion";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type Props = { data: { type: string; count: number }[] };

export function TypeDistributionChart({ data }: Props) {
  return (
    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <ResponsiveContainer width="100%" height={220}>
        <RadarChart data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.1)" />
          <PolarAngleAxis
            dataKey="type"
            tick={{ fontSize: 12, fill: "rgba(255,255,255,0.6)" }}
            className="capitalize"
          />
          <Radar dataKey="count" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
          <Tooltip
            contentStyle={{
              background: "rgba(15,15,35,0.9)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
