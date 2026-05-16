"use client";

export default function ItemDetailError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
      <p className="text-lg font-semibold">Failed to load item</p>
      <p className="max-w-md text-sm text-muted-foreground">{error.message}</p>
      <button onClick={reset} className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm hover:bg-white/15">Try again</button>
    </div>
  );
}
