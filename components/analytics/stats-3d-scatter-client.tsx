"use client"

import dynamic from "next/dynamic"
import React from "react"

const Stats3DScatter = dynamic(
  () => import("./stats-3d-scatter").then((m) => m.Stats3DScatter),
  { ssr: false, loading: () => <div className="h-80 w-full animate-pulse rounded-2xl bg-white/5" /> },
)

export function Stats3DScatterClient(props: React.ComponentProps<typeof Stats3DScatter>) {
  return <Stats3DScatter {...props} />
}
