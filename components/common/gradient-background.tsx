"use client";

import { motion } from "framer-motion";

export function GradientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-violet-500/30 blur-3xl"
        animate={{ x: [0, 25, 0], y: [0, 10, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-0 top-48 h-80 w-80 rounded-full bg-cyan-500/25 blur-3xl"
        animate={{ x: [0, -20, 0], y: [0, 24, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-100px] left-1/3 h-[24rem] w-[24rem] rounded-full bg-indigo-500/20 blur-3xl"
        animate={{ x: [0, -35, 0], y: [0, -10, 0], scale: [1, 1.06, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.06),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(0,255,255,0.08),transparent_30%),linear-gradient(180deg,rgba(10,16,35,0.9),rgba(5,8,20,1))] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(168,85,247,0.16),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(6,182,212,0.15),transparent_30%),linear-gradient(180deg,rgba(4,6,16,0.95),rgba(3,5,15,1))]" />
    </div>
  );
}
