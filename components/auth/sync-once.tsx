"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export function SyncUserOnce() {
  const { isSignedIn } = useUser();

  useEffect(() => {
    if (!isSignedIn) return;
    try {
      const synced = sessionStorage.getItem("chronicle_user_synced");
      if (synced) return;
      void fetch("/api/sync", { method: "POST" }).then(() => sessionStorage.setItem("chronicle_user_synced", "1")).catch(() => {});
    } catch {
      // ignore in browsers without storage
    }
  }, [isSignedIn]);

  return null;
}
