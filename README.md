# 무드 블룸 (Mood Bloom)

하루의 한 문장을 브라우저 안에서만 해석해 결정적인 디지털 식물과 개인 정원으로 표현하는 프런트엔드 앱입니다.

> 문장에서 받은 인상을 디지털 생명체로 표현합니다. 심리 상태를 진단하지 않습니다.

## 핵심 경험

1. 오늘의 한 문장을 입력합니다.
2. 브라우저의 로컬 임베딩 모델이 제한된 `MoodDecision`으로 문장의 인상을 분류합니다.
3. TypeScript 생성 엔진이 문장과 날짜에서 결정적인 씨앗 값을 만들고 3D 식물을 피웁니다.
4. 미래 정원에서 1·3·7·14·30일째의 성장 가능성을 살펴봅니다.
5. 실제 기록은 개인 정원에 하루 한 개씩 누적됩니다.

미리보기는 기록 수, 해금, LocalStorage를 바꾸지 않습니다. 연속 기록이 끊겨도 진행도나 해금을 잃지 않으며, 성장은 누적 고유 기록일을 기준으로 합니다.

## 로컬에서 실행

Node.js 20.19 이상과 pnpm 10이 필요합니다.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

전체 검증:

```bash
pnpm check
pnpm test:e2e
```

`pnpm check`는 lint, TypeScript 검사, 단위 테스트, production build를 순서대로 실행합니다.

## 개인정보와 로컬 모델

- backend, API route, serverless function, database, authentication이 없습니다.
- 사용자의 문장과 분류 결과는 브라우저 LocalStorage에만 저장됩니다.
- 외부 AI 추론 API를 호출하거나 문장을 외부 서버로 전송하지 않습니다.
- [`Xenova/paraphrase-multilingual-MiniLM-L12-v2`](https://huggingface.co/Xenova/paraphrase-multilingual-MiniLM-L12-v2)를 Web Worker에서 불러와 feature extraction을 수행합니다.
- WebGPU를 우선하고 초기화가 실패하거나 사용할 수 없으면 WASM으로 다시 시도합니다. 모델 준비가 오래 걸리거나 실패해도 저장되는 식물 정체성은 같은 문장에 대한 결정적 기기 내 규칙으로 고정됩니다.
- raw embedding과 모델 가중치를 저장소, Vercel, LocalStorage에 보관하지 않습니다.

이 제품은 감정 분석 서비스, 심리 검사, 의료 도구가 아닙니다.

## 결정적 생성

```text
speciesSeed = hash(normalizedText)
dailySeed   = hash(normalizedText + localDate + rendererVersion)
```

`speciesSeed`는 식물의 기본 품종과 정체성을, `dailySeed`는 해당 날짜의 가지·꽃잎·장식 배치를 결정합니다. 모델은 브라우저 안에서 제한된 인상 분류를 수행하지만, 저장되는 `MoodDecision`은 모델 캐시·기기 백엔드·시간 초과 여부와 무관한 정규 규칙으로 고정합니다. 모든 무작위 값은 씨앗 기반 PRNG를 통하며 렌더링 도중 제품 상태를 변경하지 않습니다.

## 주요 경로

```text
src/app/                 앱 상태와 라우팅
src/features/            체크인, 정원, 진화, 설정
src/core/mood/           로컬 의미 분류와 fallback
src/core/seed/           정규화, hash, PRNG
src/core/growth/         식물 정체성, 성장, 정원 배치
src/core/storage/        schema v1, 저장, export/import
src/scene/               Three.js 식물과 정적 fallback
tests/                   Vitest와 Playwright
docs/project/            제품·아키텍처·진화·품질 계약
maintainer-bot/          기존 maintainer bot 연결용 target 자산
```

## 정적 배포

`pnpm build` 결과는 `dist/`에 생성됩니다. `vercel.json`은 Vite 정적 배포와 SPA route fallback만 설정하며 Vercel Function을 만들지 않습니다.

## 웹 메타데이터와 접근성

직접 생성한 추상 식물 이미지인 `public/mood-bloom-visual.png`를 파비콘, 모바일 홈 화면 아이콘, 소셜 공유 미리보기에 함께 사용합니다. 한국어 문서 제목과 설명, 웹 앱 매니페스트, 검색 로봇 정책, 현재 메뉴 표시, 본문 바로가기와 경로 전환 초점 이동을 제공합니다.

## 오픈소스와 라이선스

프로젝트 코드는 [MIT License](LICENSE)를 따릅니다. 주요 런타임 의존성의 라이선스는 다음과 같습니다.

- React, Three.js, `@react-three/fiber`, `@react-three/drei`: MIT
- `@huggingface/transformers`: Apache-2.0
- `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` 및 브라우저용 Xenova 변환 모델: Apache-2.0

모델 가중치는 이 저장소에 포함하지 않으며, 사용자의 브라우저가 공개 모델 저장소에서 직접 내려받습니다. 전체 dependency 버전은 `pnpm-lock.yaml`이 source of truth입니다.

## 자가개선 target

이 저장소에는 maintainer 실행기, scheduler, PR 게시기, red-team runner가 없습니다. `maintainer-bot/target-profile.json`과 정책·eval 문서는 기존 [`okorion/self-improving-maintainer-bot`](https://github.com/okorion/self-improving-maintainer-bot)에 등록하기 위한 source입니다. 실제 연결 절차는 [maintainer-bot/SETUP.md](maintainer-bot/SETUP.md)를 따릅니다.
