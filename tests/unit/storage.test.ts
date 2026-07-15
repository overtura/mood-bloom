import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_GARDEN_STATE } from "../../src/core/storage/schema";
import { exportGardenState, importGardenState, loadGardenState, saveGardenState, STORAGE_KEY, upsertJournalEntry } from "../../src/core/storage/storage";
import type { MoodDecision } from "../../src/core/mood/types";

const decision: MoodDecision = { valence: "neutral", energy: 3, stability: "mixed", direction: "static", archetype: "moss" };

describe("versioned LocalStorage", () => {
  beforeEach(() => localStorage.clear());

  it("하루 한 기록을 유지하고 수정 시 seed를 다시 계산한다", () => {
    const first = upsertJournalEntry(structuredClone(DEFAULT_GARDEN_STATE), "첫 문장", "2026-07-15", decision);
    const edited = upsertJournalEntry(first, "수정한 문장", "2026-07-15", decision);
    expect(edited.entries).toHaveLength(1);
    expect(edited.entries[0]?.id).toBe(first.entries[0]?.id);
    expect(edited.entries[0]?.speciesSeed).not.toBe(first.entries[0]?.speciesSeed);
  });

  it("JSON export/import 왕복을 검증한다", () => {
    const state = upsertJournalEntry(structuredClone(DEFAULT_GARDEN_STATE), "백업할 문장", "2026-07-15", decision);
    expect(importGardenState(exportGardenState(state))).toEqual(state);
  });

  it("손상 데이터는 보존하고 빈 상태로 안전하게 복구한다", () => {
    localStorage.setItem(STORAGE_KEY, "{broken");
    expect(loadGardenState()).toEqual(DEFAULT_GARDEN_STATE);
    expect(Object.keys(localStorage).some((key) => key.startsWith(`${STORAGE_KEY}:recovery:`))).toBe(true);
  });

  it("저장된 설정의 false 값을 그대로 복원한다", () => {
    const state = structuredClone(DEFAULT_GARDEN_STATE);
    state.settings.reducedMotion = false;
    saveGardenState(state);
    expect(loadGardenState().settings.reducedMotion).toBe(false);
  });
});
