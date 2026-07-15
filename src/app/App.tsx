import { lazy, Suspense } from "react";
import { AppProvider } from "./AppProvider";
import { AppShell } from "./AppShell";
import { usePathname } from "./routes";
import { CheckInPage } from "../features/check-in/CheckInPage";
import { AppLink } from "./routes";
import layout from "../ui/layout.module.css";

const GardenPage = lazy(() => import("../features/garden/GardenPage").then((module) => ({ default: module.GardenPage })));
const EvolutionPage = lazy(() => import("../features/evolution/EvolutionPage").then((module) => ({ default: module.EvolutionPage })));
const SettingsPage = lazy(() => import("../features/settings/SettingsPage").then((module) => ({ default: module.SettingsPage })));

function CurrentRoute() {
  const pathname = usePathname();
  if (pathname === "/") return <CheckInPage />;
  if (pathname === "/garden") return <Suspense fallback={<RouteFallback />}><GardenPage /></Suspense>;
  if (pathname === "/evolution") return <Suspense fallback={<RouteFallback />}><EvolutionPage /></Suspense>;
  if (pathname === "/settings") return <Suspense fallback={<RouteFallback />}><SettingsPage /></Suspense>;
  return <div className={layout.page}><section className={`${layout.panel} ${layout.empty}`}><p className={layout.eyebrow}>404</p><h1 className={layout.sectionTitle}>이 길에는 아직 식물이 없어요.</h1><p>정원의 익숙한 길로 돌아가 주세요.</p><AppLink href="/" className={layout.button}>오늘로 돌아가기</AppLink></section></div>;
}

function RouteFallback() {
  return <div className={layout.page}><section className={`${layout.panel} ${layout.empty}`}><p>정원 길을 준비하고 있어요.</p></section></div>;
}

export function App() {
  return <AppProvider><AppShell><CurrentRoute /></AppShell></AppProvider>;
}
