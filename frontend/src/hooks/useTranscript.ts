import { useState, useCallback, useRef } from 'react'
import { TranscriptEntry } from './useAttempt'

export function useTranscript() {
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([])
  const transcriptRef = useRef<TranscriptEntry[]>([]) // ref pour accès dans les callbacks audio

  const addEntry = useCallback((role: 'student' | 'patient', text: string) => {
    const entry: TranscriptEntry = {
      role,
      text,
      timestamp: new Date().toISOString(),
    }
    transcriptRef.current = [...transcriptRef.current, entry]
    setTranscript([...transcriptRef.current])
  }, [])

  const reset = useCallback(() => {
    transcriptRef.current = []
    setTranscript([])
  }, [])

  // Accès direct à la ref pour les callbacks STT (évite les closures stales)
  const getTranscript = useCallback(() => transcriptRef.current, [])

  return { transcript, addEntry, reset, getTranscript }
}