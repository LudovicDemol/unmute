"use client"
import { useRouter } from "next/navigation"
import { useAttemptHistory, AttemptSummary } from "@/hooks/useAttemptHistory"
import { useAuthStore } from "@/stores/authStore"
import {
  AlertCircle,
  Clock,
  ChevronRight,
  CheckCircle,
  XCircle,
  Loader2,
  CalendarDays,
  Stethoscope,
  Trophy,
} from "lucide-react"
import { getDomainLabel } from "@/utils/labelUtil"
import AuthGuard from "@/components/AuthGuard"


// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
}

function formatDuration(start: string, end: string | null) {
  if (!end) return null
  const diff = Math.floor((new Date(end).getTime() - new Date(start).getTime()) / 1000)
  const m = Math.floor(diff / 60)
  const s = diff % 60
  return `${m}m ${s.toString().padStart(2, "0")}s`
}

const STATUS_CONFIG = {
  evaluated: {
    label: "Évalué",
    icon: <CheckCircle className="w-3.5 h-3.5" />,
    className: "bg-teal-50 text-teal-700 border-teal-200",
  },
  completed: {
    label: "Terminé sans évaluation",
    icon: <CheckCircle className="w-3.5 h-3.5" />,
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  in_progress: {
    label: "En cours",
    icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
    className: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  abandoned: {
    label: "Abandonné",
    icon: <XCircle className="w-3.5 h-3.5" />,
    className: "bg-red-50 text-red-700 border-red-200",
  },
}

const GLOBAL_EVAL_CONFIG: Record<string, { label: string; color: string }> = {
  remarquable:      { label: "Remarquable",      color: "text-teal-600" },
  tres_satisfaisant:{ label: "Très satisfaisant", color: "text-teal-500" },
  satisfaisant:     { label: "Satisfaisant",      color: "text-blue-500" },
  limite:           { label: "Limite",            color: "text-yellow-500" },
  insuffisant:      { label: "Insuffisant",       color: "text-red-500" },
}

function scoreColor(score: number) {
  const pct = score / 20
  if (pct >= 0.75) return "text-teal-600"
  if (pct >= 0.5)  return "text-yellow-500"
  return "text-red-500"
}

// ─── Item ─────────────────────────────────────────────────────────────────────

function AttemptItem({ attempt, onClick }: { attempt: AttemptSummary; onClick: () => void }) {
  const status   = STATUS_CONFIG[attempt.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.in_progress
  const evalConf = attempt.global_evaluation ? GLOBAL_EVAL_CONFIG[attempt.global_evaluation] : null
  const duration = formatDuration(attempt.started_at, attempt.ended_at)
  const isClickable = attempt.status === "evaluated"

  return (
    <div
      onClick={isClickable ? onClick : undefined}
      className={`bg-white border border-slate-200 rounded-xl p-4 shadow-sm transition-all ${
        isClickable
          ? "hover:shadow-md hover:border-teal-200 cursor-pointer"
          : "opacity-80 cursor-default"
      }`}
    >
      <div className="flex items-start justify-between gap-3">

        {/* Left */}
        <div className="flex-1 min-w-0">

          {/* Top row : badges */}
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            {attempt.scenario.category && (
              <span className="px-2.5 py-0.5 bg-teal-50 text-teal-700 border border-teal-100 rounded-full text-xs font-medium">
                {attempt.scenario.category}
              </span>
            )}
            {attempt.scenario.domain && (
              <span className="px-2.5 py-0.5 bg-slate-50 text-slate-500 border border-slate-200 rounded-full text-xs">
                {getDomainLabel(attempt.scenario.domain)}
              </span>
            )}
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 border rounded-full text-xs font-medium ${status.className}`}>
              {status.icon}
              {status.label}
            </span>
          </div>

          {/* Title */}
          <p className="text-sm font-semibold text-slate-800 truncate mb-1">
            {attempt.scenario.title}
          </p>

          {/* Patient */}
          {attempt.scenario.firstname && (
            <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
              <Stethoscope className="w-3 h-3" />
              {attempt.scenario.firstname} {attempt.scenario.lastname}
              {attempt.scenario.age ? `, ${attempt.scenario.age} ans` : ""}
            </p>
          )}

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <CalendarDays className="w-3 h-3" />
              {formatDate(attempt.started_at)} à {formatTime(attempt.started_at)}
            </span>
            {duration && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {duration}
              </span>
            )}
            {evalConf && (
              <span className={`flex items-center gap-1 font-medium ${evalConf.color}`}>
                <Trophy className="w-3 h-3" />
                {evalConf.label}
              </span>
            )}
          </div>
        </div>

        {/* Right : score + chevron */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {attempt.score_total !== null ? (
            <div className="text-right">
              <p className={`text-2xl font-bold tabular-nums ${scoreColor(attempt.score_total)}`}>
                {attempt.score_total}
              </p>
              <p className="text-xs text-slate-400">/ 20</p>
            </div>
          ) : (
            <div className="text-right">
              <p className="text-2xl font-bold text-slate-200">—</p>
              <p className="text-xs text-slate-300">/ 20</p>
            </div>
          )}
          {isClickable && (
            <ChevronRight className="w-4 h-4 text-slate-300" />
          )}
        </div>

      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HistoryPage() {
  const router = useRouter()
  const userId = useAuthStore((s) => s.user?.id)
  const { data: attempts = [], isLoading, isError, error } = useAttemptHistory(userId)

  return (
    <AuthGuard>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
          <div className="text-center space-y-4">
            <div className="relative mx-auto w-10 h-10">
              <div className="absolute inset-0 rounded-full border-2 border-teal-100" />
              <div className="absolute inset-0 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
            </div>
            <p className="text-sm font-medium text-slate-400 tracking-wide uppercase">
              Chargement de l'historique…
            </p>
          </div>
        </div>
      ) : isError ? (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
          <div className="text-center max-w-sm">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
            <h2 className="text-base font-semibold text-slate-800 mb-1">Erreur de chargement</h2>
            <p className="text-sm text-slate-400">{error instanceof Error ? error.message : "Erreur de chargement"}</p>
          </div>
        </div>
      ) : (
        <div className="p-8 max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Historique</h1>
            <p className="text-slate-500 text-sm">Toutes vos sessions d'entraînement ECOS</p>
          </div>

          {attempts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-5 h-5 text-slate-300" />
              </div>
              <p className="text-slate-500 text-sm">Aucune session pour le moment.</p>
              <button
                onClick={() => router.push("/scenarios")}
                className="mt-4 bg-teal-500 text-white px-4 py-2 rounded-xl hover:bg-teal-600 transition-colors text-sm"
              >
                Démarrer un scénario
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {attempts.map((attempt) => (
                <AttemptItem
                  key={attempt.id}
                  attempt={attempt}
                  onClick={() => router.push(`/history/results/${attempt.id}`)}
                />
              ))}
            </div>
          )}

          {attempts.length > 0 && (
            <p className="text-center text-xs text-slate-300 mt-8">
              {attempts.length} session{attempts.length > 1 ? "s" : ""} au total
            </p>
          )}
        </div>
      )}
    </AuthGuard>
  )
}
