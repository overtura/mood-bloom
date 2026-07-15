import type { MoodDecision } from "../mood/types";

export type GrowthDay = 1 | 3 | 7 | 14 | 30;
export type GrowthStage = {
  day: GrowthDay;
  name: string;
  description: string;
  unlock: string;
  scale: number;
  branches: number;
  accents: number;
};

export type PlantIdentity = {
  archetype: MoodDecision["archetype"];
  palette: [string, string, string];
  symmetry: number;
  glow: number;
  motion: number;
};

export type PlantPlan = {
  identity: PlantIdentity;
  dailySeed: string;
  stage: GrowthStage;
  branchAngles: number[];
};
