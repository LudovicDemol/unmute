import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchWithAuth } from '@/lib/api'
import { AttemptResults } from './useAttempResults'

const POLL_INTERVAL_MS = 3000
const POLL_TIMEOUT_MS = 120_000

export function usePollResults(attemptId: string | null, enabled: boolean) {
  const [timedOut, setTimedOut] = useState(false)

  // Reset à chaque nouvelle tentative
  useEffect(() => {
    setTimedOut(false)
  }, [attemptId, enabled])

  useEffect(() => {
    if (!enabled || !attemptId) return
    const id = setTimeout(() => setTimedOut(true), POLL_TIMEOUT_MS)
    return () => clearTimeout(id)
  }, [attemptId, enabled])

  const query = useQuery<AttemptResults, Error>({
    queryKey: ['attemptResults', attemptId],
    queryFn: () => fetchWithAuth<AttemptResults>(`/attempts/${attemptId}/results`),
    enabled: !!attemptId && enabled && !timedOut,
    refetchInterval: (query) =>
      query.state.data?.status === 'evaluated' ? false : POLL_INTERVAL_MS,
    refetchOnWindowFocus: true,
    retry: 1,
    staleTime: 0,
  })

  return {
    results: query.data?.status === 'evaluated' ? query.data : null,
    timedOut,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}