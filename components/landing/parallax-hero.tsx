"use client";

import { useScroll, useTransform, motion } from "framer-motion";
import { useRef } from "react";

export function ParallaxHero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const y1 = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["0%", "60%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <div ref={ref} className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Slow-drifting gradient orbs */}
      <motion.div
        style={{ y: y1, opacity }}
        className="absolute left-[10%] top-[15%] h-72 w-72 rounded-full bg-violet-600/30 blur-[80px]"
      />
      <motion.div
        style={{ y: y2, opacity }}
        className="absolute right-[15%] top-[25%] h-56 w-56 rounded-full bg-cyan-500/25 blur-[80px]"
      />
      <motion.div
        style={{ y: y1, opacity }}
        className="absolute bottom-[10%] left-[40%] h-64 w-64 rounded-full bg-indigo-500/20 blur-[80px]"
      />
    </div>
  );
}
