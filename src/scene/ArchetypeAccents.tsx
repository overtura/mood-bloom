import type { PlantPlan } from "../core/growth/types";

function Accent({ archetype, color, index, count, stageIndex }: { archetype: PlantPlan["identity"]["archetype"]; color: string; index: number; count: number; stageIndex: number }) {
  const angle = (index / count) * Math.PI * 2;
  const radius = (archetype === "spore" ? 0.72 : 0.36) + stageIndex * 0.075;
  const position: [number, number, number] = [
    Math.cos(angle) * radius,
    1.3 + stageIndex * 0.08 + (index % 3) * 0.14,
    Math.sin(angle) * radius,
  ];
  const material = <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.12 + stageIndex * 0.045} roughness={0.5} />;
  if (archetype === "crystal") return <mesh position={position} rotation={[0, angle, angle * 0.2]}><octahedronGeometry args={[0.14 + stageIndex * 0.012, 0]} />{material}</mesh>;
  if (archetype === "thorn") return <mesh position={position} rotation={[0, 0, angle]}><coneGeometry args={[0.08, 0.3 + stageIndex * 0.025, 5]} />{material}</mesh>;
  if (archetype === "moss") return <mesh position={position} scale={[1.3, 0.8, 1.2]}><sphereGeometry args={[0.15 + stageIndex * 0.01, 12, 10]} />{material}</mesh>;
  if (archetype === "vine") return <mesh position={position} rotation={[0, angle, -0.5]} scale={[0.7, 1.4, 0.35]}><sphereGeometry args={[0.14 + stageIndex * 0.01, 12, 8]} />{material}</mesh>;
  if (archetype === "spore") return <mesh position={position}><sphereGeometry args={[0.06 + (index % 2) * 0.025 + stageIndex * 0.005, 10, 8]} />{material}</mesh>;
  return <mesh position={position} rotation={[0.2, angle, angle]} scale={[0.72, 1.25, 0.3]}><sphereGeometry args={[0.18 + stageIndex * 0.012, 14, 10]} />{material}</mesh>;
}

export function ArchetypeAccents({ plan, quality }: { plan: PlantPlan; quality: "low" | "medium" | "high" }) {
  const maximum = quality === "low" ? 6 : quality === "medium" ? 10 : 14;
  const count = Math.min(maximum, plan.stage.accents);
  const stageIndex = [1, 3, 7, 14, 30].indexOf(plan.stage.day);
  return <>{Array.from({ length: count }, (_, index) => <Accent key={index} archetype={plan.identity.archetype} color={plan.identity.palette[index % 2] ?? plan.identity.palette[0]} index={index} count={count} stageIndex={stageIndex} />)}</>;
}
