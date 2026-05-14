"use client";

import { Item } from "@prisma/client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

import { GlassCard } from "@/components/common/glass-card";
import { ProgressBar } from "@/components/common/progress-bar";
import { StatusBadge } from "@/components/common/status-badge";

export function ItemCard({ item }: { item: Item }) {
  return (
    <motion.div whileHover={{ y: -6, scale: 1.01 }} transition={{ type: "spring", stiffness: 260, damping: 18 }}>
      <Link href={`/items/${item.id}`}>
        <GlassCard className="space-y-3">
          <div className="relative h-44 overflow-hidden rounded-xl bg-white/10">
            {item.imageUrl ? (
              <motion.div whileHover={{ scale: 1.08 }} transition={{ duration: 0.45 }} className="h-full w-full">
                <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
              </motion.div>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No preview</div>
            )}
          </div>
          <div className="space-y-2">
            <p className="line-clamp-1 text-base font-semibold">{item.title}</p>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">{item.type}</span>
              <StatusBadge status={item.status} />
            </div>
            <ProgressBar current={item.progressCurrent} total={item.progressTotal} />
            {!!item.rating && <p className="text-xs text-cyan-200">Rating: {item.rating}/10</p>}
          </div>
        </GlassCard>
      </Link>
    </motion.div>
  );
}
