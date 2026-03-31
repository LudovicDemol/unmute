import { useEffect, useRef, useState } from 'react'
import { useBackendServerUrl } from './useBackendServerUrl'
import { AttemptResults } from './useAttempResults'

const POLL_INTERVAL_MS = 3000
const POLL_TIMEOUT_MS  = 120_000 // 2 min max

export function usePollResults(attemptId: string | null, enabled: boolean) {
  const [results, setResults]   = useState<AttemptResults | null>(null)
  const [timedOut, setTimedOut] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeoutRef  = useRef<ReturnType<typeof setTimeout>  | null>(null)

  useEffect(() => {
    if (!enabled || !attemptId || !process.env.NEXT_PUBLIC_URL_API_ECOS) return

    const poll = async () => {
      try {
        const r = await fetch(`${process.env.NEXT_PUBLIC_URL_API_ECOS}/attempts/${attemptId}/results`)
        if (r.ok) {
          const data = await r.json()
          setResults(data)
          cleanup()
        }
        // 400 = pas encore évalué → on continue à poller
      } catch {
        // réseau flaky → on continue
      }
    }

    const cleanup = () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (timeoutRef.current)  clearTimeout(timeoutRef.current)
    }

    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS)
    timeoutRef.current  = setTimeout(() => {
      cleanup()
      setTimedOut(true)
    }, POLL_TIMEOUT_MS)

    poll() // premier appel immédiat

    return cleanup
  }, [enabled, attemptId, process.env.NEXT_PUBLIC_URL_API_ECOS])

  return { results, timedOut }
}