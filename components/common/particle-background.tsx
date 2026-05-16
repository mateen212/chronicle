"use client";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { initParticlesEngine } = require("@tsparticles/react") as { initParticlesEngine: (cb: (engine: unknown) => Promise<void>) => Promise<void> };
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export function ParticleBackground() {
  const [init, setInit] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    void initParticlesEngine(async (engine: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await loadSlim(engine as any);
    }).then(() => setInit(true));
  }, []);

  const color = resolvedTheme === "dark" ? "#444444" : "#888888";

  if (!init) return null;

  return (
    <Particles
      className="pointer-events-none fixed inset-0 -z-10"
      options={{
        background: { color: { value: "transparent" } },
        fpsLimit: 60,
        particles: {
          number: { value: 60, density: { enable: true } },
          color: { value: color },
          opacity: { value: 0.3 },
          size: { value: { min: 1, max: 2 } },
          links: {
            enable: true,
            distance: 120,
            color: color,
            opacity: 0.15,
            width: 1,
          },
          move: { enable: true, speed: 0.6, outModes: { default: "bounce" } },
        },
        interactivity: {
          events: {
            onHover: { enable: true, mode: "repulse" },
          },
          modes: {
            repulse: { distance: 80, duration: 0.4 },
          },
        },
        detectRetina: true,
      }}
    />
  );
}
