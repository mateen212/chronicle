"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";

interface DataPoint {
  rating: number;
  progress: number;
  type: string;
  title: string;
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

function Axes() {
  return (
    <>
      {/* X axis - Rating */}
      <line>
        <bufferGeometry onUpdate={(g) => {
          const pts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(10, 0, 0)];
          g.setFromPoints(pts);
        }} />
        <lineBasicMaterial color="#475569" />
      </line>
      {/* Y axis - Progress */}
      <line>
        <bufferGeometry onUpdate={(g) => {
          const pts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 10, 0)];
          g.setFromPoints(pts);
        }} />
        <lineBasicMaterial color="#475569" />
      </line>
      {/* Z axis - Type */}
      <line>
        <bufferGeometry onUpdate={(g) => {
          const pts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 10)];
          g.setFromPoints(pts);
        }} />
        <lineBasicMaterial color="#475569" />
      </line>
      <Text position={[11, 0, 0]} fontSize={0.5} color="#94a3b8">Rating</Text>
      <Text position={[0, 11, 0]} fontSize={0.5} color="#94a3b8">Progress</Text>
      <Text position={[0, 0, 11]} fontSize={0.5} color="#94a3b8">Type</Text>
    </>
  );
}

function DataSphere({ point, index }: { point: DataPoint; index: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const color = TYPE_COLORS[point.type] ?? "#ffffff";

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = (point.progress / 100) * 9 + Math.sin(state.clock.elapsedTime + index) * 0.05;
    }
  });

  const typeIndex = Object.keys(TYPE_COLORS).indexOf(point.type);
  const z = typeIndex >= 0 ? typeIndex * 1.2 : 0;

  return (
    <mesh
      ref={meshRef}
      position={[point.rating * 1.8, (point.progress / 100) * 9, z]}
    >
      <sphereGeometry args={[0.2, 12, 12]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} transparent opacity={0.85} />
    </mesh>
  );
}

export function Stats3DScatter({ items }: { items: Array<{ type: string; title: string; rating?: number | null; progressCurrent?: number | null; progressTotal?: number | null }> }) {
  const points: DataPoint[] = useMemo(() => {
    return items
      .filter((i) => i.rating != null)
      .map((i) => {
        const progress = i.progressTotal ? Math.round(((i.progressCurrent ?? 0) / i.progressTotal) * 100) : 100;
        return {
          rating: i.rating ?? 5,
          progress,
          type: i.type,
          title: i.title,
        };
      })
      .slice(0, 200);
  }, [items]);

  if (points.length < 3) return null;

  return (
    <div className="h-80 w-full overflow-hidden rounded-2xl border border-border">
      <Canvas camera={{ position: [12, 8, 18], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[15, 15, 15]} intensity={1} />
        <Axes />
        {points.map((p, i) => (
          <DataSphere key={i} point={p} index={i} />
        ))}
        <OrbitControls enableZoom autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}
