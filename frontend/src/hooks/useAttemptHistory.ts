import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { fetchWithAuth } from '@/lib/api'

export interface AttemptSummary {
  id: string
  started_at: string
  ended_at: string | null
  status: 'in_progress' | 'completed' | 'evaluated'
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

export function useAttemptHistory(studentId?: string) {
  const authUser = useAuthStore(s => s.user)
  const effectiveId = studentId ?? authUser?.id

  return useQuery<AttemptSummary[], Error>({
    queryKey: ['attemptHistory', effectiveId],
    queryFn: () => fetchWithAuth<AttemptSummary[]>(`/attempts/student/${effectiveId}`),
    enabled: !!effectiveId,
    staleTime: 1 * 60 * 1000,
    retry: 1,
  })
}