/**
 * Session Results Component
 * Displayed after session ends
 * Shows score, checklist progress, and transcription
 */

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEcosApi, type SessionDetails } from "../hooks/useEcosApi";
import { Checklist } from "../components/ui/Checklist";

export function SessionResults() {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const { getSessionDetails } = useEcosApi();

  const [session, setSession] = useState<SessionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError("No session ID provided");
      setLoading(false);
      return;
    }

    const fetchSession = async () => {
      try {
        setLoading(true);
        const data = await getSessionDetails(sessionId);
        setSession(data);
        setError(null);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        setError(errorMsg);
        console.error("Failed to fetch session:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId, getSessionDetails]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Loading results...</h2>
          <div className="animate-spin text-4xl">⏳</div>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-center max-w-md text-white">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Error</h2>
          <p className="text-slate-300 mb-6">{error || "Session not found"}</p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold"
          >
            Back to Scenarios
          </button>
        </div>
      </div>
    );
  }

  const scorePercentage = Math.min(100, Math.max(0, session.finalScore));
  const scoreColor =
    scorePercentage >= 75
      ? "text-green-400"
      : scorePercentage >= 50
      ? "text-yellow-400"
      : "text-red-400";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/")}
            className="text-blue-400 hover:text-blue-300 mb-4 flex items-center gap-2"
          >
            ← Back to Scenarios
          </button>
          <h1 className="text-4xl font-bold">{session.title}</h1>
          <p className="text-slate-400 mt-2">Session completed</p>
        </div>

        {/* Score Card */}
        <div className="bg-slate-800 rounded-lg p-8 mb-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Performance Score</h2>
          <div className={`text-6xl font-bold ${scoreColor} mb-4`}>
            {scorePercentage.toFixed(1)}%
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-slate-700 rounded p-4">
              <p className="text-slate-400 text-sm">Duration</p>
              <p className="text-xl font-semibold">
                {Math.floor(session.duration / 60)}m {session.duration % 60}s
              </p>
            </div>
            <div className="bg-slate-700 rounded p-4">
              <p className="text-slate-400 text-sm">Status</p>
              <p className="text-xl font-semibold capitalize">
                {session.status}
              </p>
            </div>
            <div className="bg-slate-700 rounded p-4">
              <p className="text-slate-400 text-sm">Difficulty</p>
              <p className="text-xl font-semibold">Medium</p>
            </div>
          </div>
        </div>

        {/* Checklist Progress */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Checklist Performance</h2>
          <Checklist items={session.checklistProgress} />
        </div>

        {/* Transcription */}
        {session.sttTranscript && session.sttTranscript.length > 0 && (
          <div className="bg-slate-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Conversation Transcript</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {session.sttTranscript.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className={`p-3 rounded ${
                    item.role === "user"
                      ? "bg-blue-900 text-blue-100"
                      : "bg-green-900 text-green-100"
                  }`}
                >
                  <strong className="text-xs uppercase block mb-1">
                    {item.role}:
                  </strong>
                  {item.content}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feedback */}
        {session.evalFeedback && (
          <div className="bg-slate-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Feedback</h2>
            <div className="text-slate-300 whitespace-pre-wrap">
              {typeof session.evalFeedback === "string"
                ? session.evalFeedback
                : JSON.stringify(session.evalFeedback, null, 2)}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded font-semibold"
          >
            Try Another Scenario
          </button>
          <button
            onClick={() => navigate(`/history/${session.id}`)}
            className="px-6 py-3 bg-slate-600 hover:bg-slate-700 rounded font-semibold"
          >
            View Full History
          </button>
        </div>
      </div>
    </div>
  );
}
