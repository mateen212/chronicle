"use client"
export default function AnalyticsError() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
      <p className="text-xl font-semibold">Failed to load analytics</p>
      <p className="text-sm text-muted-foreground">An error occurred while loading your analytics. Please refresh.</p>
    </div>
  );
}
