"use client";
export default function ImportError() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
      <p className="text-xl font-semibold">Import error</p>
      <p className="text-sm text-muted-foreground">Something went wrong. Please refresh and try again.</p>
    </div>
  );
}
