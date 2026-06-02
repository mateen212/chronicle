export default function DiscoverLoading() {
  return (
    <div className="space-y-6">
      <div className="h-28 w-full animate-pulse rounded-3xl bg-popover/6" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-64 animate-pulse rounded-2xl bg-popover/6" />
        ))}
      </div>
    </div>
  );
}
