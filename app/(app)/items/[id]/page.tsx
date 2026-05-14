import { notFound } from "next/navigation";

import { updateItemAction } from "@/actions/items";
import { GlassCard } from "@/components/common/glass-card";
import { ProgressBar } from "@/components/common/progress-bar";
import { StatusBadge } from "@/components/common/status-badge";
import { requireDbUser } from "@/lib/auth";
import { ITEM_STATUSES } from "@/lib/constants";
import { prisma } from "@/lib/prisma/client";

export default async function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireDbUser();
  const { id } = await params;

  const item = await prisma.item.findFirst({
    where: { id, userId: user.id },
    include: { metadata: true },
  });

  if (!item) notFound();

  return (
    <div className="space-y-4">
      <GlassCard className="overflow-hidden p-0">
        <div className="relative h-44 bg-gradient-to-r from-violet-500/30 via-indigo-500/20 to-cyan-500/25" />
        <div className="space-y-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h1 className="text-2xl font-bold">{item.title}</h1>
              <p className="text-sm text-muted-foreground capitalize">{item.type}</p>
            </div>
            <StatusBadge status={item.status} />
          </div>

          <ProgressBar current={item.progressCurrent} total={item.progressTotal} />

          {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
          {item.notes && <p className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm">{item.notes}</p>}

          <form
            action={async (formData) => {
              "use server";
              await updateItemAction(item.id, {
                status: formData.get("status"),
                progressCurrent: Number(formData.get("progressCurrent") || 0),
                progressTotal: Number(formData.get("progressTotal") || 0),
                rating: Number(formData.get("rating") || 0) || undefined,
              });
            }}
            className="grid gap-2 md:grid-cols-4"
          >
            <select name="status" defaultValue={item.status} className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm capitalize">
              {ITEM_STATUSES.map((status) => (
                <option key={status} value={status} className="bg-slate-900">
                  {status}
                </option>
              ))}
            </select>
            <input name="progressCurrent" type="number" defaultValue={item.progressCurrent} className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm" />
            <input name="progressTotal" type="number" defaultValue={item.progressTotal ?? undefined} className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm" />
            <input name="rating" type="number" min={1} max={10} defaultValue={item.rating ?? undefined} className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm" />
            <button className="md:col-span-4 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm">Update item</button>
          </form>
        </div>
      </GlassCard>

      {item.metadata && (
        <GlassCard>
          <h2 className="mb-2 text-lg font-semibold">Metadata</h2>
          <pre className="overflow-x-auto text-xs text-muted-foreground">{JSON.stringify(item.metadata.data, null, 2)}</pre>
        </GlassCard>
      )}
    </div>
  );
}
