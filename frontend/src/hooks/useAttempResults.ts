import { useState, useEffect } from "react"
import { useBackendServerUrl } from "./useBackendServerUrl"

export interface ChecklistScore {
  id: string
  attempt_id: string
  item_id: string
  item_label: string
  item_max: number
  scoring: "binary" | "partial"
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
  global_evaluation: "excellent" | "bien" | "passable" | "insuffisant" | null
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
  const [results, setResults] = useState<AttemptResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!attemptId || !process.env.NEXT_PUBLIC_URL_API_ECOS) return
    setLoading(true)
    setError(null)
    fetch(`${process.env.NEXT_PUBLIC_URL_API_ECOS}/attempts/${attemptId}/results`)
      .then((r) => {
        if (!r.ok) throw new Error(`Erreur ${r.status}`)
        return r.json()
      })
      .then((data) => setResults(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [attemptId, process.env.NEXT_PUBLIC_URL_API_ECOS])

  return { results, loading, error }
}