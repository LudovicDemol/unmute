import { useCallback, useState } from 'react'

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001'

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
  const [result, setResult] = useState<AttemptResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleError = useCallback(async (res: Response, context: string) => {
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body?.error ?? `${context}: HTTP ${res.status}`)
    }
    return res.json()
  }, [])

  const evaluate = useCallback(async (
    attemptId: string,
    payload: EvaluatePayload
  ): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      const evalRes = await fetch(`${API_BASE}/attempts/${attemptId}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      await handleError(evalRes, 'Failed to evaluate attempt')

      const resultsRes = await fetch(`${API_BASE}/attempts/${attemptId}/results`)
      const data = await handleError(resultsRes, 'Failed to fetch results')

      setResult(data)
      onEvaluated?.()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [handleError, onEvaluated])

  return { result, loading, error, evaluate }
}