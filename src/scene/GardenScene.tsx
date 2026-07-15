import { useEffect, useLayoutEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import type { PlantPlan } from "../core/growth/types";
import { Plant } from "./Plant";
import { StaticPlant } from "./StaticPlant";
import styles from "./GardenScene.module.css";

let webGlSupport: boolean | undefined;
const CAMERA_TARGET: [number, number, number] = [0, 0.92, 0];

function CameraRig({ scale }: { scale: number }) {
  const { camera, invalidate, size } = useThree();
  useLayoutEffect(() => {
    camera.position.set(0, 1.34, 4.95 + scale * 0.82);
    camera.lookAt(...CAMERA_TARGET);
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, invalidate, scale, size.height, size.width]);
  return null;
}

function supportsWebGl() {
  if (webGlSupport !== undefined) return webGlSupport;
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2") || canvas.getContext("webgl");
    webGlSupport = Boolean(context);
    context?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    webGlSupport = false;
  }
  return webGlSupport;
}

export function GardenScene({ plan, quality, reducedMotion, interactive = false, label }: { plan: PlantPlan; quality: "low" | "medium" | "high"; reducedMotion: boolean; interactive?: boolean; label?: string }) {
  const [visible, setVisible] = useState(document.visibilityState === "visible");
  const [contextLost, setContextLost] = useState(false);
  useEffect(() => {
    const handleVisibility = () => setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  if (!supportsWebGl() || contextLost) return <StaticPlant plan={plan} label={contextLost ? "그래픽 연결이 중단되어 표시한 정적 식물" : label} />;

  const dpr: [number, number] = quality === "low" ? [0.75, 1] : quality === "high" ? [1, 2] : [1, 1.5];
  return (
    <div className={styles.scene} role="img" aria-label={label ?? `${plan.identity.archetype} 형태의 디지털 식물`}>
      <Canvas
        dpr={dpr}
        camera={{ position: [0, 1.34, 5.4], fov: 36 }}
        frameloop={visible && !reducedMotion ? "always" : "demand"}
        fallback={<StaticPlant plan={plan} />}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener("webglcontextlost", () => setContextLost(true), { once: true });
        }}
      >
        <color attach="background" args={["#eef0e5"]} />
        <ambientLight intensity={1.35} />
        <hemisphereLight args={["#fff6de", "#4e6b49", 0.55]} />
        <directionalLight position={[3, 5, 4]} intensity={2.1} color="#fff6de" />
        <CameraRig scale={plan.stage.scale} />
        <Plant plan={plan} quality={quality} reducedMotion={reducedMotion} />
        <ContactShadows position={[0, -0.11, 0]} opacity={0.28} scale={4.6} blur={2.2} far={3} />
        {interactive && <OrbitControls target={CAMERA_TARGET} enablePan={false} enableZoom={false} minPolarAngle={Math.PI / 2.8} maxPolarAngle={Math.PI / 1.8} />}
      </Canvas>
      {interactive && <span className={styles.hint}>드래그해 천천히 돌려보세요</span>}
    </div>
  );
}
