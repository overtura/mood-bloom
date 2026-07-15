import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import type { PlantPlan } from "../core/growth/types";
import { ArchetypeAccents } from "./ArchetypeAccents";
import { GrowthFlourishes } from "./GrowthFlourishes";

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
      {plan.branchAngles.map((angle, index) => {
        const side = index % 2 === 0 ? 1 : -1;
        return (
        <group key={`${plan.dailySeed}-branch-${index}`} position={[0, 0.66 + index * 0.1, 0]} rotation={[0, angle, 0]}>
          <mesh position={[side * 0.24, 0.18, 0]} rotation={[0, 0, -side * 0.78]}>
            <cylinderGeometry args={[0.026, 0.045, 0.62, 8]} />
            <meshStandardMaterial color={plan.identity.palette[2]} roughness={0.8} />
          </mesh>
          <mesh position={[side * 0.46, 0.34, 0]} rotation={[0.08, angle * 0.12, -side * 0.55]} scale={[1.25, 0.55, 0.34]}>
            <sphereGeometry args={[0.16, 12, 8]} />
            <meshStandardMaterial color={plan.identity.palette[2]} roughness={0.66} />
          </mesh>
          <mesh position={[side * 0.29, 0.17, 0.08]} rotation={[0.16, -angle * 0.08, side * 0.7]} scale={[0.86, 0.42, 0.26]}>
            <sphereGeometry args={[0.13, 10, 7]} />
            <meshStandardMaterial color={plan.identity.palette[1]} roughness={0.7} />
          </mesh>
        </group>
        );
      })}
      <ArchetypeAccents plan={plan} quality={quality} />
      <GrowthFlourishes plan={plan} quality={quality} reducedMotion={reducedMotion} />
      <pointLight position={[0, 1.8, 0]} color={plan.identity.palette[0]} intensity={plan.identity.glow} distance={3} />
    </group>
  );
}
