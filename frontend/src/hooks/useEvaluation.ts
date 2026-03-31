import { useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchWithAuth } from '@/lib/api'

export type ChecklistScore = {
  itemId: string
  itemLabel: string
  itemMax: number
  scoring: 'binary' | 'partial'
  score: number
  llmReason?: string
}

export type CommunicationScore = {
  criterion:
    | 'ecoute_active'
    | 'qualite_questionnement'
    | 'information_patient'
    | 'relation_examen_clinique'
    | 'planification_collaborative'
  score: 0 | 0.25 | 0.5 | 0.75 | 1
  llmReason?: string
}

export type EvaluatePayload = {
  checklistScores: ChecklistScore[]
  communicationScores: CommunicationScore[]
  llmFeedback: string
  globalEvaluation: string
}

export type AttemptResult = {
  id: string
  status: string
  score_clinical: number
  score_clinical_max: number
  score_comm: number
  score_total: number
  llm_feedback: string
  global_evaluation: string
  attempt_checklist_scores: {
    item_id: string
    item_label: string
    item_max: number
    score: number
    llm_reason: string | null
  }[]
  attempt_communication_scores: {
    criterion: string
    score: number
    llm_reason: string | null
  }[]
  scenario: {
    id: string
    title: string
    domain: string
    category: string
  }
}

export function useEvaluation(onEvaluated?: () => void) {
  const queryClient = useQueryClient()

  const mutation = useMutation<AttemptResult, Error, { attemptId: string; payload: EvaluatePayload }>({
    mutationFn: async ({ attemptId, payload }) => {
      await fetchWithAuth(`/attempts/${attemptId}/evaluate`, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      return fetchWithAuth<AttemptResult>(`/attempts/${attemptId}/results`)
    },
    onSuccess: (_, { attemptId }) => {
      queryClient.invalidateQueries({ queryKey: ['attemptResults', attemptId] })
      queryClient.invalidateQueries({ queryKey: ['attemptHistory'] })
      onEvaluated?.()
    },
  })

  return {
    result: mutation.data ?? null,
    loading: mutation.isPending,
    error: mutation.error ?? null,
    evaluate: (attemptId: string, payload: EvaluatePayload) =>
      mutation.mutateAsync({ attemptId, payload }),
  }
}