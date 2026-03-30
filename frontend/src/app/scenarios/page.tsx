"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// Assure-toi que les alias @/ pointent bien vers ton dossier src
import { useEcosSession } from "@/hooks/useEcosSession";
import { useEcosApi, type Scenario } from "@/hooks/useEcosApi";

interface ScenarioSelectProps {
  userId?: string; // Optionnel si récupéré via un autre contexte
  onSessionStarted?: (sessionId: string) => void;
}

export default function ScenarioSelectPage({ userId = "user_default", onSessionStarted }: ScenarioSelectProps) {
  const router = useRouter();
  const { getScenarios, startSession } = useEcosApi();
  const { startSession: setSessionState, setLoading, setError } = useEcosSession();

  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoadingLocal] = useState(true);
  const [error, setErrorLocal] = useState<string | null>(null);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

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

  const handleStartSession = async (scenario: Scenario) => {
    if (!selectedScenarioId) return;

    try {
      setIsStarting(true);
      setLoading(true);
      setError(null);

      const response = await startSession(scenario.id, userId);

      // Mise à jour du contexte global ECOS
      setSessionState(
        response.sessionId,
        userId,
        scenario.id,
        scenario.title,
        response.systemPrompt,
        response.unmuteWsUrl,
        response.checklist
      );

      if (onSessionStarted) onSessionStarted(response.sessionId);

      // Navigation Next.js vers la page de conversation
      router.push(`/conversation/${response.sessionId}`);    
      router.refresh(); // Force un rafraîchissement pour s'assurer que les données sont à jour
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Erreur de création de session";
      setError(errorMsg);
      setErrorLocal(errorMsg);
    } finally {
      setIsStarting(false);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-white">Chargement des scénarios...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="text-center max-w-md p-8 bg-red-900/20 border border-red-500/50 rounded-3xl">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Erreur</h2>
          <p className="text-red-200/70 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 text-white p-8">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scenarios.map((scenario) => (
              <div
                key={scenario.id}
                onClick={() => setSelectedScenarioId(scenario.id)}
                className={`group p-6 rounded-3xl border-2 transition-all duration-300 cursor-pointer flex flex-col ${
                  selectedScenarioId === scenario.id
                    ? "border-blue-500 bg-blue-600/10 shadow-[0_0_30px_rgba(59,130,246,0.2)]"
                    : "border-slate-800 bg-slate-900/50 hover:border-slate-600"
                }`}
              >
                <div className="flex-1">
                  <h3 className={`text-xl font-bold mb-4 transition-colors ${selectedScenarioId === scenario.id ? "text-blue-400" : "text-white group-hover:text-blue-300"}`}>
                    {scenario.title}
                  </h3>
                  
                  <div className="space-y-3 text-sm text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      <span className="font-semibold text-slate-300">Catégorie:</span> {scenario.category}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="font-semibold text-slate-300">Compétence:</span> {scenario.domaineCompetence}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                      <span className="font-semibold text-slate-300">Difficulté:</span> {scenario.difficulty}/10
                    </div>
                  </div>
                </div>

                <div className={`mt-6 overflow-hidden transition-all duration-300 ${selectedScenarioId === scenario.id ? "max-h-20 opacity-100" : "max-h-0 opacity-0"}`}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartSession(scenario);
                    }}
                    disabled={isStarting}
                    className={`w-full py-3 rounded-2xl font-bold transition-all active:scale-95 ${
                      isStarting
                        ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20"
                    }`}
                  >
                    {isStarting ? "Initialisation..." : "Démarrer la session"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}