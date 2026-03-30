/**
 * Scenario Selection Component
 * Lists available ECOS scenarios and initiates a new session
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEcosSession } from "../hooks/useEcosSession";
import { useEcosApi, type Scenario } from "../hooks/useEcosApi";

interface ScenarioSelectProps {
  userId: string;
  onSessionStarted?: (sessionId: string) => void;
}

export function ScenarioSelect({ userId, onSessionStarted }: ScenarioSelectProps) {
  const navigate = useNavigate();
  const { getScenarios, startSession } = useEcosApi();
  const { startSession: setSessionState, setLoading, setError } =
    useEcosSession();

  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoadingLocal] = useState(true);
  const [error, setErrorLocal] = useState<string | null>(null);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(
    null
  );
  const [isStarting, setIsStarting] = useState(false);

  // Fetch scenarios on mount
  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        setLoadingLocal(true);
        const data = await getScenarios();
        setScenarios(data);
        setErrorLocal(null);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        setErrorLocal(errorMsg);
        console.error("Failed to fetch scenarios:", err);
      } finally {
        setLoadingLocal(false);
      }
    };

    if (loading) {
      return (
        <div className="flex items-center justify-center h-screen bg-slate-950">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-200 mb-4">Loading scenarios...</h2>
            <div className="animate-spin text-blue-500 text-2xl">⏳</div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-screen bg-slate-950">
          <div className="text-center max-w-md bg-red-900/80 border border-red-500/30 shadow-blue-500/10 backdrop-blur-md p-8 rounded-3xl">
            <h2 className="text-2xl font-bold text-red-300 mb-4">Error</h2>
            <p className="text-red-200 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-2xl font-semibold bg-blue-500 text-white hover:bg-blue-600 transition-all"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-200 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">ECOS Training Scenarios</h1>
          <p className="text-slate-400 mb-12">
            Select a scenario to begin your clinical practice session
          </p>
          {scenarios.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">No scenarios available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {scenarios.map((scenario) => (
                <div
                  key={scenario.id}
                  className={`p-6 rounded-3xl border-2 cursor-pointer transition-all shadow-blue-500/10 backdrop-blur-md ${
                    selectedScenarioId === scenario.id
                      ? "border-blue-500 bg-blue-900/60"
                      : "border-slate-800 bg-slate-900/60 hover:border-blue-400 hover:bg-slate-900/80"
                  }`}
                  onClick={() => setSelectedScenarioId(scenario.id)}
                >
                  <div className="mb-4">
                    <h3 className="text-xl font-bold mb-2 text-blue-400">{scenario.title}</h3>
                    <div className="space-y-1 text-sm text-slate-300">
                      <p>
                        <span className="font-semibold text-slate-400">Category:</span>{' '}
                        {scenario.category}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-400">Competence:</span>{' '}
                        {scenario.domaineCompetence}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-400">Difficulty:</span>{' '}
                        <span className="font-mono text-amber-400">{scenario.difficulty}/10</span>
                      </p>
                    </div>
                  </div>

                  {selectedScenarioId === scenario.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartSession(scenario);
                      }}
                      disabled={isStarting}
                      className={`w-full py-2 rounded-2xl font-semibold transition-all mt-2 ${
                        isStarting
                          ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                          : "bg-blue-500 text-white hover:bg-blue-600"
                      }`}
                    >
                      {isStarting ? "Starting..." : "Start Session"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
                  <h3 className="text-xl font-bold mb-2">{scenario.title}</h3>
                  <div className="space-y-1 text-sm text-slate-300">
                    <p>
                      <span className="font-semibold">Category:</span>{" "}
                      {scenario.category}
                    </p>
                    <p>
                      <span className="font-semibold">Competence:</span>{" "}
                      {scenario.domaineCompetence}
                    </p>
                    <p>
                      <span className="font-semibold">Difficulty:</span>{" "}
                      {scenario.difficulty}/10
                    </p>
                  </div>
                </div>

                {selectedScenarioId === scenario.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartSession(scenario);
                    }}
                    disabled={isStarting}
                    className={`w-full py-2 rounded font-semibold transition-all ${
                      isStarting
                        ? "bg-gray-500 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {isStarting ? "Starting..." : "Start Session"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
