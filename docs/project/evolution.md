# 진화 규칙

## Heart Seed와 Daily Specimen

Heart Seed는 첫 기록에서 만들어지는 정원의 중심 식물이다. 최초 문장의 `speciesSeed`가 정체성을 유지하고 누적 고유 기록일에 따라 같은 식물이 진화한다.

Daily Specimen은 각 날짜의 문장, `MoodDecision`, `dailySeed`를 반영하는 주변 식물이다. 한 날짜에는 한 기록만 있으며 수정하면 seed와 plan을 다시 계산한다.

## 성장 단계

| 누적 고유 기록일 | 단계 | 대표 해금 |
| --- | --- | --- |
| Day 1 | 씨앗 정원 | Heart Seed와 첫 화분 |
| Day 3 | 작은 온실 | 새로운 화분 형태 |
| Day 7 | 빛나는 화단 | 희귀 꽃잎과 작은 빛 생명체 |
| Day 14 | 야생 온실 | 변종 장식 슬롯 |
| Day 30 | 달빛 정원 | 월간 정원 장면 |

연속 일수가 아니라 누적 고유 기록일을 사용한다. 기록을 쉬어도 단계, 해금, 식물은 사라지지 않는다.

## Future Bloom 불변 조건

- 실제 Heart Seed identity와 `createEvolutionPlan`을 재사용한다.
- 단계 선택은 React의 일시적인 표시 상태일 뿐이다.
- 실제 기록 수, unlock, GardenState를 변경하지 않는다.
- preview 데이터를 LocalStorage에 저장하지 않는다.
- “가능한 성장 예시이며 실제 모습은 매일 남긴 문장에 따라 달라진다”는 안내를 표시한다.

## Tomorrow Bud

다음 방문을 암시하되 다음 식물을 확정적으로 보여주지 않는다. countdown, 손실 회피, 죄책감 문구를 사용하지 않는다.
