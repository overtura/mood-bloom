import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";
import type { MoodDecision } from "../core/mood/types";
import { DEFAULT_GARDEN_STATE, type GardenState } from "../core/storage/schema";
import { loadGardenState, saveGardenState, upsertJournalEntry } from "../core/storage/storage";

type Action =
  | { type: "save-entry"; text: string; localDate: string; decision: MoodDecision }
  | { type: "replace"; state: GardenState }
  | { type: "clear" }
  | { type: "quality"; quality: GardenState["settings"]["renderQuality"] }
  | { type: "reduced-motion"; enabled: boolean };

type AppContextValue = {
  state: GardenState;
  saveEntry: (text: string, localDate: string, decision: MoodDecision) => void;
  replaceState: (state: GardenState) => void;
  clearState: () => void;
  setQuality: (quality: GardenState["settings"]["renderQuality"]) => void;
  setReducedMotion: (enabled: boolean) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

function reducer(state: GardenState, action: Action): GardenState {
  if (action.type === "save-entry") return upsertJournalEntry(state, action.text, action.localDate, action.decision);
  if (action.type === "replace") return action.state;
  if (action.type === "clear") return structuredClone(DEFAULT_GARDEN_STATE);
  if (action.type === "quality") {
    return { ...state, settings: { ...state.settings, renderQuality: action.quality } };
  }
  return { ...state, settings: { ...state.settings, reducedMotion: action.enabled } };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => loadGardenState());
  useEffect(() => saveGardenState(state), [state]);

  const value = useMemo<AppContextValue>(() => ({
    state,
    saveEntry: (text, localDate, decision) => dispatch({ type: "save-entry", text, localDate, decision }),
    replaceState: (nextState) => dispatch({ type: "replace", state: nextState }),
    clearState: () => dispatch({ type: "clear" }),
    setQuality: (quality) => dispatch({ type: "quality", quality }),
    setReducedMotion: (enabled) => dispatch({ type: "reduced-motion", enabled }),
  }), [state]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error("useApp은 AppProvider 안에서 사용해야 합니다.");
  return value;
}

export function getLocalDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
