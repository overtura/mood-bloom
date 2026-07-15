import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import type { PlantPlan } from "../core/growth/types";
import { ArchetypeAccents } from "./ArchetypeAccents";

export function Plant({ plan, quality, reducedMotion }: { plan: PlantPlan; quality: "low" | "medium" | "high"; reducedMotion: boolean }) {
  const group = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!group.current || reducedMotion) return;
    group.current.rotation.z = Math.sin(clock.elapsedTime * 0.7) * plan.identity.motion;
  });

  return (
    <group ref={group} scale={plan.stage.scale}>
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.48, 0.38, 0.52, 20]} />
        <meshStandardMaterial color="#b98568" roughness={0.82} />
      </mesh>
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.075, 0.11, 1.55, 10]} />
        <meshStandardMaterial color={plan.identity.palette[2]} roughness={0.76} />
      </mesh>
      {plan.branchAngles.map((angle, index) => (
        <group key={`${angle}-${index}`} position={[0, 0.65 + index * 0.105, 0]} rotation={[0, angle, angle * 0.24]}>
          <mesh position={[0.24, 0.18, 0]} rotation={[0, 0, -0.78]}>
            <cylinderGeometry args={[0.026, 0.045, 0.62, 8]} />
            <meshStandardMaterial color={plan.identity.palette[2]} roughness={0.8} />
          </mesh>
        </group>
      ))}
      <ArchetypeAccents plan={plan} quality={quality} />
      <pointLight position={[0, 1.8, 0]} color={plan.identity.palette[0]} intensity={plan.identity.glow} distance={3} />
    </group>
  );
}
