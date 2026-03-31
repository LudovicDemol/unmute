import { create } from "zustand";

interface SessionStore {
  shouldConnect: boolean;
  evaluationStarted: boolean;
  popupDismissed: boolean;
  setShouldConnect: (v: boolean) => void;
  setEvaluationStarted: (v: boolean) => void;
  startEvaluation: () => void;
  dismissPopup: () => void;
  reset: () => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  shouldConnect: false,
  evaluationStarted: false,
  popupDismissed: false,
  setShouldConnect: (v) => set({ shouldConnect: v }),
  setEvaluationStarted: (v) => set({ evaluationStarted: v }),
  startEvaluation: () => set({ evaluationStarted: true, popupDismissed: false }),
  dismissPopup: () => set({ popupDismissed: true }),
  reset: () => set({ shouldConnect: false, evaluationStarted: false, popupDismissed: false }),
}));
