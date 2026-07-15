import { lazy, Suspense } from "react";
import type { PlantPlan } from "../core/growth/types";
import { StaticPlant } from "./StaticPlant";

const GardenScene = lazy(() => import("./GardenScene").then((module) => ({ default: module.GardenScene })));

type Props = {
  plan: PlantPlan;
  quality: "low" | "medium" | "high";
  reducedMotion: boolean;
  interactive?: boolean;
  label?: string;
};

export function LazyGardenScene(props: Props) {
  return <Suspense fallback={<StaticPlant plan={props.plan} label="식물 장면 준비 중" />}><GardenScene {...props} /></Suspense>;
}
