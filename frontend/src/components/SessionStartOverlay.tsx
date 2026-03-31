"use client";

import { useEffect, useState } from "react";

interface SessionStartOverlayProps {
  visible: boolean;
  onReady: () => void;
  duration?: number;
}

const STEPS = [
  { label: "Initialisation de la session…",     duration: 900  },
  { label: "Chargement du cas clinique…",        duration: 900  },
  { label: "Connexion au patient virtuel…",      duration: 900  },
  { label: "Prêt — bonne consultation !",        duration: 600  },
];

export default function SessionStartOverlay({
  visible,
  onReady,
  duration,
}: SessionStartOverlayProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [exiting, setExiting] = useState(false);

  // Reset on each open
  useEffect(() => {
    if (!visible) {
      setStepIndex(0);
      setDone(false);
      setExiting(false);
      return;
    }

    let elapsed = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    STEPS.forEach((step, i) => {
      const t = setTimeout(() => {
        setStepIndex(i);
        if (i === STEPS.length - 1) {
          setDone(true);
          // Fade out then notify parent
          const exitTimer = setTimeout(() => {
            setExiting(true);
            setTimeout(onReady, 400);
          }, step.duration - 100);
          timers.push(exitTimer);
        }
      }, elapsed);
      timers.push(t);
      elapsed += step.duration;
    });

    return () => timers.forEach(clearTimeout);
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!visible) return null;

  const progress = done ? 100 : Math.round(((stepIndex) / STEPS.length) * 100);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm transition-opacity duration-400 ${
        exiting ? "opacity-0" : "opacity-100"
      }`}
      style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}
    >
      <div className="bg-white border border-slate-200 rounded-2xl shadow-lg p-8 w-full max-w-sm mx-4 flex flex-col gap-6">

        {/* Icon */}
        <div className="flex items-center justify-center">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-2 border-teal-100" />
            <div
              className={`absolute inset-0 rounded-full border-2 border-teal-500 border-t-transparent ${
                done ? "" : "animate-spin"
              } transition-all duration-300`}
            />
            {done && (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-6 h-6 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Step label */}
        <div className="text-center space-y-1">
          <p className="text-sm font-semibold text-slate-800 transition-all duration-300">
            {STEPS[stepIndex].label}
          </p>
          <p className="text-xs text-slate-400">
            Veuillez patienter quelques instants
          </p>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-300 font-mono">
            {STEPS.map((_, i) => (
              <span key={i} className={i <= stepIndex ? "text-teal-400" : ""}>
                {String(i + 1).padStart(2, "0")}
              </span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}