"use client";
export default function LibraryError() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
      <p className="text-xl font-semibold">Failed to load library</p>
      <p className="text-sm text-muted-foreground">Could not load your library. Please refresh.</p>
    </div>
  );
}
