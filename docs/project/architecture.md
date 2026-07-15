# 아키텍처

## source of truth

`GardenState`가 제품 상태의 유일한 source of truth다. UI는 Context와 reducer로 상태를 변경하고 storage 모듈이 schema v1로 저장한다. Three.js object는 이미 계산된 `PlantPlan`을 표현할 뿐 상태를 소유하지 않는다.

```text
입력 문장
  ├─ mood worker → MoodDecision
  │   └─ 실패/timeout → deterministic rule fallback
  ├─ seed core → speciesSeed + dailySeed
  ├─ growth core → PlantIdentity + PlantPlan
  ├─ scene → WebGL renderer 또는 CSS fallback
  └─ storage → GardenState schema v1
```

## 로컬 의미 분류

모델은 `Xenova/paraphrase-multilingual-MiniLM-L12-v2`다. Web Worker가 모델과 한국어 prototype 문장을 같은 feature-extraction pipeline으로 임베딩하고 cosine similarity를 비교한다. dimension별 최고 점수와 차점 차이가 작으면 보수적인 기본값을 선택한다.

`MoodDecision`만 worker 밖으로 전달한다. raw embedding은 저장하지 않는다. WebGPU를 우선하고 지원되지 않으면 WASM을 사용한다. 모델이 실패하거나 timeout을 넘으면 keyword/rule fallback이 동일한 계약을 반환한다.

## 결정적 생성

- `speciesSeed = hash(normalizedText)`
- `dailySeed = hash(normalizedText + localDate + rendererVersion)`
- 모든 세부 변화는 seed 기반 PRNG로 계산한다.
- renderer 품질은 particle과 조명 비용만 바꾸고 identity를 바꾸지 않는다.
- `createGrowthPlan`과 `createEvolutionPlan`은 입력을 변경하지 않는 순수 함수다.

## 저장과 복구

`GardenState.schemaVersion`은 1이다. UI 컴포넌트는 LocalStorage에 직접 접근하지 않는다. import 전에 전체 schema를 검증하며, 손상된 저장값은 recovery key로 원문을 보존하고 빈 상태로 안전하게 시작한다. optional boolean인 `reducedMotion: false`도 명시적으로 저장하고 복원한다.

## 배포

Vite 정적 build만 배포한다. `vercel.json`은 SPA rewrite를 제공한다. API, Function, database, 환경변수가 없어도 동작한다.
