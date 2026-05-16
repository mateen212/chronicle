export default function CollectionDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="h-28 w-full animate-pulse rounded-3xl bg-white/5" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-2xl bg-white/5" />
        ))}
      </div>
    </div>
  );
}
