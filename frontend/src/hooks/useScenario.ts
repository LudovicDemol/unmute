/**
 * API client hooks for ECOS backend
 * Handles REST calls to /scenarios, /sessions/*, /progress/*, etc.
 */

import { useCallback } from "react";

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

export function useScenario() {
  const handleError = useCallback((response: Response, context: string) => {
    if (!response.ok) {
      throw new Error(
        `${context}: ${response.status} ${response.statusText}`
      );
    }
    return response.json();
  }, []);

  const getScenarios = useCallback(async (): Promise<ScenarioListItem[]> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API_ECOS}/scenarios`);
    return handleError(response, "Failed to fetch scenarios");
  }, [handleError]);

  const getScenarioDetail = useCallback(
    async (id: string): Promise<ScenarioDetail> => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API_ECOS}/scenarios/${id}`);
      console.log(response);
      return handleError(response, `Failed to fetch scenario ${id}`);
    },
    [handleError]
  );

  const checkHealth = useCallback(async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API_ECOS}/health`, {
      signal: AbortSignal.timeout(3000),
    });
    return handleError(response, "API health check failed");
  }, [handleError]);

  return {
    getScenarios,
    getScenarioDetail,
    checkHealth,
  };
}
