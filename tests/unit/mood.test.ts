import { describe, expect, it } from "vitest";
import { classifyMoodFromPrototypeVectors, type PrototypeVectors } from "../../src/core/mood/classify-mood";
import { classifyMoodWithRules } from "../../src/core/mood/fallback";
import { MOOD_PROTOTYPES, prototypeKey } from "../../src/core/mood/prototypes";

function vectorsFor(targets: Record<string, string>, ambiguous = false) {
  return Object.fromEntries(MOOD_PROTOTYPES.map((definition) => [
    prototypeKey(definition),
    definition.samples.map(() => ambiguous || targets[definition.dimension] !== definition.label ? [0, 1] : [1, 0]),
  ])) as PrototypeVectors;
}

describe("문장 인상 분류", () => {
  it("prototype 유사도에서 각 dimension의 label을 선택한다", () => {
    const decision = classifyMoodFromPrototypeVectors([1, 0], vectorsFor({
      valence: "positive",
      energy: "4",
      stability: "stable",
      direction: "recovering",
      archetype: "bloom",
    }));
    expect(decision).toEqual({ valence: "positive", energy: 4, stability: "stable", direction: "recovering", archetype: "bloom" });
  });

  it("점수 차이가 작으면 보수적인 기본값을 사용한다", () => {
    expect(classifyMoodFromPrototypeVectors([1, 0], vectorsFor({}, true))).toEqual({
      valence: "neutral", energy: 3, stability: "mixed", direction: "static", archetype: "moss",
    });
  });

  it("모델 없이도 결정적인 로컬 fallback을 제공한다", () => {
    const text = "힘들었지만 다시 힘을 내어 작은 일을 해냈다!";
    expect(classifyMoodWithRules(text)).toEqual(classifyMoodWithRules(text));
    expect(classifyMoodWithRules(text).direction).toBe("recovering");
  });
});
