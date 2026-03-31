"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useScenario, type ScenarioListItem } from "@/hooks/useScenario";
import ScenarioFilters from "@/components/ScenarioFilters";
import { Search, Clock, Play, AlertCircle, ClipboardList } from "lucide-react";

interface ScenarioSelectProps {
  userId?: string;
  onSessionStarted?: (sessionId: string) => void;
}

export default function ScenarioSelectPage({
  userId = "user_default",
  onSessionStarted,
}: ScenarioSelectProps) {
  const router = useRouter();
  const { getScenarios } = useScenario();

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

  // --- Loading ---
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center space-y-4">
          <div className="relative mx-auto w-10 h-10">
            <div className="absolute inset-0 rounded-full border-2 border-teal-100" />
            <div className="absolute inset-0 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
          </div>
          <p className="text-sm font-medium text-slate-400 tracking-wide uppercase">
            Chargement des scénarios
          </p>
        </div>
      </div>
    );
  }

  // --- Error ---
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-5 h-5 text-red-400" />
          </div>
          <h2 className="text-base font-semibold text-slate-800 mb-1">
            Une erreur est survenue
          </h2>
          <p className="text-sm text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  // --- Main ---
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-slate-900 mb-2 text-2xl font-bold">
          Scénarios d'entraînement
        </h1>
        <p className="text-slate-600">
          Entraîne-toi aux ECOS comme en conditions réelles
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-sm">
        <ScenarioFilters
          scenarios={scenarios}
          onChange={(filtered) => setFilteredScenarios(filtered)}
        />
      </div>

      {/* Empty state */}
      {filteredScenarios.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-5 h-5 text-slate-300" />
          </div>
          <p className="text-slate-500">
            {scenarios.length === 0
              ? "Aucun scénario disponible pour le moment."
              : "Aucun scénario ne correspond à vos critères"}
          </p>
        </div>
      ) : (
        <>
          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredScenarios.map((scenario) => (
              <div
                key={scenario.id}
                className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm">
                    {scenario.category}
                  </span>
                  <span className="px-3 py-1 bg-slate-50 text-slate-600 border border-slate-200 rounded-full text-sm">
                    {scenario.domain}
                  </span>
                </div>

                {/* Content */}
                <h3 className="text-slate-900 font-semibold mb-1 leading-snug">
                  {scenario.title}
                </h3>
                <p className="text-slate-500 text-sm mb-1">
                  {scenario.firstname} {scenario.lastname},{" "}
                  <span className="font-medium text-slate-700">
                    {scenario.age} ans
                  </span>
                </p>
                <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                  {scenario.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>8 min</span>
                  </div>
                  <button
                    onClick={() => navigateToScenario(scenario.id)}
                    className="flex items-center gap-2 bg-teal-500 text-white px-4 py-2 rounded-xl hover:bg-teal-600 transition-colors text-sm"
                  >
                    <Play className="w-4 h-4" />
                    Démarrer
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer count */}
          <p className="text-center text-xs text-slate-300 mt-10">
            {filteredScenarios.length} cas clinique
            {filteredScenarios.length > 1 ? "s" : ""} affiché
            {filteredScenarios.length > 1 ? "s" : ""}
            {filteredScenarios.length !== scenarios.length &&
              ` sur ${scenarios.length}`}
          </p>
        </>
      )}
    </div>
  );
}