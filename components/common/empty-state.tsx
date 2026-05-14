import { Sparkles } from "lucide-react";

import { GlassCard } from "@/components/common/glass-card";

type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <GlassCard className="flex min-h-52 flex-col items-center justify-center gap-3 text-center">
      <Sparkles className="h-8 w-8 text-cyan-300" />
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="max-w-md text-sm text-muted-foreground">{description}</p>
    </GlassCard>
  );
}
