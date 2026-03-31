import { useCallback, useState, useRef } from 'react'

export type TranscriptEntry = {
  role: 'student' | 'patient'
  text: string
  timestamp: string
}

export type AttemptStatus = 'idle' | 'in_progress' | 'completed' | 'evaluated' | 'error'

export function useAttempt(studentId: string) {
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [status, setStatus] = useState<AttemptStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  // Transcript accumulé en ref (évite closure stale dans callbacks STT)
  const transcriptRef = useRef<TranscriptEntry[]>([])
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([])

  const handleError = useCallback(async (res: Response, context: string) => {
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body?.error ?? `${context}: HTTP ${res.status}`)
    }
    return res.json()
  }, [])

  const startAttempt = useCallback(async (scenarioId: string): Promise<string | null> => {
    try {
      setStatus('in_progress')
      setError(null)
      transcriptRef.current = []
      setTranscript([])

      const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API_ECOS}/attempts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, scenarioId }),
      })
      const data = await handleError(res, 'Failed to start attempt')
      setAttemptId(data.id)
      return data.id
    } catch (e: any) {
      setStatus('error')
      setError(e.message)
      return null
    }
  }, [studentId, handleError])

  const addEntry = useCallback((role: 'student' | 'patient', text: string) => {
    const entry: TranscriptEntry = { role, text, timestamp: new Date().toISOString() }
    transcriptRef.current = [...transcriptRef.current, entry]
    setTranscript([...transcriptRef.current])
  }, [])

  const completeAttempt = useCallback(async (): Promise<void> => {
    if (!attemptId) return
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API_ECOS}/attempts/${attemptId}/transcript`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: transcriptRef.current }),
      })
      await handleError(res, 'Failed to save transcript')
      setStatus('completed')
    } catch (e: any) {
      setStatus('error')
      setError(e.message)
    }
  }, [attemptId, handleError])

  return {
    attemptId,
    status,
    error,
    transcript,
    startAttempt,
    addEntry,
    completeAttempt,
    // Accès ref pour callbacks STT asynchrones
    getTranscript: () => transcriptRef.current,
  }
}