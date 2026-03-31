import { useCallback, useState, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export type TranscriptEntry = {
  role: 'student' | 'patient'
  text: string
  timestamp: string
}

export type AttemptStatus = 'idle' | 'in_progress' | 'completed' | 'evaluated' | 'error'

const API_BASE = process.env.NEXT_PUBLIC_URL_API_ECOS

const handleError = async (res: Response, context: string) => {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error ?? `${context}: HTTP ${res.status}`)
  }
  return res.json()
}

const startAttemptApi = async (studentId: string, scenarioId: string) => {
  const res = await fetch(`${API_BASE}/attempts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId, scenarioId }),
  })
  return handleError(res, 'Failed to start attempt')
}

const completeAttemptApi = async (attemptId: string, transcript: TranscriptEntry[]) => {
  const res = await fetch(`${API_BASE}/attempts/${attemptId}/transcript`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript }),
  })
  return handleError(res, 'Failed to save transcript')
}

export function useAttempt(studentId: string) {
  const queryClient = useQueryClient()

  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [status, setStatus] = useState<AttemptStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  // Transcript accumulé en ref (évite closure stale dans callbacks STT)
  const transcriptRef = useRef<TranscriptEntry[]>([])
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([])

  const startAttemptMutation = useMutation({
    mutationFn: (scenarioId: string) => startAttemptApi(studentId, scenarioId),
    onMutate: () => {
      setStatus('in_progress')
      setError(null)
      transcriptRef.current = []
      setTranscript([])
    },
    onSuccess: (data) => {
      setAttemptId(data.id)
      queryClient.invalidateQueries({ queryKey: ['attemptHistory', studentId] })
      queryClient.invalidateQueries({ queryKey: ['attemptResults', data.id] })
    },
    onError: (err: any) => {
      setStatus('error')
      setError(err?.message ?? 'Erreur de démarrage')
    },
  })

  const completeAttemptMutation = useMutation({
    mutationFn: () => {
      if (!attemptId) throw new Error('Attempt ID requis')
      return completeAttemptApi(attemptId, transcriptRef.current)
    },
    onMutate: () => {
      setStatus('completed')
    },
    onSuccess: () => {
      if (attemptId) {
        queryClient.invalidateQueries({ queryKey: ['attemptHistory', studentId] })
        queryClient.invalidateQueries({ queryKey: ['attemptResults', attemptId] })
      }
    },
    onError: (err: any) => {
      setStatus('error')
      setError(err?.message ?? 'Erreur de fin de session')
    },
  })

  const startAttempt = useCallback(async (scenarioId: string): Promise<string | null> => {
    try {
      const data = await startAttemptMutation.mutateAsync(scenarioId)
      return data?.id ?? null
    } catch (e: any) {
      return null
    }
  }, [startAttemptMutation])

  const addEntry = useCallback((role: 'student' | 'patient', text: string) => {
    const entry: TranscriptEntry = { role, text, timestamp: new Date().toISOString() }
    transcriptRef.current = [...transcriptRef.current, entry]
    setTranscript([...transcriptRef.current])
  }, [])

  const completeAttempt = useCallback(async (): Promise<void> => {
    if (!attemptId) return
    await completeAttemptMutation.mutateAsync()
  }, [attemptId, completeAttemptMutation])

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