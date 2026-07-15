# 자가개선 정책

## label

`self-improvement`, `improvement:small`, `improvement:expansion`, `improvement:hotfix`, `risk:R0`~`risk:R3`, `auto-merge:eligible`, `auto-merge:blocked`를 사용한다.

## 5회 주기

- GitHub에서 merge된 `self-improvement` PR이 source of truth다. 별도 mutable counter 파일을 만들지 않는다.
- `improvement:hotfix`는 주기에서 제외한다.
- 마지막 `improvement:expansion` 뒤 merge된 `improvement:small`을 센다.
- small이 0~3개면 다음 정상 개선은 small을 우선한다.
- small이 4개면 다음 정상 개선은 expansion이어야 한다.
- expansion merge 후 주기를 초기화한다.
- expansion slot에 적절한 후보가 없으면 small로 대체하지 않고 proposal과 no-op으로 끝낸다.
- P0 hotfix는 언제나 우선한다.

## 변경량

Small은 목표 1개, 최대 8파일, 240 changed lines, 새 dependency 기본 0개, feature 영역 최대 1개다. 버그, 접근성, 작은 UX·성능, 테스트, 문서, 단순화, 오류 처리, fallback을 다룬다.

Expansion은 큰 제품 목표 1개, 최대 24파일, 1200 changed lines, 새 dependency 최대 1개, feature 영역 최대 3개다. 시작 전에 `maintainer-bot/proposals/<date>-<slug>.md`를 만들고 문제·가치·목표·비범위·slice·영향·호환성·성능·접근성·테스트·rollback·merge gate를 기록한다.

## 위험도

- R0: 문서, 테스트, copy, dead code, 타입 정리
- R1: 작은 UI/UX, 접근성, 오류 처리, 작은 성능, 제한된 refactor
- R2: 새 사용자 기능, geometry/animation, 성장 단계, prototype, storage migration, dependency, expansion
- R3: 모델 ID, 사용자 데이터 외부 전송, backend/API/DB/auth, privacy 정책, seed 호환성 파괴, 복구 불가능 storage, workflow/security, 자동 병합 정책 자체, 대형 binary/model, 의료·심리 진단

R3는 proposal only다. eval 삭제 또는 완화도 R3다.

## 자동 병합 gate

Small은 R0/R1, 변경량, `pnpm check`, 필요한 Playwright, 최신 branch, conflict·중복 PR 없음, red-team PASS, browser smoke PASS, console error 없음, deny path 없음, privacy·결정성 유지가 모두 필요하다.

Expansion은 R2 이하, proposal, acceptance criteria, `pnpm check`, 전체 핵심 Playwright, 모바일, reduced motion, 시각 전후 evidence, 성능 예산, storage 호환/migration test, 서로 다른 관점의 red-team 2회, 지적 수정 뒤 재검증, rollback, 최신 branch, conflict 없음, preview deployment 또는 production build가 모두 필요하다.

하나라도 충족하지 못하면 Draft PR 또는 proposal로 남기고 `auto-merge:blocked`를 붙인다. 초기 bootstrap PR은 자동 병합하지 않는다.
