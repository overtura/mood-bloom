import type { PlantPlan } from "../core/growth/types";

function Accent({ archetype, color, index, count }: { archetype: PlantPlan["identity"]["archetype"]; color: string; index: number; count: number }) {
  const angle = (index / count) * Math.PI * 2;
  const radius = archetype === "spore" ? 0.9 : 0.46;
  const position: [number, number, number] = [Math.cos(angle) * radius, 1.7 + (index % 3) * 0.13, Math.sin(angle) * radius];
  if (archetype === "crystal") return <mesh position={position} rotation={[0, angle, angle * 0.2]}><octahedronGeometry args={[0.17, 0]} /><meshStandardMaterial color={color} roughness={0.22} metalness={0.18} /></mesh>;
  if (archetype === "thorn") return <mesh position={position} rotation={[0, 0, angle]}><coneGeometry args={[0.09, 0.32, 5]} /><meshStandardMaterial color={color} roughness={0.7} /></mesh>;
  if (archetype === "moss") return <mesh position={position} scale={[1.3, 0.8, 1.2]}><sphereGeometry args={[0.18, 12, 10]} /><meshStandardMaterial color={color} roughness={0.9} /></mesh>;
  if (archetype === "vine") return <mesh position={position} rotation={[0, angle, -0.5]} scale={[0.7, 1.4, 0.35]}><sphereGeometry args={[0.16, 12, 8]} /><meshStandardMaterial color={color} roughness={0.7} /></mesh>;
  if (archetype === "spore") return <mesh position={position}><sphereGeometry args={[0.07 + (index % 2) * 0.025, 10, 8]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} /></mesh>;
  return <mesh position={position} rotation={[0.2, angle, angle]} scale={[0.72, 1.25, 0.3]}><sphereGeometry args={[0.22, 14, 10]} /><meshStandardMaterial color={color} roughness={0.62} /></mesh>;
}

export function ArchetypeAccents({ plan, quality }: { plan: PlantPlan; quality: "low" | "medium" | "high" }) {
  const maximum = quality === "low" ? 6 : quality === "medium" ? 10 : 14;
  const count = Math.min(maximum, plan.stage.accents);
  return <>{Array.from({ length: count }, (_, index) => <Accent key={index} archetype={plan.identity.archetype} color={plan.identity.palette[index % 2] ?? plan.identity.palette[0]} index={index} count={count} />)}</>;
}
