// hooks/useAttemptHistory.ts
import { useState, useEffect } from "react"

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

export function useAttemptHistory(studentId: string) {
  const [attempts, setAttempts] = useState<AttemptSummary[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)

  useEffect(() => {
    if (!studentId || !process.env.NEXT_PUBLIC_URL_API_ECOS) return
    setLoading(true)
    fetch(`${process.env.NEXT_PUBLIC_URL_API_ECOS}/attempts/student/${studentId}`)
      .then(r => { if (!r.ok) throw new Error(`Erreur ${r.status}`); return r.json() })
      .then(setAttempts)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [studentId])

  return { attempts, loading, error }
}