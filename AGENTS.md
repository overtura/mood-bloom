# Mood Bloom 작업 규칙

## 먼저 지킬 제품 불변 조건

- 이 앱은 심리 진단이나 의료 도구가 아니다. 문장의 인상을 식물의 시각 특성으로만 설명한다.
- backend, API route, serverless function, database, authentication을 추가하지 않는다.
- 사용자 문장을 외부 AI API, 분석 도구, 로그, 서버로 전송하지 않는다.
- 모델 추론과 fallback은 브라우저 안에서 실행한다. raw embedding을 저장하지 않는다.
- 모델 가중치나 대형 binary를 저장소 또는 `public/`에 넣지 않는다.
- 같은 정규화 문장·날짜·renderer version은 같은 seed와 생성 결과를 만든다.
- 컴포넌트 안에서 `Math.random()`을 사용하지 않는다.
- Future Bloom과 Evolution 미리보기는 기록 수, 해금, 설정, LocalStorage를 변경하지 않는다.
- 하루 한 기록만 허용하고 같은 날 수정 시 seed와 plant plan을 다시 계산한다.
- 성장은 연속 streak가 아니라 누적 고유 기록일을 기준으로 한다. 쉬었다고 진행도를 잃게 하지 않는다.

## 책임 경계

- `src/core/mood`: 모델 설정, prototype, similarity 선택, rule fallback, worker client 계약
- `src/core/seed`: 정규화, hash, renderer version, seed 기반 PRNG
- `src/core/growth`: 식물 정체성, 성장 계획, 진화 계획, 정원 배치의 순수 함수
- `src/core/storage`: schema 검증, versioned LocalStorage, export/import, 손상 데이터 복구
- `src/scene`: 이미 계산된 plan의 렌더링만 담당하며 제품 상태의 source of truth가 되지 않는다.
- `src/features`: 사용자 흐름과 표시 상태만 담당한다. LocalStorage에 직접 접근하지 않는다.

동일한 제품 상태를 React state, ref, Three.js object에 중복 저장하지 않는다. preview 전용 생성 엔진을 만들지 말고 `createEvolutionPlan`을 재사용한다.

## 코드 단순성

- 일반 파일은 가능하면 250줄 이하, React 컴포넌트는 150줄 이하, 함수는 40줄 이하로 유지한다.
- 중첩은 최대 3단계, 함수 인자는 가능하면 4개 이하로 둔다.
- `any`, 불필요한 type assertion, class, event bus, dependency injection을 사용하지 않는다.
- 사용처가 하나뿐인 interface, factory, registry와 미래 요구만을 위한 추상화를 만들지 않는다.
- 조건문과 순수 함수로 충분하면 디자인 패턴이나 새 dependency를 도입하지 않는다.
- 주석으로 복잡성을 해명하기 전에 코드를 단순화한다.

## 접근성과 렌더링

- 모바일 우선, 44px 이상의 touch target, 키보드 탐색, 명확한 focus style, 충분한 명암을 유지한다.
- `prefers-reduced-motion`과 앱 설정의 reduced motion을 모두 존중한다.
- WebGL이 없거나 context를 잃으면 정적 CSS 식물로 fallback한다.
- 낮은 품질에서는 particle과 조명 비용만 줄이고 식물 정체성은 유지한다.
- 화면이 비활성화되면 애니메이션을 멈추고 Three.js resource를 정리한다.

## 검증

변경 전 기존 순수 함수와 UI primitive를 검색해 재사용한다. 변경 후에는 다음을 실행한다.

```bash
pnpm check
pnpm test:e2e
```

seed, storage, model prototype, preview 불변 조건을 바꾸는 변경에는 해당 단위 테스트가 필요하다. 핵심 사용자 흐름을 바꾸면 모바일 viewport와 console error를 포함한 Playwright 검증이 필요하다.

## 자가개선 PR

- 한 PR에는 하나의 제품 목표만 둔다.
- 기존 open PR과 겹치는 작업을 만들지 않는다.
- `maintainer-bot/improvement-policy.md`의 small/expansion 주기, 위험도, 경로, 자동 병합 gate를 따른다.
- R3 변경은 구현하거나 자동 병합하지 않고 proposal only로 남긴다.
- `.github/workflows`, auth, backend, model binary, seed 호환성 파괴는 deny 영역이다.
