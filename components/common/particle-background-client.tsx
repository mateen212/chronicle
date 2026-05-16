"use client";

import dynamic from "next/dynamic";
import React from "react";

const ParticleBackground = dynamic(
  () => import("./particle-background").then((m) => m.ParticleBackground),
  { ssr: false },
);

export function ParticleBackgroundClient(props: React.ComponentProps<typeof ParticleBackground>) {
  return <ParticleBackground {...props} />;
}
