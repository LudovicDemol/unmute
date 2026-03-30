/**
 * Simple global session store without Context JSX complexity
 * Manages current session state (sessionId, systemPrompt, checklist, etc.)
 */

import { useState, useCallback } from "react";
import type { ChecklistItem } from "./useEcosApi";

export interface EcosSessionState {
  sessionId: string | null;
  userId: string | null;
  sddId: string | null;
  sddNum: number | null;
  title: string | null;
  systemPrompt: string | null;
  unmuteWsUrl: string | null;
  checklist: ChecklistItem[];
  status: "idle" | "loading" | "active" | "ended" | "error";
  startedAt: Date | null;
  error: string | null;
  voiceRecordingUrl: string | null;
}

const initialState: EcosSessionState = {
  sessionId: null,
  userId: null,
  sddId: null,
  sddNum: null,
  title: null,
  systemPrompt: null,
  unmuteWsUrl: null,
  checklist: [],
  status: "idle",
  startedAt: null,
  error: null,
  voiceRecordingUrl: null,
};

let globalSession = initialState;
let listeners: Set<() => void> = new Set();

function notifyListeners() {
  listeners.forEach(listener => listener());
}

function setGlobalSession(update: Partial<EcosSessionState>) {
  globalSession = { ...globalSession, ...update };
  notifyListeners();
}

export function useEcosSession() {
  const [, setUpdate] = useState({});

  const subscribe = useCallback((listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, []);

  // Subscribe to changes
  useState(() => {
    const listener = () => setUpdate({});
    return subscribe(listener);
  }, [subscribe]);

  return {
    session: globalSession,
    startSession: (
      sessionId: string,
      userId: string,
      sddId: string,
      title: string,
      systemPrompt: string,
      unmuteWsUrl: string,
      checklist: ChecklistItem[],
      voiceRecordingUrl: string
    ) => {
      setGlobalSession({
        sessionId,
        userId,
        sddId,
        sddNum: parseInt(sddId.split("-")[0] || "0"),
        title,
        systemPrompt,
        unmuteWsUrl,
        checklist,
        status: "active",
        startedAt: new Date(),
        error: null,
        voiceRecordingUrl: voiceRecordingUrl
      });
    },
    endSession: () => {
      setGlobalSession({ status: "ended" });
    },
    setLoading: (loading: boolean) => {
      setGlobalSession({
        status: loading ? "loading" : globalSession.status === "loading" ? "idle" : globalSession.status,
      });
    },
    setError: (error: string | null) => {
      setGlobalSession({
        error,
        status: error ? "error" : globalSession.status,
      });
    },
    updateChecklistItem: (id: string, completed: boolean) => {
      setGlobalSession({
        checklist: globalSession.checklist.map((item) =>
          item.id === id ? { ...item, completed } : item
        ),
      });
    },
  };
}

// Stub for compatibility - not needed with hook-based approach
export function EcosSessionProvider({ children }: { children: React.ReactNode }) {
  return children;
}
