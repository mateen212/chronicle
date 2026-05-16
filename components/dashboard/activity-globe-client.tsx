"use client";

import dynamic from "next/dynamic";
import React from "react";

const ActivityGlobe = dynamic(
  () => import("./activity-globe").then((m) => m.ActivityGlobe),
  {
    ssr: false,
    loading: () => <div className="h-72 w-full animate-pulse rounded-2xl bg-white/5" />,
  },
);

export function ActivityGlobeClient(props: React.ComponentProps<typeof ActivityGlobe>) {
  return <ActivityGlobe {...props} />;
}
