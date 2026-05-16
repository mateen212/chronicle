"use client";
export default function CollectionDetailError() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
      <p className="text-xl font-semibold">Collection not found</p>
      <p className="text-sm text-muted-foreground">This collection may have been deleted or you don&apos;t have access.</p>
    </div>
  );
}
