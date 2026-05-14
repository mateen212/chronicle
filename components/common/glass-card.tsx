import { cn } from "@/lib/utils";

type GlassCardProps = {
  children: React.ReactNode;
  className?: string;
};

export function GlassCard({ children, className }: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/20 bg-white/8 p-4 shadow-[0_16px_40px_rgba(8,15,35,0.35)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5",
        className,
      )}
    >
      {children}
    </div>
  );
}
