"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";

interface ActivityDot {
  lat: number;
  lon: number;
  title: string;
  type: string;
}

const TYPE_COLORS: Record<string, string> = {
  movie: "#f59e0b",
  series: "#3b82f6",
  anime: "#ec4899",
  manga: "#8b5cf6",
  book: "#10b981",
  game: "#ef4444",
  project: "#06b6d4",
  course: "#f97316",
};

function Globe({ dots }: { dots: ActivityDot[] }) {
  const globeRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += delta * 0.25;
    }
  });

  const dotMeshes = useMemo(() => {
    return dots.map((dot, i) => {
      const phi = (90 - dot.lat) * (Math.PI / 180);
      const theta = (dot.lon + 180) * (Math.PI / 180);
      const r = 2.05;
      const x = -(r * Math.sin(phi) * Math.cos(theta));
      const z = r * Math.sin(phi) * Math.sin(theta);
      const y = r * Math.cos(phi);
      const color = TYPE_COLORS[dot.type] ?? "#ffffff";
      return { x, y, z, color, key: i };
    });
  }, [dots]);

  return (
    <>
      {/* Base sphere */}
      <mesh ref={globeRef}>
        <sphereGeometry args={[2, 48, 48]} />
        <meshStandardMaterial
          color="#0f172a"
          wireframe={false}
          transparent
          opacity={0.85}
        />
      </mesh>
      {/* Wireframe overlay */}
      <mesh>
        <sphereGeometry args={[2.01, 24, 24]} />
        <meshBasicMaterial color="#1e293b" wireframe />
      </mesh>
      {/* Activity dots */}
      {dotMeshes.map((d) => (
        <mesh key={d.key} position={[d.x, d.y, d.z]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color={d.color} emissive={d.color} emissiveIntensity={0.8} />
        </mesh>
      ))}
    </>
  );
}

export function ActivityGlobe({ activities }: { activities: Array<{ type?: string; title?: string }> }) {
  // Map activities to pseudo-random lat/lon using deterministic hash
  const dots: ActivityDot[] = useMemo(() => {
    return activities.slice(0, 60).map((a, i) => {
      const seed = i * 137.508; // golden angle
      const lat = -90 + (seed % 180);
      const lon = -180 + ((seed * 2.3) % 360);
      return { lat, lon, title: a.title ?? "", type: a.type ?? "movie" };
    });
  }, [activities]);

  if (dots.length === 0) return null;

  return (
    <div className="h-72 w-full overflow-hidden rounded-2xl border border-white/10">
      <Canvas camera={{ position: [0, 0, 5.5], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Globe dots={dots} />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
      </Canvas>
    </div>
  );
}
