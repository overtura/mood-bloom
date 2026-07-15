# Mood Bloom 자가개선 1회 실행

Model: 현재 선택 가능한 최고 성능 코딩 모델
Reasoning level: High
Mode: Goal

Mood Bloom 자가개선 루프를 1회 실행해줘.

- target profile, `AGENTS.md`, improvement policy, directives, knowledge, eval, 최근 merged/open PR을 먼저 읽는다.
- P0 hotfix 여부와 현재 5회 주기 위치를 merge된 label로 계산한다.
- small, expansion, hotfix 중 하나를 선택한다.
- 한 PR에는 하나의 제품 목표만 수행하고 기존 open PR과 겹치지 않는다.
- allow/deny path, 변경량, 위험도, privacy, 결정성, preview 무상태를 우회하지 않는다.
- 구현 후 target 검증, 브라우저 검증, red-team review를 수행한다.
- 자동 병합 gate를 충족하면 squash auto-merge를 요청한다.
- 충족하지 못하면 Draft PR 또는 proposal로 남긴다.
- 의미 있는 후보가 없으면 억지 변경 없이 no-op으로 종료한다.
- 완료 후 선택한 문제, PR 유형, 변경, 위험도, 검증, PR과 merge 상태를 보고한다.
