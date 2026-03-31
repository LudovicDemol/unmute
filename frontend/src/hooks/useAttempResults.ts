import { useQuery } from '@tanstack/react-query'
import { fetchWithAuth } from '@/lib/api'

export interface ChecklistScore {
  id: string
  attempt_id: string
  item_id: string
  item_label: string
  item_max: number
  scoring: 'binary' | 'partial'
  score: number
  llm_reason: string | null
}

export interface CommunicationScore {
  id: string
  attempt_id: string
  criterion: string
  score: number
  llm_reason: string | null
}

export interface AttemptResults {
  id: string
  started_at: string
  ended_at: string | null
  status: string
  score_clinical: number
  score_clinical_max: number
  score_comm: number
  score_total: number
  llm_feedback: string | null
  global_evaluation: 'excellent' | 'bien' | 'passable' | 'insuffisant' | null
  transcript: { role: string; text: string; timestamp: string }[] | null
  attempt_checklist_scores: ChecklistScore[]
  attempt_communication_scores: CommunicationScore[]
  scenario: {
    id: string
    title: string
    domain: string | null
    category: string | null
  }
}

export function useAttemptResults(attemptId: string | null) {
  return useQuery<AttemptResults, Error>({
    queryKey: ['attemptResults', attemptId],
    queryFn: () => fetchWithAuth<AttemptResults>(`/attempts/${attemptId}/results`),
    enabled: !!attemptId,
    staleTime: 1 * 60 * 1000,
    retry: 1,
  })
}