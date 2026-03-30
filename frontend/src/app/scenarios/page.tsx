"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// Assure-toi que les alias @/ pointent bien vers ton dossier src
import { useEcosSession } from "@/hooks/useEcosSession";
import { useEcosApi, type ScenarioListItem } from "@/hooks/useEcosApi";

interface ScenarioSelectProps {
  userId?: string; // Optionnel si récupéré via un autre contexte
  onSessionStarted?: (sessionId: string) => void;
}

export default function ScenarioSelectPage({ userId = "user_default", onSessionStarted }: ScenarioSelectProps) {
  const router = useRouter();
  const { getScenarios } = useEcosApi();

  const [scenarios, setScenarios] = useState<ScenarioListItem[]>([]);
  const [loading, setLoadingLocal] = useState(true);
  const [error, setErrorLocal] = useState<string | null>(null);

  // Récupération des scénarios au montage
  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        setLoadingLocal(true);
        const data = await getScenarios();
        setScenarios(data);
        setErrorLocal(null);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Erreur lors de la récupération";
        setErrorLocal(errorMsg);
      } finally {
        setLoadingLocal(false);
      }
    };

    fetchScenarios();
  }, [getScenarios]);

  const navigateToScenario = (scenarioId: string) => {
      router.push(`/conversation/${scenarioId}`);    
      router.refresh(); // Force un rafraîchissement pour s'assurer que les données sont à jour
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-slate-200">Chargement des scénarios...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Erreur</h2>
          <p className="text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-200 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            Sessions ECOS
          </h1>
          <p className="text-slate-400 mt-2">
            Sélectionnez un cas clinique pour commencer l'entraînement.
          </p>
        </header>

        {scenarios.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800">
            <p className="text-slate-500 italic">Aucun scénario disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {scenarios.map((scenario) => (
              <a onClick={() => navigateToScenario(scenario.id) }>

              <div
                key={scenario.id}
                className={`group p-6 rounded-3xl border-2 transition-all duration-300 cursor-pointer flex flex-col shadow-blue-500/10 backdrop-blur-md ${"border-slate-800 bg-slate-900/60 hover:border-blue-400 hover:bg-slate-900/80"
                }`}
              >
                <div className="flex-1">
                  <h3 className={`text-xl font-bold mb-4 transition-colors text-white group-hover:text-blue-300`}>
                    {scenario.title}
                  </h3>
                  <h4 className={`text-l font-bold mb-4 transition-colors text-white group-hover:text-blue-300`}>
                    {scenario.firstname} {scenario.lastname}, {scenario.age} ans
                  </h4>
                  <div className="space-y-3 text-sm text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      <span className="font-semibold text-slate-300">Catégorie:</span> {scenario.category}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="font-semibold text-slate-300">Domaine:</span> {scenario.domain}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-amber-400">{scenario.description}</span>
                    </div>
                  </div>
                </div>
              </div>
            </a>

            ))}
          </div>
        )}
      </div>
    </div>
  );
}