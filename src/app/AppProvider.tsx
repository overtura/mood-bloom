import { createContext, useContext, useMemo, useReducer, useState, type ReactNode } from "react";
import { DEFAULT_GARDEN_STATE, type GardenState } from "../core/storage/schema";
import { clearGardenStorage, loadGardenStateWithStatus, saveGardenState, upsertJournalEntry, type GardenLoadResult } from "../core/storage/storage";

type Action =
  | { type: "save-entry"; text: string; localDate: string }
  | { type: "replace"; state: GardenState }
  | { type: "clear" }
  | { type: "quality"; quality: GardenState["settings"]["renderQuality"] }
  | { type: "reduced-motion"; enabled: boolean };

type AppContextValue = {
  state: GardenState;
  storageMessage: string;
  saveEntry: (text: string, localDate: string) => void;
  replaceState: (state: GardenState) => boolean;
  clearState: () => boolean;
  setQuality: (quality: GardenState["settings"]["renderQuality"]) => void;
  setReducedMotion: (enabled: boolean) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

function reducer(state: GardenState, action: Action): GardenState {
  if (action.type === "save-entry") return upsertJournalEntry(state, action.text, action.localDate);
  if (action.type === "replace") return action.state;
  if (action.type === "clear") return structuredClone(DEFAULT_GARDEN_STATE);
  if (action.type === "quality") {
    return { ...state, settings: { ...state.settings, renderQuality: action.quality } };
  }
  return { ...state, settings: { ...state.settings, reducedMotion: action.enabled } };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [initialLoad] = useState<GardenLoadResult>(loadGardenStateWithStatus);
  const [state, dispatch] = useReducer(reducer, initialLoad.state);
  const [storageMessage, setStorageMessage] = useState(initialLoad.warning);

  const value = useMemo<AppContextValue>(() => {
    function applyAction(action: Action) {
      const nextState = reducer(state, action);
      const saved = saveGardenState(nextState);
      if (!saved) {
        setStorageMessage("브라우저 저장 공간이 부족하거나 차단되어 변경 사항을 보관하지 못했습니다. JSON 백업을 먼저 저장해 주세요.");
      }
      dispatch(action);
      return saved;
    }

    return {
      state,
      storageMessage,
      saveEntry: (text, localDate) => applyAction({ type: "save-entry", text, localDate }),
      replaceState: (nextState) => applyAction({ type: "replace", state: nextState }),
      clearState: () => {
        const cleared = clearGardenStorage();
        if (cleared) setStorageMessage("");
        else setStorageMessage("브라우저 저장소가 차단되어 일부 복구 사본을 지우지 못했습니다.");
        dispatch({ type: "clear" });
        return cleared;
      },
      setQuality: (quality) => applyAction({ type: "quality", quality }),
      setReducedMotion: (enabled) => applyAction({ type: "reduced-motion", enabled }),
    };
  }, [state, storageMessage]);

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
