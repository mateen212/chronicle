import { ChronicleStatus } from "@/types";

import { cn } from "@/lib/utils";

const statusStyles: Record<ChronicleStatus, string> = {
  planned: "bg-slate-500/30 text-slate-100",
  watching: "bg-cyan-500/25 text-cyan-100",
  reading: "bg-indigo-500/25 text-indigo-100",
  completed: "bg-emerald-500/25 text-emerald-100",
  paused: "bg-amber-500/25 text-amber-100",
  dropped: "bg-rose-500/25 text-rose-100",
};

export function StatusBadge({ status }: { status: ChronicleStatus }) {
  return (
    <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium capitalize", statusStyles[status])}>
      {status}
    </span>
  );
}
