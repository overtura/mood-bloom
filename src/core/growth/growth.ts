import type { MoodDecision } from "../mood/types";
import { createSeededRandom } from "../seed/seed";
import type { GrowthDay, GrowthStage, PlantIdentity, PlantPlan } from "./types";

const STAGES: readonly GrowthStage[] = [
  { day: 1, name: "씨앗 정원", description: "첫 빛이 흙 위로 올라옵니다.", unlock: "마음씨앗과 첫 화분", scale: 0.45, branches: 1, accents: 2 },
  { day: 3, name: "작은 온실", description: "가느다란 가지가 빛을 찾습니다.", unlock: "새로운 화분 형태", scale: 0.62, branches: 3, accents: 4 },
  { day: 7, name: "빛나는 화단", description: "꽃잎과 작은 빛 생명체가 모입니다.", unlock: "희귀 꽃잎과 작은 빛 생명체", scale: 0.78, branches: 5, accents: 7 },
  { day: 14, name: "야생 온실", description: "식물의 고유한 변이가 선명해집니다.", unlock: "변종 장식 슬롯", scale: 0.92, branches: 7, accents: 10 },
  { day: 30, name: "달빛 정원", description: "한 달의 문장들이 하나의 장면을 이룹니다.", unlock: "월간 정원 장면", scale: 1.08, branches: 9, accents: 14 },
];

const PALETTES: Record<MoodDecision["valence"], [string, string, string]> = {
  positive: ["#e79a73", "#f5d889", "#88ad75"],
  neutral: ["#8ba47f", "#c5b8d7", "#dfc7a2"],
  negative: ["#668379", "#8c82a8", "#c78f83"],
};

export function createPlantIdentity(decision: MoodDecision, speciesSeed: string): PlantIdentity {
  const random = createSeededRandom(speciesSeed);
  return {
    archetype: decision.archetype,
    palette: PALETTES[decision.valence],
    symmetry: 3 + Math.floor(random() * 5),
    glow: 0.18 + decision.energy * 0.07,
    motion: decision.stability === "unstable" ? 0.22 : decision.stability === "mixed" ? 0.13 : 0.07,
  };
}

export function getGrowthStage(recordCount: number): GrowthStage {
  return [...STAGES].reverse().find((stage) => recordCount >= stage.day) ?? STAGES[0]!;
}

export function createGrowthPlan(
  identity: PlantIdentity,
  dailySeed: string,
  recordCount: number,
): PlantPlan {
  const random = createSeededRandom(dailySeed);
  const stage = getGrowthStage(recordCount);
  return {
    identity,
    dailySeed,
    stage,
    branchAngles: Array.from({ length: stage.branches }, () => (random() - 0.5) * Math.PI * 1.5),
  };
}

export function createEvolutionPlan(identity: PlantIdentity, dailySeed: string) {
  return STAGES.map((stage) => createGrowthPlan(identity, dailySeed, stage.day));
}

export const createPreviewPlan = createEvolutionPlan;

export function nextGrowthStage(recordCount: number) {
  return STAGES.find((stage) => stage.day > recordCount) ?? STAGES.at(-1)!;
}

export function growthDays(): GrowthDay[] {
  return STAGES.map((stage) => stage.day);
}
