"use client";

import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import { Suspense, useRef, useState } from "react";
import * as THREE from "three";
import { type Item } from "@prisma/client";

interface PosterProps {
  item: Item;
  position: [number, number, number];
}

function Poster({ item, position }: PosterProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const target = hovered ? 1.08 : 1;
    meshRef.current.scale.lerp(new THREE.Vector3(target, target, target), delta * 8);
  });

  const imageUrl = (item as unknown as Record<string, unknown>).coverImage as string | null ?? item.imageUrl ?? null;

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <planeGeometry args={[1.4, 2]} />
        {imageUrl ? (
          <meshBasicMaterial>
            <SuspenseTexture url={imageUrl} />
          </meshBasicMaterial>
        ) : (
          <meshStandardMaterial color={hovered ? "#7c3aed" : "#1e1b4b"} />
        )}
      </mesh>
      {hovered && (
        <Text
          position={[0, -1.2, 0.1]}
          fontSize={0.18}
          color="#e2e8f0"
          maxWidth={1.4}
          textAlign="center"
          anchorY="top"
        >
          {item.title.slice(0, 24)}
        </Text>
      )}
    </group>
  );
}

function SuspenseTexture({ url }: { url: string }) {
  const texture = useLoader(THREE.TextureLoader, url);
  return <primitive object={texture} attach="map" />;
}

function PosterGrid({ items }: { items: Item[] }) {
  const COLS = 5;
  const GAP_X = 1.7;
  const GAP_Y = 2.3;

  return (
    <>
      {items.slice(0, 50).map((item, i) => {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        const x = (col - (COLS - 1) / 2) * GAP_X;
        const y = -(row * GAP_Y);
        return <Poster key={item.id} item={item} position={[x, y, 0]} />;
      })}
    </>
  );
}

export function PosterWall3D({ items }: { items: Item[] }) {
  // WebGL detection
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") ?? canvas.getContext("experimental-webgl");
    if (!gl) throw new Error("no webgl");
  } catch {
    return null;
  }

  return (
    <div className="h-[600px] w-full overflow-hidden rounded-2xl border border-white/10">
      <Canvas camera={{ position: [0, -3, 12], fov: 55 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <Suspense fallback={null}>
          <PosterGrid items={items} />
        </Suspense>
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minPolarAngle={Math.PI / 2}
          maxPolarAngle={Math.PI / 2}
          zoomSpeed={0.6}
        />
      </Canvas>
    </div>
  );
}
