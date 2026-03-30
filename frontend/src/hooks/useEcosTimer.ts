// hooks/useEcosTimer.ts
import { useCallback, useEffect, useRef, useState } from "react";

const DURATION_SECONDS = 8 * 60; 

export type TimerStatus = "idle" | "running" | "warning" | "expired";

export interface EcosTimerResult {
  remaining: number;        // secondes restantes
  formatted: string;        // "7:42"
  status: TimerStatus;      // pour les styles conditionnels
  progressPct: number;      // 0 → 100 (pour une barre de progression)
  start: () => void;
  reset: () => void;
}

export function useEcosTimer(onExpire: () => void): EcosTimerResult {
  const [remaining, setRemaining] = useState(DURATION_SECONDS);
  const [running, setRunning] = useState(false);
  const onExpireRef = useRef(onExpire);

  // Garder onExpire stable sans le mettre en dépendance
  useEffect(() => { onExpireRef.current = onExpire; }, [onExpire]);

  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setRunning(false);
          onExpireRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [running]);

  const start = useCallback(() => {
    setRemaining(DURATION_SECONDS);
    setRunning(true);
  }, []);

  const reset = useCallback(() => {
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

  return { remaining, formatted, status, progressPct, start, reset };
}