"use client";

import { motion } from "framer-motion";

type AnimatedSectionProps = {
  children: React.ReactNode;
  delay?: number;
  className?: string;
};

export function AnimatedSection({ children, delay = 0, className }: AnimatedSectionProps) {
  return (
    <motion.section
      className={className}
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
    >
      {children}
    </motion.section>
  );
}
