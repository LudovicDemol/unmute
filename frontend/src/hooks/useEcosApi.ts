/**
 * API client hooks for ECOS backend
 * Handles REST calls to /scenarios, /sessions/*, /progress/*, etc.
 */

import { useCallback } from "react";

const API_BASE = "http://localhost:3001";

export interface ScenarioListItem {
  id: string;
  title: string;
  description: string;
  category: string;
  domain: string;
  firstname: string;
  lastname: string;
  age: number;
  type: string;
}

export interface ScenarioDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  domain: string;
  difficulty: number;
  systemPrompt: string;
  checklist: ChecklistItem[];
  firstname: string;
  lastname: string;
  age: number;
  type: string;
  voice: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  category?: string;
  completed?: boolean;
}

export interface SessionStartResponse {
  sessionId: string;
  systemPrompt: string;
  unmuteWsUrl: string;
  checklist: ChecklistItem[];
}

export interface SessionDetails {
  id: string;
  userId: string;
  scenarioId: number;
  title: string;
  startedAt: string;
  duration: number;
  status: "active" | "completed" | "ended";
  finalScore: number;
  sttTranscript: Array<{ role: string; content: string }>;
  checklistProgress: ChecklistItem[];
}

export interface UserProgress {
  userId: string;
  totalSessions: number;
  avgScore: number;
  masteryByCategory: Record<string, number>;
  streakDays: number;
  lastSession: string;
  plan: string;
  level: string;
  completion: number;
}

export function useEcosApi() {
  const handleError = useCallback((response: Response, context: string) => {
    if (!response.ok) {
      throw new Error(
        `${context}: ${response.status} ${response.statusText}`
      );
    }
    return response.json();
  }, []);

  // GET /scenarios - List all scenarios
  const getScenarios = useCallback(async (): Promise<ScenarioListItem[]> => {
    const response = await fetch(`${API_BASE}/scenarios`);
    return handleError(response, "Failed to fetch scenarios");
  }, [handleError]);

  // GET /scenarios/{sddNum} - Get scenario details
  const getScenarioDetail = useCallback(
    async (id: string): Promise<ScenarioDetail> => {
      const response = await fetch(`${API_BASE}/scenarios/${id}`);
      console.log(response);
      return handleError(response, `Failed to fetch scenario ${id}`);
    },
    [handleError]
  );

  // POST /sessions/start - Start a new session
  const startSession = useCallback(
    async (sddId: string, userId: string): Promise<SessionStartResponse> => {
      const response = await fetch(`${API_BASE}/sessions/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sddId, userId }),
      });
      return handleError(response, "Failed to start session");
    },
    [handleError]
  );

  // POST /sessions/{id}/end - End a session
  const endSession = useCallback(
    async (sessionId: string, userId: string) => {
      const response = await fetch(`${API_BASE}/sessions/${sessionId}/end`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      return handleError(response, "Failed to end session");
    },
    [handleError]
  );

  // GET /sessions/{id} - Fetch session details
  const getSessionDetails = useCallback(
    async (sessionId: string): Promise<SessionDetails> => {
      const response = await fetch(`${API_BASE}/sessions/${sessionId}`);
      return handleError(response, `Failed to fetch session ${sessionId}`);
    },
    [handleError]
  );

  // GET /history - Fetch user's session history
  const getHistory = useCallback(async () => {
    const response = await fetch(`${API_BASE}/history`);
    return handleError(response, "Failed to fetch history");
  }, [handleError]);

  // GET /history/{sessionId} - Fetch detailed session history
  const getHistoryDetail = useCallback(
    async (sessionId: string) => {
      const response = await fetch(`${API_BASE}/history/${sessionId}`);
      return handleError(response, `Failed to fetch history for ${sessionId}`);
    },
    [handleError]
  );

  // GET /progress/{userId} - Fetch user progression
  const getProgress = useCallback(
    async (userId: string): Promise<UserProgress> => {
      const response = await fetch(`${API_BASE}/progress/${userId}`);
      return handleError(response, "Failed to fetch progress");
    },
    [handleError]
  );

  // PATCH /progress/{userId} - Update user progression
  const updateProgress = useCallback(
    async (userId: string, updates: { plan?: string; level?: string }) => {
      const response = await fetch(`${API_BASE}/progress/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      return handleError(response, "Failed to update progress");
    },
    [handleError]
  );

  // GET /health - Check API health
  const checkHealth = useCallback(async () => {
    const response = await fetch(`${API_BASE}/health`, {
      signal: AbortSignal.timeout(3000),
    });
    return handleError(response, "API health check failed");
  }, [handleError]);

  return {
    getScenarios,
    getScenarioDetail,
    startSession,
    endSession,
    getSessionDetails,
    getHistory,
    getHistoryDetail,
    getProgress,
    updateProgress,
    checkHealth,
  };
}
