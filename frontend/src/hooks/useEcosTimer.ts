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
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef<number | null>(null); // ← timestamp de démarrage
  const remainingRef = useRef<number>(DURATION_SECONDS);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (!running) return;

    intervalRef.current = setInterval(() => {
      const next = remainingRef.current - 1;

      if (next <= 0) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        remainingRef.current = 0;
        setRemaining(0);
        setRunning(false);
        startedAtRef.current = null;
        Promise.resolve(onExpireRef.current()).catch(console.error);
        return;
      }

      remainingRef.current = next;
      setRemaining(next);
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const start = useCallback(() => {
    setRemaining(DURATION_SECONDS);
    startedAtRef.current = Date.now(); // ← mémorise le départ
    setRunning(true);
  }, []);

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setRemaining(DURATION_SECONDS);
    startedAtRef.current = null;
  }, []);

  // Basé sur le timestamp réel — insensible aux re-renders et aux pauses
  const getElapsedSeconds = useCallback(() => {
    if (!startedAtRef.current) return 0;
    return Math.floor((Date.now() - startedAtRef.current) / 1000);
  }, []); // ← plus de dépendance sur `remaining`

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const formatted = `${minutes}:${String(seconds).padStart(2, "0")}`;
  const progressPct = Math.round(((DURATION_SECONDS - remaining) / DURATION_SECONDS) * 100);

  let status: TimerStatus = "idle";
  if (running && remaining > 60) status = "running";
  else if (running && remaining <= 60) status = "warning";
  else if (remaining === 0) status = "expired";

  return { remaining, formatted, status, progressPct, start, reset, getElapsedSeconds };
}