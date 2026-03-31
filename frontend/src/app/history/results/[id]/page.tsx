"use client"
import { useParams, useRouter } from "next/navigation"
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  XCircle,
  MinusCircle,
  MessageSquare,
  ClipboardList,
  Star,
  Clock,
} from "lucide-react"
import { useAttemptResults } from "@/hooks/useAttempResults"
import { getDomainLabel } from "@/utils/labelUtil"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(start: string, end: string | null): string {
  if (!end) return "—"
  const diff = Math.floor((new Date(end).getTime() - new Date(start).getTime()) / 1000)
  const m = Math.floor(diff / 60)
  const s = diff % 60
  return `${m}m ${s.toString().padStart(2, "0")}s`
}

function scoreColor(pct: number) {
  if (pct >= 0.75) return "text-teal-600"
  if (pct >= 0.5)  return "text-yellow-500"
  return "text-red-500"
}

function progressBarColor(pct: number) {
  if (pct >= 0.75) return "bg-teal-500"
  if (pct >= 0.5)  return "bg-yellow-400"
  return "bg-red-400"
}

const GLOBAL_EVAL_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  excellent:    { bg: "bg-teal-50 border-teal-200",    text: "text-teal-700",   label: "Excellent" },
  bien:         { bg: "bg-blue-50 border-blue-200",    text: "text-blue-700",   label: "Bien" },
  passable:     { bg: "bg-yellow-50 border-yellow-200",text: "text-yellow-700", label: "Passable" },
  insuffisant:  { bg: "bg-red-50 border-red-200",      text: "text-red-700",    label: "Insuffisant" },
}

function CommScoreDots({ score }: { score: number }) {
  const levels = [0, 0.25, 0.5, 0.75, 1]
  return (
    <div className="flex items-center gap-1">
      {levels.map((lvl) => (
        <div
          key={lvl}
          className={`w-2.5 h-2.5 rounded-full border transition-colors ${
            score >= lvl
              ? "bg-teal-500 border-teal-500"
              : "bg-slate-100 border-slate-300"
          }`}
        />
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ResultsPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { results, loading, error } = useAttemptResults(id)

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center space-y-4">
          <div className="relative mx-auto w-10 h-10">
            <div className="absolute inset-0 rounded-full border-2 border-teal-100" />
            <div className="absolute inset-0 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
          </div>
          <p className="text-sm font-medium text-slate-400 tracking-wide uppercase">
            Chargement des résultats…
          </p>
        </div>
      </div>
    )
  }

  // ── Error ──
  if (error || !results) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-5 h-5 text-red-400" />
          </div>
          <h2 className="text-base font-semibold text-slate-800 mb-1">
            Résultats introuvables
          </h2>
          <p className="text-sm text-slate-400 mb-4">{error ?? "Tentative inconnue"}</p>
          <button
            onClick={() => router.push("/scenarios")}
            className="flex items-center gap-2 mx-auto bg-teal-500 text-white px-4 py-2 rounded-xl hover:bg-teal-600 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux scénarios
          </button>
        </div>
      </div>
    )
  }

  // ── Computed values ──
  const clinicalPct  = results.score_clinical_max > 0
    ? results.score_clinical / results.score_clinical_max
    : 0
  const clinicalOn20 = Math.round((clinicalPct * 14) * 100) / 100
  const commPct      = results.score_comm / 5
  const commOn20     = Math.round((commPct * 6) * 100) / 100
  const totalPct     = results.score_total / 20
  const evalStyle    = GLOBAL_EVAL_STYLES[results.global_evaluation ?? ""] ?? null
  const duration     = formatDuration(results.started_at, results.ended_at)

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Top bar ── */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux scénarios
        </button>
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <Clock className="w-4 h-4" />
          {duration}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        {/* ── Hero score ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                {results.scenario.category}{results.scenario.domain ? ` · ${getDomainLabel(results.scenario.domain)}` : ""}
              </p>
              <h1 className="text-xl font-bold text-slate-900 mb-1">
                {results.scenario.title}
              </h1>
              {evalStyle && (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${evalStyle.bg} ${evalStyle.text}`}>
                  <Star className="w-3.5 h-3.5" />
                  {evalStyle.label}
                </span>
              )}
            </div>

            {/* Score total */}
            <div className="flex-shrink-0 text-center bg-slate-50 border border-slate-200 rounded-2xl px-8 py-4">
              <p className={`text-5xl font-bold tabular-nums ${scoreColor(totalPct)}`}>
                {results.score_total}
              </p>
              <p className="text-slate-400 text-sm mt-1 font-medium">/ 20</p>
            </div>
          </div>

          {/* Score breakdown */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            {/* Clinique */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Score clinique
                </p>
                <span className={`text-base font-bold tabular-nums ${scoreColor(clinicalPct)}`}>
                  {clinicalOn20} <span className="text-slate-400 font-normal text-xs">/ 14</span>
                </span>
              </div>
              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${progressBarColor(clinicalPct)}`}
                  style={{ width: `${clinicalPct * 100}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1.5">
                {results.score_clinical} / {results.score_clinical_max} pts bruts
              </p>
            </div>

            {/* Communication */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Communication
                </p>
                <span className={`text-base font-bold tabular-nums ${scoreColor(commPct)}`}>
                  {commOn20} <span className="text-slate-400 font-normal text-xs">/ 6</span>
                </span>
              </div>
              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${progressBarColor(commPct)}`}
                  style={{ width: `${commPct * 100}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1.5">
                {results.score_comm} / 5 pts bruts
              </p>
            </div>
          </div>
        </div>

        {/* ── Feedback LLM ── */}
        {results.llm_feedback && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-teal-500" />
              <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                Feedback global
              </h2>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">
              {results.llm_feedback}
            </p>
          </div>
        )}

        {/* ── Checklist clinique ── */}
        {results.attempt_checklist_scores.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-teal-500" />
              <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                Checklist clinique
              </h2>
              <span className="ml-auto text-xs text-slate-400">
                {results.attempt_checklist_scores.filter(i => i.score > 0).length} / {results.attempt_checklist_scores.length} items validés
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {results.attempt_checklist_scores.map((item) => {
                const itemPct  = item.item_max > 0 ? item.score / item.item_max : 0
                const isOk     = itemPct >= 1
                const isPartial= itemPct > 0 && itemPct < 1
                const isKo     = itemPct === 0

                return (
                  <div key={item.id} className="px-6 py-4 flex items-start gap-3">
                    <div className="mt-0.5 flex-shrink-0">
                      {isOk      && <CheckCircle  className="w-4 h-4 text-teal-500" />}
                      {isPartial && <MinusCircle  className="w-4 h-4 text-yellow-400" />}
                      {isKo      && <XCircle      className="w-4 h-4 text-red-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-medium ${
                          isOk ? "text-slate-800" : isPartial ? "text-slate-700" : "text-slate-500"
                        }`}>
                          {item.item_label}
                        </p>
                        <span className={`flex-shrink-0 text-xs font-semibold tabular-nums px-2 py-0.5 rounded-full ${
                          isOk      ? "bg-teal-50 text-teal-700"    :
                          isPartial ? "bg-yellow-50 text-yellow-700" :
                                      "bg-red-50 text-red-500"
                        }`}>
                          {item.score} / {item.item_max}
                        </span>
                      </div>
                      {item.llm_reason && (
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {item.llm_reason}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Scores communication ── */}
        {results.attempt_communication_scores.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-teal-500" />
              <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                Compétences de communication
              </h2>
            </div>
            <div className="divide-y divide-slate-100">
              {results.attempt_communication_scores.map((item) => (
                <div key={item.id} className="px-6 py-4 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <p className="text-sm font-medium text-slate-800">
                        {item.criterion}
                      </p>
                      <CommScoreDots score={item.score} />
                    </div>
                    {item.llm_reason && (
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {item.llm_reason}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Transcript ── */}
        {results.transcript && results.transcript.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                Transcript de la session
              </h2>
            </div>
            <div className="px-6 py-4 space-y-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
              {results.transcript.map((entry, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${entry.role === "student" ? "flex-row-reverse" : ""}`}
                >
                  <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                    entry.role === "student"
                      ? "bg-teal-100 text-teal-700"
                      : "bg-slate-100 text-slate-600"
                  }`}>
                    {entry.role === "student" ? "E" : "P"}
                  </div>
                  <div className={`max-w-[75%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                    entry.role === "student"
                      ? "bg-teal-50 text-teal-900 border border-teal-100"
                      : "bg-slate-50 text-slate-700 border border-slate-200"
                  }`}>
                    {entry.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CTA ── */}
        <div className="flex justify-center pb-8">
          <button
            onClick={() => router.push("/scenarios")}
            className="flex items-center gap-2 bg-teal-500 text-white px-6 py-3 rounded-xl hover:bg-teal-600 transition-colors font-medium"
          >
            Nouvelle session ?
          </button>
        </div>

      </div>
    </div>
  )
}