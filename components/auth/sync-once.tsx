"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

export function SyncUserOnce() {
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    try {
      const synced = sessionStorage.getItem("chronicle_user_synced");
      if (synced) return;
      void fetch("/api/sync", { method: "POST" })
        .then(() => sessionStorage.setItem("chronicle_user_synced", "1"))
        .catch(() => {});
    } catch {
      // ignore in browsers without storage
    }
  }, [isLoaded, isSignedIn]);

  return null;
}
