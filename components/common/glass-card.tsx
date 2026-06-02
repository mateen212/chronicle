import { cn } from "@/lib/utils";

type GlassCardProps = {
  children: React.ReactNode;
  className?: string;
};

export function GlassCard({ children, className }: GlassCardProps) {
  return (
    <div
      className={cn("rounded-2xl p-4 backdrop-blur-sm card-soft", className)}
      style={{ background: "var(--card)", color: "var(--card-foreground)", borderColor: "var(--border)" }}
    >
      {children}
    </div>
  );
}
