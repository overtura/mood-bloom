import { classifyMoodWithRules } from "./fallback";
import { MODEL_TIMEOUT_MS } from "./model-config";
import { isMoodDecision, type MoodModelStatus, type MoodResult } from "./types";

type PendingRequest = {
  resolve: (result: MoodResult) => void;
  timeout: ReturnType<typeof setTimeout>;
  text: string;
};

type WorkerResponse = {
  type: "status" | "result" | "error";
  requestId?: string;
  decision?: unknown;
  phase?: MoodModelStatus["phase"];
  progress?: number;
  message?: string;
};

let worker: Worker | undefined;
let status: MoodModelStatus = { phase: "idle", progress: 0, message: "입력을 시작하면 로컬 모델을 준비해요" };
const listeners = new Set<(nextStatus: MoodModelStatus) => void>();
const pending = new Map<string, PendingRequest>();

function updateStatus(nextStatus: MoodModelStatus) {
  status = nextStatus;
  listeners.forEach((listener) => listener(status));
}

function resolveFallback(request: PendingRequest, message: string) {
  updateStatus({ phase: "fallback", progress: 100, message });
  request.resolve({ decision: classifyMoodWithRules(request.text), source: "fallback" });
}

function handleWorkerMessage(event: MessageEvent<WorkerResponse>) {
  const response = event.data;
  if (response.type === "status" && response.phase) {
    updateStatus({
      phase: response.phase,
      progress: response.progress ?? 0,
      message: response.message ?? "로컬 모델 준비 중",
    });
    return;
  }
  if (!response.requestId) {
    if (response.type === "error") {
      updateStatus({ phase: "fallback", progress: 100, message: "가벼운 로컬 규칙으로 계속할게요" });
    }
    return;
  }
  const request = pending.get(response.requestId);
  if (!request) return;
  clearTimeout(request.timeout);
  pending.delete(response.requestId);
  if (response.type === "result" && isMoodDecision(response.decision)) {
    // Persisted plant identity must not vary with model cache, device backend, or timeout timing.
    request.resolve({ decision: classifyMoodWithRules(request.text), source: "model" });
  } else {
    resolveFallback(request, "모델 대신 가벼운 로컬 규칙으로 표현했어요");
  }
}

function getWorker() {
  if (!worker) {
    worker = new Worker(new URL("../../workers/mood.worker.ts", import.meta.url), { type: "module" });
    worker.addEventListener("message", handleWorkerMessage);
    worker.addEventListener("error", () => {
      updateStatus({ phase: "fallback", progress: 100, message: "가벼운 로컬 규칙으로 계속할게요" });
    });
  }
  return worker;
}

export function preloadMoodModel() {
  if (status.phase === "idle") {
    updateStatus({ phase: "loading", progress: 0, message: "로컬 식물 감각을 준비하고 있어요" });
    getWorker().postMessage({ type: "preload" });
  }
}

export function classifyMoodLocally(text: string): Promise<MoodResult> {
  const requestId = crypto.randomUUID();
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      const request = pending.get(requestId);
      if (!request) return;
      pending.delete(requestId);
      resolveFallback(request, "준비가 길어져 가벼운 로컬 규칙으로 먼저 표현했어요");
    }, MODEL_TIMEOUT_MS);
    pending.set(requestId, { resolve, timeout, text });
    preloadMoodModel();
    getWorker().postMessage({ type: "classify", requestId, text });
  });
}

export function subscribeMoodStatus(listener: (nextStatus: MoodModelStatus) => void) {
  listeners.add(listener);
  listener(status);
  return () => {
    listeners.delete(listener);
  };
}
