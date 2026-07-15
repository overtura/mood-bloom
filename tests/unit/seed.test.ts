import { describe, expect, it } from "vitest";
import { createDailySeed, createSeededRandom, createSpeciesSeed, normalizeEntryText } from "../../src/core/seed/seed";

describe("결정적 seed", () => {
  it("공백과 유니코드를 정규화한다", () => {
    expect(normalizeEntryText("  따뜻한   하루  ")).toBe("따뜻한 하루");
  });

  it("같은 문장은 같은 species seed를 만든다", () => {
    expect(createSpeciesSeed("작은 빛이 좋았다")).toBe(createSpeciesSeed("  작은  빛이 좋았다 "));
  });

  it("날짜가 달라지면 daily seed가 달라진다", () => {
    expect(createDailySeed("같은 문장", "2026-07-15")).not.toBe(createDailySeed("같은 문장", "2026-07-16"));
  });

  it("seed 기반 PRNG 순서를 재현한다", () => {
    const first = createSeededRandom("4fa21c09");
    const second = createSeededRandom("4fa21c09");
    expect([first(), first(), first()]).toEqual([second(), second(), second()]);
  });
});
