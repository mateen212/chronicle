"use client";
export default function DiscoverError() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
      <p className="text-xl font-semibold">Failed to load discover</p>
      <p className="text-sm text-muted-foreground">Could not load recommendations. Please refresh.</p>
    </div>
  );
}
