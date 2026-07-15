# 기존 maintainer bot에 Mood Bloom 등록하기

Mood Bloom 저장소에는 bot 실행 코드, scheduler, PR 게시기, red-team runner가 없다. 실제 실행은 `okorion/self-improving-maintainer-bot` 저장소에서 하며, 이 폴더의 `target-profile.json`은 복사용 source다.

## 1. maintainer bot 준비

```powershell
git clone https://github.com/okorion/self-improving-maintainer-bot.git
cd self-improving-maintainer-bot
python -m pip install -e .
python -m self_maintainer_bot.cli codex-status
```

`codex-status`에서 Codex CLI와 ChatGPT 로그인이 PASS여야 한다.

## 2. profile 복사

Mood Bloom checkout 경로에 맞게 source를 지정한다.

```powershell
Copy-Item C:\path\to\mood-bloom\maintainer-bot\target-profile.json `
  .\profiles\overtura\mood-bloom.json
```

현재 bot 구현의 profile source of truth는 `profiles/overtura/*.json`과 `scripts/auto-improve-target-once.ps1`이다. 이 문서 작성 시 확인한 지원 필드는 `repository`, `defaultBranch`, `worktree`, `scope`, `improvementKind`, `docPaths`, `evalsPath`, `verifyCommands`, `allowPaths`, `denyPaths`, `maxFiles`, `maxLines`, `autoMerge`다.

## 3. 연결 값 확인과 dry-run

```powershell
.\scripts\auto-improve-target-once.ps1 -Profile mood-bloom -DryRun
```

출력에서 다음을 확인한다.

- target repo: `overtura/mood-bloom`
- base branch: `main`
- worktree: `targets/overtura/mood-bloom`
- verify command: `pnpm check`
- deny path에 workflow, backend, auth, model binary가 포함됨
- max files 24, max lines 1200은 expansion의 절대 상한임

## 4. target 준비 상태 확인

profile dry-run이 설정한 값을 실제 clone 과정과 동일하게 확인하려면 1회 실행 전 GitHub 인증을 점검한다.

```powershell
gh auth status
git ls-remote https://github.com/overtura/mood-bloom.git
python -m self_maintainer_bot.cli codex-status
```

`auto-improve-target-once.ps1`는 profile 값을 환경변수로 설정한 뒤 내부에서 `prepare-target`을 호출한다. 수동 환경변수를 사용할 때만 아래 CLI를 직접 실행한다.

```powershell
python -m self_maintainer_bot.cli prepare-target
python -m self_maintainer_bot.cli target-status
```

## 5. 실제 1회 실행

먼저 자동 병합 없이 결과를 확인한다.

```powershell
.\scripts\auto-improve-target-once.ps1 -Profile mood-bloom
```

정책, branch protection, publisher token, red-team status가 모두 준비된 뒤에만 profile의 `autoMerge`를 유지하거나 명시적으로 실행한다.

```powershell
.\scripts\auto-improve-target-once.ps1 -Profile mood-bloom -AutoMerge
```

publisher 인증은 maintainer bot의 `PUBLISH_GITHUB_TOKEN` 또는 `BOT_GITHUB_TOKEN` 운영 문서를 따른다. Mood Bloom 저장소에 token 처리 코드를 추가하지 않는다.

## 실패 시 확인

1. profile JSON이 UTF-8이며 `ConvertFrom-Json`으로 읽히는가
2. `overtura/mood-bloom`과 `main`에 접근 가능한가
3. target worktree가 clean한가
4. pnpm과 Node.js 20.19 이상이 설치되었는가
5. `pnpm install --frozen-lockfile`과 `pnpm check`가 통과하는가
6. 변경이 allowPaths 안이고 denyPaths 밖인가
7. PR 변경량과 위험도가 정책 gate 안에 있는가
8. red-team review와 browser smoke가 PASS인가

profile schema가 bot에서 바뀌면 Mood Bloom의 복사본보다 bot의 현재 구현을 우선하고 이 파일을 다시 검증한다.
