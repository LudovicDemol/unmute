/**
 * API client hooks for ECOS backend
 * Handles REST calls to /scenarios, /sessions/*, /progress/*, etc.
 */

import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";

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

const handleError = async (response: Response, context: string) => {
  if (!response.ok) throw new Error(`${context}: ${response.status} ${response.statusText}`);
  return response.json();
};

const fetchWithTimeout = async <T>(url: string, timeoutMs = 8000): Promise<T> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { signal: controller.signal });
    return await handleError(res, `Failed to fetch ${url}`);
  } finally {
    clearTimeout(timeout);
  }
};

export const fetchScenarios = async (): Promise<ScenarioListItem[]> => {
  return fetchWithTimeout<ScenarioListItem[]>(`${process.env.NEXT_PUBLIC_URL_API_ECOS}/scenarios`);
};

export const fetchScenarioDetail = async (id: string): Promise<ScenarioDetail> => {
  return fetchWithTimeout<ScenarioDetail>(`${process.env.NEXT_PUBLIC_URL_API_ECOS}/scenarios/${id}`);
};

export const checkHealth = async () => {
  return fetchWithTimeout(`${process.env.NEXT_PUBLIC_URL_API_ECOS}/health`, 3000);
};

export function useScenario() {
  const getScenarios = useCallback(fetchScenarios, []);
  const getScenarioDetail = useCallback(fetchScenarioDetail, []);
  return { getScenarios, getScenarioDetail, checkHealth };
}

export function useScenarios() {
  return useQuery<ScenarioListItem[]>({
    queryKey: ["scenarios"],
    queryFn: fetchScenarios,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: true,
  });
}

export function useScenarioDetail(id?: string) {
  return useQuery<ScenarioDetail>({
    queryKey: ["scenario", id],
    queryFn: () => {
      if (!id) throw new Error("Scenario ID is required");
      return fetchScenarioDetail(id);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: true,
  });
}
