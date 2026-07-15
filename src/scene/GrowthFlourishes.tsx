import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import type { GrowthDay, PlantPlan } from "../core/growth/types";

type StageVisual = {
  petalRings: number;
  haloRings: number;
  sparkles: number;
  budScale: number;
};

const STAGE_VISUALS: Record<GrowthDay, StageVisual> = {
  1: { petalRings: 0, haloRings: 0, sparkles: 0, budScale: 0.62 },
  3: { petalRings: 1, haloRings: 0, sparkles: 1, budScale: 0.78 },
  7: { petalRings: 1, haloRings: 1, sparkles: 4, budScale: 0.92 },
  14: { petalRings: 2, haloRings: 2, sparkles: 8, budScale: 1.06 },
  30: { petalRings: 3, haloRings: 3, sparkles: 14, budScale: 1.2 },
};

const QUALITY_SPARKLE_LIMIT = { low: 5, medium: 9, high: 14 } as const;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

function FlowerRing({ plan, ring }: { plan: PlantPlan; ring: number }) {
  const count = plan.identity.symmetry + ring * 2;
  const radius = 0.18 + ring * 0.1;
  const color = plan.identity.palette[ring % 2] ?? plan.identity.palette[0];
  return Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2 + ring * 0.34;
    return (
      <mesh
        key={`${ring}-${index}`}
        position={[Math.cos(angle) * radius, ring * 0.035, Math.sin(angle) * radius]}
        rotation={[0.16, -angle, 0.08]}
        scale={[0.7 + ring * 0.08, 0.34, 1.2 + ring * 0.13]}
      >
        <sphereGeometry args={[0.18, 12, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.08 + plan.identity.glow * 0.34}
          roughness={0.52}
        />
      </mesh>
    );
  });
}

export function GrowthFlourishes({
  plan,
  quality,
  reducedMotion,
}: {
  plan: PlantPlan;
  quality: "low" | "medium" | "high";
  reducedMotion: boolean;
}) {
  const orbit = useRef<Group>(null);
  const visual = STAGE_VISUALS[plan.stage.day];
  const sparkleCount = Math.min(visual.sparkles, QUALITY_SPARKLE_LIMIT[quality]);

  useFrame(({ clock }) => {
    if (!orbit.current || reducedMotion) return;
    orbit.current.rotation.y = clock.elapsedTime * 0.08;
  });

  return (
    <group ref={orbit}>
      <group position={[0, 1.68, 0]} scale={visual.budScale}>
        {Array.from({ length: visual.petalRings }, (_, ring) => (
          <FlowerRing key={ring} plan={plan} ring={ring} />
        ))}
        <mesh>
          <sphereGeometry args={[0.13, 16, 12]} />
          <meshStandardMaterial
            color={plan.identity.palette[1]}
            emissive={plan.identity.palette[0]}
            emissiveIntensity={0.18 + plan.identity.glow * 0.5}
            roughness={0.38}
          />
        </mesh>
      </group>

      {Array.from({ length: visual.haloRings }, (_, index) => (
        <mesh key={index} position={[0, 1.67 + index * 0.035, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.54 + index * 0.18, 0.012 + index * 0.004, 8, 48]} />
          <meshBasicMaterial
            color={plan.identity.palette[index % 2] ?? plan.identity.palette[0]}
            opacity={0.32 - index * 0.06}
            transparent
            toneMapped={false}
          />
        </mesh>
      ))}

      {Array.from({ length: sparkleCount }, (_, index) => {
        const angle = index * GOLDEN_ANGLE;
        const radius = 0.5 + (index % 4) * 0.15;
        const color = plan.identity.palette[index % 2] ?? plan.identity.palette[0];
        return (
          <mesh
            key={index}
            position={[
              Math.cos(angle) * radius,
              1.02 + (index % 5) * 0.22,
              Math.sin(angle) * radius,
            ]}
          >
            <sphereGeometry args={[0.035 + (index % 3) * 0.012, 9, 7]} />
            <meshBasicMaterial color={color} toneMapped={false} />
          </mesh>
        );
      })}
    </group>
  );
}
