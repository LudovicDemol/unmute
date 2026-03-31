import { useCallback, useState, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { fetchWithAuth } from '@/lib/api'

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

const startAttemptApi = (studentId: string, scenarioId: string) =>
  fetchWithAuth('/attempts', {
    method: 'POST',
    body: JSON.stringify({ studentId, scenarioId }),
  })

const completeAttemptApi = (attemptId: string, transcript: TranscriptEntry[]) =>
  fetchWithAuth(`/attempts/${attemptId}/transcript`, {
    method: 'PATCH',
    body: JSON.stringify({ transcript }),
  })

  
export function useAttempt(studentId?: string) {
  const queryClient = useQueryClient()
  const authUser = useAuthStore((s) => s.user)
  const effectiveStudentId = studentId ?? authUser?.id

  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [status, setStatus] = useState<AttemptStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  // Transcript accumulé en ref (évite closure stale dans callbacks STT)
  const transcriptRef = useRef<TranscriptEntry[]>([])
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([])

  const startAttemptMutation = useMutation({
    mutationFn: (scenarioId: string) => {
      if (!effectiveStudentId) throw new Error('Authentification requise pour démarrer une session')
      return startAttemptApi(effectiveStudentId, scenarioId)
    },
    onMutate: () => {
      setStatus('in_progress')
      setError(null)
      transcriptRef.current = []
      setTranscript([]) 
    },
    onSuccess: (data: any) => {
      setAttemptId(data.id)
      if (effectiveStudentId) {
        queryClient.invalidateQueries({ queryKey: ['attemptHistory', effectiveStudentId] })
      }
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
        if (effectiveStudentId) {
          queryClient.invalidateQueries({ queryKey: ['attemptHistory', effectiveStudentId] })
        }
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