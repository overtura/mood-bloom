# 현재 개선 지시

## P0 불변 조건

- no-backend, no external inference API, no user text transmission
- deterministic seed와 preview 무상태
- 감정·심리·의료 진단 금지
- 쉬었다고 진행이나 해금을 잃지 않음

## P1 첫 사용과 재방문

- 문장 입력부터 식물 reveal까지의 마찰을 줄인다.
- Future Bloom의 Day 1/3/7/14/30 전환을 짧고 직접적으로 유지한다.
- Tomorrow Bud는 다음 방문을 암시하되 countdown과 손실 회피를 사용하지 않는다.

## P2 품질

- 로컬 모델 준비 상태와 fallback을 이해하기 쉽게 한다.
- WebGL fallback, reduced motion, 모바일, 키보드 탐색을 유지한다.
- seed, storage, import/export, preview 불변 조건을 테스트한다.
- 새 abstraction보다 기존 순수 함수를 먼저 재사용한다.

## P3 expansion 후보

- 월간 정원 장면
- PNG 공유 카드와 export
- 새로운 archetype과 공통 primitive
- 정원 배치와 탐색 고도화
- 모바일 렌더링 품질 고도화

한 루프에는 하나의 제품 목표만 선택한다. open PR과 겹치거나 의미 있는 후보가 없으면 억지 변경 없이 no-op으로 종료한다.
