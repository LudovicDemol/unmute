import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AttemptResults } from './useAttempResults'

const POLL_INTERVAL_MS = 3000
const POLL_TIMEOUT_MS  = 120_000 // 2 min max

const fetchAttemptResults = async (attemptId: string): Promise<AttemptResults> => {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), 8000)

  try {
    const r = await fetch(`${process.env.NEXT_PUBLIC_URL_API_ECOS}/attempts/${attemptId}/results`, {
      signal: controller.signal,
    })

    if (!r.ok) {
      throw new Error(`Erreur ${r.status}`)
    }

    return r.json()
  } finally {
    clearTimeout(timeoutId)
  }
}

export function usePollResults(attemptId: string | null, enabled: boolean) {
  const [timedOut, setTimedOut] = useState(false)

  const query = useQuery<AttemptResults, Error>({
    queryKey: ['attemptResults', attemptId],
    queryFn: () => {
      if (!attemptId) throw new Error('Attempt ID requis')
      return fetchAttemptResults(attemptId)
    },
    enabled: !!attemptId && enabled && !timedOut,
    refetchInterval: (query) => {
      const latestData = query.state.data as AttemptResults | undefined
      return latestData?.status === 'evaluated' ? false : POLL_INTERVAL_MS
    },
    refetchOnWindowFocus: true,
    retry: 1,
    staleTime: 0,
  })

  useEffect(() => {
    setTimedOut(false)
  }, [attemptId, enabled])

  useEffect(() => {
    if (!enabled || !attemptId) return

    const timerId = window.setTimeout(() => setTimedOut(true), POLL_TIMEOUT_MS)
    return () => window.clearTimeout(timerId)
  }, [attemptId, enabled])

  return {
    results: query.data ?? null,
    timedOut,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
