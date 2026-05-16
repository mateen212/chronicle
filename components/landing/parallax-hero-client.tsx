"use client";

import dynamic from "next/dynamic";

const ParallaxHero = dynamic(
  () => import("./parallax-hero").then((m) => m.ParallaxHero),
  { ssr: false },
);

export function ParallaxHeroClient() {
  return <ParallaxHero />;
}
