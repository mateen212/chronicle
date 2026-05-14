import { UserButton } from "@clerk/nextjs";
import { SyncUserOnce } from "@/components/auth/sync-once";

import { GradientBackground } from "@/components/common/gradient-background";
import { SearchModal } from "@/components/items/search-modal";
import { Sidebar } from "@/components/layout/sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen px-4 pb-6 pt-4 lg:px-6">
      <GradientBackground />
      <div className="mx-auto flex max-w-[1600px] gap-4">
        <Sidebar />
        <main className="min-w-0 flex-1 space-y-6">
          <header className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 backdrop-blur-xl">
              <SearchModal />
              <div className="flex items-center gap-3">
                <SyncUserOnce />
                <UserButton />
              </div>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
