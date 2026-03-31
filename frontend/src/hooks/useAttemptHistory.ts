// hooks/useAttemptHistory.ts
import { useQuery } from "@tanstack/react-query"

export interface AttemptSummary {
  id: string
  started_at: string
  ended_at: string | null
  status: "in_progress" | "completed" | "evaluated"
  score_total: number | null
  global_evaluation: string | null
  scenario: {
    id: string
    title: string
    category: string | null
    domain: string | null
    type: string | null
    firstname: string | null
    lastname: string | null
    age: number | null
  }
}

const fetchAttemptHistory = async (studentId: string): Promise<AttemptSummary[]> => {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), 8000)

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API_ECOS}/attempts/student/${studentId}`, {
      signal: controller.signal,
    })
    if (!res.ok) throw new Error(`Erreur ${res.status}`)
    return res.json()
  } finally {
    clearTimeout(timeoutId)
  }
}

export function useAttemptHistory(studentId: string) {
  return useQuery<AttemptSummary[], Error>({
    queryKey: ["attemptHistory", studentId],
    queryFn: () => fetchAttemptHistory(studentId),
    enabled: !!studentId,
    staleTime: 1 * 60 * 1000,
    retry: 1,
  })
}
