/// <reference lib="webworker" />

import { pipeline, type FeatureExtractionPipeline } from "@huggingface/transformers";
import { classifyMoodFromPrototypeVectors, type PrototypeVectors } from "../core/mood/classify-mood";
import { MOOD_MODEL_ID } from "../core/mood/model-config";
import { MOOD_PROTOTYPES, prototypeKey } from "../core/mood/prototypes";

type WorkerRequest =
  | { type: "preload" }
  | { type: "classify"; requestId: string; text: string };

type ProgressEventLike = { progress?: number; loaded?: number; total?: number; status?: string };

let extractorPromise: Promise<FeatureExtractionPipeline> | undefined;

function progressValue(value: unknown) {
  if (!value || typeof value !== "object") return 0;
  const event = value as ProgressEventLike;
  if (typeof event.progress === "number") return Math.round(event.progress);
  if (event.loaded && event.total) return Math.round((event.loaded / event.total) * 100);
  return 0;
}

function postStatus(progress: number, message: string) {
  self.postMessage({ type: "status", phase: "loading", progress, message });
}

function getExtractor() {
  extractorPromise ??= pipeline("feature-extraction", MOOD_MODEL_ID, {
    device: "gpu" in navigator ? "webgpu" : "wasm",
    progress_callback: (event: unknown) => {
      postStatus(progressValue(event), "로컬 식물 감각을 준비하고 있어요");
    },
  }).then((loaded) => {
    self.postMessage({ type: "status", phase: "ready", progress: 100, message: "로컬 모델 준비 완료" });
    return loaded;
  });
  return extractorPromise;
}

function isVectorList(value: unknown): value is number[][] {
  return Array.isArray(value) && value.every(
    (item) => Array.isArray(item) && item.every((part) => typeof part === "number"),
  );
}

async function classify(text: string) {
  const extractor = await getExtractor();
  const samples = MOOD_PROTOTYPES.flatMap((definition) => definition.samples);
  const tensor = await extractor([text, ...samples], { pooling: "mean", normalize: true });
  const vectors: unknown = tensor.tolist();
  if (!isVectorList(vectors) || !vectors[0]) throw new Error("모델 결과 형식을 읽을 수 없습니다.");

  const prototypeVectors: PrototypeVectors = {};
  let cursor = 1;
  for (const definition of MOOD_PROTOTYPES) {
    prototypeVectors[prototypeKey(definition)] = vectors.slice(cursor, cursor + definition.samples.length);
    cursor += definition.samples.length;
  }
  return classifyMoodFromPrototypeVectors(vectors[0], prototypeVectors);
}

self.addEventListener("message", (event: MessageEvent<WorkerRequest>) => {
  if (event.data.type === "preload") {
    void getExtractor().catch((error: unknown) => {
      self.postMessage({ type: "error", message: error instanceof Error ? error.message : "모델 준비 실패" });
    });
    return;
  }

  const { requestId, text } = event.data;
  void classify(text)
    .then((decision) => self.postMessage({ type: "result", requestId, decision }))
    .catch((error: unknown) => {
      self.postMessage({
        type: "error",
        requestId,
        message: error instanceof Error ? error.message : "로컬 분류 실패",
      });
    });
});
