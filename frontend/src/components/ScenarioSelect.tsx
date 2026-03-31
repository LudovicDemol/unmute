"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useEcosSession } from "@/hooks/useEcosSession";
import { useEcosApi, type ScenarioListItem } from "@/hooks/useEcosApi";
import ScenarioFilters from "@/components/ScenarioFilters";

interface ScenarioSelectProps {
  userId?: string;
  onSessionStarted?: (sessionId: string) => void;
}

export default function ScenarioSelectPage({
  userId = "user_default",
  onSessionStarted,
}: ScenarioSelectProps) {
  const router = useRouter();
  const { getScenarios } = useEcosApi();

  const [scenarios, setScenarios] = useState<ScenarioListItem[]>([]);
  const [filteredScenarios, setFilteredScenarios] = useState<ScenarioListItem[]>([]);
  const [loading, setLoadingLocal] = useState(true);
  const [error, setErrorLocal] = useState<string | null>(null);

  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        setLoadingLocal(true);
        const data = await getScenarios();
        setScenarios(data);
        setFilteredScenarios(data);
        setErrorLocal(null);
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Erreur lors de la récupération";
        setErrorLocal(errorMsg);
      } finally {
        setLoadingLocal(false);
      }
    };

    fetchScenarios();
  }, [getScenarios]);

  const navigateToScenario = (scenarioId: string) => {
    router.push(`/conversation/${scenarioId}`);
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center space-y-4">
          <div className="relative mx-auto w-10 h-10">
            <div className="absolute inset-0 rounded-full border-2 border-teal-100"></div>
            <div className="absolute inset-0 rounded-full border-2 border-teal-500 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-sm font-medium text-slate-400 tracking-wide uppercase">
            Chargement des scénarios
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-slate-800 mb-1">Une erreur est survenue</h2>
          <p className="text-sm text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-800"
    >
      <div className="max-w-6xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-semibold text-teal-500 uppercase tracking-widest mb-2">
            Cas cliniques disponibles
          </p>
          <h1 className="text-3xl font-bold text-slate-900 leading-tight">
            Choisissez votre session
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Sélectionnez un cas clinique pour commencer l'entraînement ECOS.
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-200 mb-6" />

        {/* Filters */}
        <div className="mb-8">
          <ScenarioFilters
            scenarios={scenarios}
            onChange={(filtered) => setFilteredScenarios(filtered)}
          />
        </div>

        {filteredScenarios.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-slate-100">
            <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto mb-4">
              <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
              </svg>
            </div>
            <p className="text-slate-400 text-sm">
              {scenarios.length === 0
                ? "Aucun scénario disponible pour le moment."
                : "Aucun résultat pour ces critères."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredScenarios.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => navigateToScenario(scenario.id)}
                className="group text-left bg-white border border-slate-200 rounded-2xl p-6 hover:border-teal-300 hover:shadow-md hover:shadow-teal-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2"
              >
                {/* Category pill */}
                <div className="flex items-center justify-between mb-5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                    {scenario.category}
                  </span>
                  <span className="text-xs text-slate-300 font-mono">{scenario.domain}</span>
                </div>

                {/* Patient info */}
                <div className="mb-4">
                  <h3 className="text-base font-semibold text-slate-900 group-hover:text-teal-700 transition-colors leading-snug mb-1">
                    {scenario.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    {/* Patient icon */}
                    <svg className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                    <span>
                      {scenario.firstname} {scenario.lastname},{" "}
                      <span className="font-medium text-slate-700">{scenario.age} ans</span>
                    </span>
                  </div>
                </div>

                {/* Separator */}
                <div className="h-px bg-slate-100 mb-4" />

                {/* Description */}
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {scenario.description}
                </p>

                {/* CTA arrow */}
                <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-teal-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  Commencer la session
                  <svg className="w-3.5 h-3.5 translate-x-0 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Footer count */}
        {filteredScenarios.length > 0 && (
          <p className="text-center text-xs text-slate-300 mt-10">
            {filteredScenarios.length} cas clinique{filteredScenarios.length > 1 ? "s" : ""} affiché{filteredScenarios.length > 1 ? "s" : ""}
            {filteredScenarios.length !== scenarios.length && ` sur ${scenarios.length}`}
          </p>
        )}
      </div>
    </div>
  );
}