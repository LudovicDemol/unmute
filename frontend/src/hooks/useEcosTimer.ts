// hooks/useEcosTimer.ts
import { useCallback, useEffect, useRef, useState } from "react";

const DURATION_SECONDS = 1 * 30;

export type TimerStatus = "idle" | "running" | "warning" | "expired";

export interface EcosTimerResult {
  remaining: number;
  formatted: string;
  status: TimerStatus;
  progressPct: number;
  start: () => void;
  reset: () => void;
  getElapsedSeconds: () => number;
}

export function useEcosTimer(onExpire: () => void | Promise<void>): EcosTimerResult {
  const [remaining, setRemaining] = useState(DURATION_SECONDS);
  const [running, setRunning] = useState(false);
  const onExpireRef = useRef(onExpire);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null) // ← ref stable

  useEffect(() => { onExpireRef.current = onExpire; }, [onExpire]);

  useEffect(() => {
    if (!running) return;

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          // Stoppe l'interval via la ref, pas via la closure
          if (intervalRef.current) clearInterval(intervalRef.current)
          setRunning(false);
          // Lance onExpire de façon non-bloquante (supporte async)
          Promise.resolve(onExpireRef.current()).catch(console.error)
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [running]);

  const start = useCallback(() => {
    setRemaining(DURATION_SECONDS);
    setRunning(true);
  }, []);

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setRunning(false);
    setRemaining(DURATION_SECONDS);
  }, []);

  

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const formatted = `${minutes}:${String(seconds).padStart(2, "0")}`;
  const progressPct = Math.round(((DURATION_SECONDS - remaining) / DURATION_SECONDS) * 100);

  let status: TimerStatus = "idle";
  if (running && remaining > 60) status = "running";
  else if (running && remaining <= 60) status = "warning";
  else if (remaining === 0) status = "expired";

  const getElapsedSeconds = useCallback(() => {
  return DURATION_SECONDS - remaining
  }, [remaining])

  return { remaining, formatted, status, progressPct, start, reset, getElapsedSeconds };
}