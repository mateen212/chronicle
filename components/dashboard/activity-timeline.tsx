"use client";

import { ActivityAction } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { BookOpen, CheckCircle, List, Star, TrendingUp } from "lucide-react";

import { GlassCard } from "@/components/common/glass-card";

type TimelineActivity = {
  id: string;
  action: ActivityAction;
  createdAt: Date;
  item?: { title: string } | null;
};

const actionLabels: Record<ActivityAction, string> = {
  item_created: "added a new item",
  progress_updated: "updated progress",
  status_changed: "changed status",
  rating_changed: "updated rating",
  item_completed: "completed an item",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const actionIcons: Record<ActivityAction, React.FC<any>> = {
  item_created: BookOpen,
  progress_updated: TrendingUp,
  status_changed: List,
  rating_changed: Star,
  item_completed: CheckCircle,
};

const actionColors: Record<ActivityAction, string> = {
  item_created: "text-cyan-400 bg-cyan-400/15",
  progress_updated: "text-violet-400 bg-violet-400/15",
  status_changed: "text-blue-400 bg-blue-400/15",
  rating_changed: "text-yellow-400 bg-yellow-400/15",
  item_completed: "text-emerald-400 bg-emerald-400/15",
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35 } },
};

export function ActivityTimeline({ activities }: { activities: TimelineActivity[] }) {
  return (
    <GlassCard className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Recent Activity</h2>
        <p className="text-sm text-muted-foreground">Your latest Chronicle timeline events</p>
      </div>
      <motion.div className="space-y-0" variants={containerVariants} initial="hidden" animate="visible">
        {activities.map((activity, i) => {
          const Icon = actionIcons[activity.action];
          const colorClass = actionColors[activity.action];
          return (
            <motion.div key={activity.id} variants={itemVariants} className="relative flex gap-4">
              {/* Connector line */}
              {i < activities.length - 1 && (
                <div className="absolute left-[19px] top-8 bottom-0 w-px bg-white/10" />
              )}
              <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${colorClass}`}>
                {Icon && <Icon className="h-4 w-4" />}
              </div>
              <div className="flex-1 pb-4">
                <p className="text-sm font-medium">
                  You {actionLabels[activity.action]}
                  {activity.item?.title ? (
                    <span className="text-cyan-300"> {activity.item.title}</span>
                  ) : (
                    ""
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(activity.createdAt, { addSuffix: true })}
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </GlassCard>
  );
}
