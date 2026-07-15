# Mood Bloom 지식

- 제품 목적: 하루 한 문장의 인상을 로컬 의미 분류와 결정적 식물 생성으로 표현한다.
- 사용자 흐름: 입력 → 분류 → seed → reveal → Future Bloom → 정원 저장.
- `MoodDecision`: valence, energy, stability, direction, archetype의 제한된 값만 가진다.
- 모델: `Xenova/paraphrase-multilingual-MiniLM-L12-v2`, Web Worker, WebGPU 우선, WASM fallback.
- 모델 실패: keyword/rule fallback이 동일 계약을 반환하며 전체 제품은 계속 동작한다.
- 결정성: speciesSeed는 품종 정체성, dailySeed는 날짜별 세부 배치를 담당한다.
- Heart Seed: 첫 기록의 중심 식물이며 누적 고유 기록일에 따라 진화한다.
- Daily Specimen: 날짜별 문장과 인상을 반영하는 주변 식물이다.
- 성장: Day 1, 3, 7, 14, 30. streak가 아니라 누적 고유 기록일이다.
- Future Bloom: 실제 `createEvolutionPlan`을 재사용하는 무상태 preview이며 저장하지 않는다.
- 저장: `GardenState.schemaVersion = 1`, versioned LocalStorage, JSON export/import.
- privacy: no backend, no external AI API, no raw embedding persistence.
- 검증: `pnpm check`, `pnpm test:e2e`.
- self-improvement: small 4회 뒤 expansion slot 1회, hotfix 제외, R3 proposal only.
- 자동 병합: 경로·변경량·위험도·검증·browser smoke·red-team gate를 모두 통과해야 한다.
