export default function DashboardLoading() {
  return (
    <div className="space-y-4">
      <div className="h-28 animate-pulse rounded-3xl bg-popover/6" />
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-24 animate-pulse rounded-2xl bg-popover/6" />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-72 animate-pulse rounded-2xl bg-popover/6" />
        ))}
      </div>
    </div>
  );
}
