import { describe, expect, it } from "vitest";
import { createEvolutionPlan, createGrowthPlan, createPlantIdentity, createPreviewPlan, getGrowthStage } from "../../src/core/growth/growth";
import type { MoodDecision } from "../../src/core/mood/types";

const decision: MoodDecision = {
  valence: "positive",
  energy: 4,
  stability: "stable",
  direction: "recovering",
  archetype: "bloom",
};

describe("성장 계획", () => {
  it("누적 고유 기록일을 성장 단계로 변환한다", () => {
    expect(getGrowthStage(1).day).toBe(1);
    expect(getGrowthStage(6).day).toBe(3);
    expect(getGrowthStage(30).day).toBe(30);
  });

  it("동일 seed와 상태로 동일한 식물을 만든다", () => {
    const identity = createPlantIdentity(decision, "1234abcd");
    expect(createGrowthPlan(identity, "abcd1234", 7)).toEqual(createGrowthPlan(identity, "abcd1234", 7));
  });

  it("preview는 실제 진화 엔진을 재사용하고 입력을 바꾸지 않는다", () => {
    const identity = createPlantIdentity(decision, "1234abcd");
    const before = structuredClone(identity);
    expect(createPreviewPlan(identity, "abcd1234")).toEqual(createEvolutionPlan(identity, "abcd1234"));
    expect(identity).toEqual(before);
  });
});
