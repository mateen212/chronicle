import { ActivityAction } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";

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

export function ActivityTimeline({ activities }: { activities: TimelineActivity[] }) {
  return (
    <GlassCard className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Recent Activity</h2>
        <p className="text-sm text-muted-foreground">Your latest Chronicle timeline events</p>
      </div>
      <div className="space-y-3">
        {activities.map((activity) => (
          <div key={activity.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-sm font-medium">
              You {actionLabels[activity.action]}
              {activity.item?.title ? `: ${activity.item.title}` : ""}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(activity.createdAt, { addSuffix: true })}
            </p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
