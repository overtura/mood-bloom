# 품질 계약

## 코드 한도

- 일반 파일: 가능하면 250줄 이하
- React 컴포넌트: 가능하면 150줄 이하
- 함수: 가능하면 40줄 이하
- 중첩: 최대 3단계
- 함수 인자: 가능하면 4개 이하
- `any`, class, event bus, dependency injection, 일회성 registry 금지

한도는 기계적으로 파일을 쪼개기 위한 목표가 아니다. 하나의 책임이 더 단순해질 때만 분리한다.

## 필수 검증

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

`pnpm check`는 앞의 네 명령을 묶는다. 모든 PR은 `pnpm check`를 통과해야 한다.

## 단위 테스트 범위

- text normalization, hash, seed 기반 PRNG
- 같은 입력의 species seed 결정성, 날짜별 daily seed 변화
- MoodDecision과 prototype similarity, confidence fallback
- GrowthPlan, milestone, preview 무상태
- 하루 중복 입력과 수정 후 seed 재계산
- export/import, schema 검증, 손상 데이터 recovery
- `reducedMotion: false`의 저장과 복원

## 브라우저 검증 범위

- 첫 방문 → 문장 입력 → 식물 reveal → 저장
- Future Bloom Day 1/3/7/14/30
- preview 전후 LocalStorage 불변
- garden 복원과 날짜별 표본
- 모델 unavailable fallback
- reduced motion과 모바일 viewport
- JSON export/import
- console error 없음

시각 변경은 360px 모바일과 데스크톱에서 확인한다. 고정 seed screenshot은 소수의 핵심 장면에만 사용한다.

## 단순화 review

완료 전에 다음을 확인한다.

1. 제거할 수 있는 코드가 있는가?
2. 상태가 중복 저장되는가?
3. 한 번만 쓰는 추상화가 있는가?
4. 더 직접적인 순수 함수로 바꿀 수 있는가?
5. 사용되지 않는 확장 포인트가 있는가?
6. 이름만 보고 책임을 이해할 수 있는가?
