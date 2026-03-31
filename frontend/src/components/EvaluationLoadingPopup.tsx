"use client";
import { useEffect, useRef, useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";

interface Step {
  label: string;
  duration: number;
}

const STEPS: Step[] = [
  { label: "Finalisation de la session…",       duration: 1200 },
  { label: "Analyse de la conversation…",        duration: 2000 },
  { label: "Évaluation clinique en cours…",      duration: 1000 },
  { label: "Évaluation de la communication…",    duration: 2000 },
  { label: "Calcul du score final…",             duration: 500 },
  { label: "Préparation des résultats…",         duration: 1000 },
];

const FAKE_MAX = 99;

interface EvaluationLoadingPopupProps {
  visible: boolean;
  done: boolean;
  onComplete?: () => void;
}

export default function EvaluationLoadingPopup({ visible, done, onComplete }: EvaluationLoadingPopupProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const hasCalledComplete = useRef(false)
  const allFakeStepsDone = completedSteps.length >= STEPS.length
  const progress = done
    ? 100
    : allFakeStepsDone
    ? FAKE_MAX
    : (completedSteps.length / STEPS.length) * FAKE_MAX;

  // Dernière étape reste "active" (spinner) si toutes les fausses étapes sont
  // passées mais que l'API n'a pas encore répondu
  const isStuck = allFakeStepsDone && !done;

  useEffect(() => {
    if (allFakeStepsDone && done && !hasCalledComplete.current) {
      hasCalledComplete.current = true
      onComplete?.()
    }
  }, [allFakeStepsDone, done, onComplete])

    useEffect(() => {
    if (!visible) {
        setCurrentStep(0)
        setCompletedSteps([])
        hasCalledComplete.current = false
        return
    }
    if (currentStep >= STEPS.length) return

    const timer = setTimeout(() => {
        setCompletedSteps((prev) => [...prev, currentStep])
        setCurrentStep((prev) => prev + 1)
    }, STEPS[currentStep].duration)

    return () => clearTimeout(timer)
    }, [visible, currentStep])

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="relative w-10 h-10 flex-shrink-0">
              <div className="absolute inset-0 rounded-full border-2 border-teal-100" />
              <div className="absolute inset-0 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
            </div>
            <div>
              <h2 className="text-slate-900 font-semibold text-base">
                Session terminée
              </h2>
              <p className="text-slate-500 text-sm">
                Évaluation de votre performance en cours…
              </p>
              <p className="text-slate-400 text-xs mt-0.5">
                Cela peut prendre plusieurs minutes, merci de patienter
              </p>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="px-6 py-5 space-y-3">
          {STEPS.map((step, index) => {
            const isDone    = completedSteps.includes(index);
            // Dernière étape reste active si on est bloqué à 99%
            const isActive  = isStuck
              ? index === STEPS.length - 1
              : currentStep === index;
            const isPending = !isDone && !isActive;

            return (
              <div
                key={index}
                className={`flex items-center gap-3 transition-all duration-300 ${
                  isPending ? "opacity-30" : "opacity-100"
                }`}
              >
                <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                  {isDone && !isStuck ? (
                    <CheckCircle className="w-5 h-5 text-teal-500" />
                  ) : isActive ? (
                    <Loader2 className="w-4 h-4 text-teal-500 animate-spin" />
                  ) : isDone && isStuck && index < STEPS.length - 1 ? (
                    <CheckCircle className="w-5 h-5 text-teal-500" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-slate-300 mx-auto" />
                  )}
                </div>

                <span className={`text-sm transition-colors duration-300 ${
                  (isDone && !isStuck) || (isDone && isStuck && index < STEPS.length - 1)
                    ? "text-teal-600 font-medium"
                    : isActive
                    ? "text-slate-800 font-medium"
                    : "text-slate-400"
                }`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="px-6 pb-6">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-400">Progression</span>
            <span className="text-xs font-medium text-teal-600">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div
              className="h-full bg-teal-500 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}