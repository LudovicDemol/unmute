"use client";
import { useEcosAudio } from "../hooks/useEcosAudio";
import { ReadyState } from "react-use-websocket";
import { useEcosWebSocket } from "../hooks/useEcosWebSocket";
import { useCallback, useEffect, useRef, useState } from "react";
import { useMicrophoneAccess } from "../hooks/useMicrophoneAccess";
import EcosControlsBar from "./EcosControlsBar";
import SessionStartOverlay from "./SessionStartOverlay";
import CouldNotConnect, { HealthStatus } from "./CouldNotConnect";
import { ChatMessage, compressChatHistory } from "../utils/chatHistory";
import useWakeLock from "../hooks/useWakeLock";
import ErrorMessages, { ErrorItem, makeErrorItem } from "./ErrorMessages";
import { getRecordingConsent } from "../utils/recordingConsent";
import { getScenarioDifficultyLabel, buildMasterPrompt } from "../utils/scenario";
import { ScenarioDetail, useScenarioDetail } from "@/hooks/useScenario";
import { useEcosTimer } from "@/hooks/useEcosTimer";
import ChatPanel from "./ChatPanel";
import { DEFAULT_UNMUTE_CONFIG, UnmuteConfig } from "../types/type";
import { useBackendServerUrl } from "@/hooks/useBackendServerUrl";
import { useAttempt } from "@/hooks/useAttempt";
import { useSessionStore } from "@/stores/sessionStore";
import EvaluationLoadingPopup from "./EvaluationLoadingPopup";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { usePollResults } from "@/hooks/usePollResults";
import { getDomainLabel } from "@/utils/labelUtil";
import DisconnectConfirmPopup from "./DisconnectConfirmPopup"
import { fetchWithAuth } from "@/lib/api";

const MIN_SESSION_DURATION_SECONDS = 1

interface EcosAssistantProps {
  id: string;
}

const EcosAssistant = ({ id }: EcosAssistantProps) => {
  const [unmuteConfig, setUnmuteConfig] = useState<UnmuteConfig>(DEFAULT_UNMUTE_CONFIG);
  const [rawChatHistory, setRawChatHistory] = useState<ChatMessage[]>([]);
  const chatHistory = compressChatHistory(rawChatHistory);
  const {
    data: scenarioDetails,
    isLoading: scenarioLoading,
    isError: scenarioError,
    error: scenarioErrorObject,
  } = useScenarioDetail(id);

  const { microphoneAccess, askMicrophoneAccess } = useMicrophoneAccess();
  const [showOverlay, setShowOverlay] = useState(false);
  const {
    shouldConnect,
    setShouldConnect,
    evaluationStarted,
    setEvaluationStarted,
    startEvaluation,
    popupDismissed,
    dismissPopup,
    reset: resetSessionState,
  } = useSessionStore();
  const backendServerUrl = useBackendServerUrl();
  const [webSocketUrl, setWebSocketUrl] = useState<string | null>(null);
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [errors, setErrors] = useState<ErrorItem[]>([]);
  const [scenarioReady, setScenarioReady] = useState(false);
  const isSessionActive = useRef(false)
  const [showDisconnectPopup, setShowDisconnectPopup] = useState(false)

  const router = useRouter()
  const authUserId = useAuthStore((s) => s.user?.id)

  const {
    attemptId,
    startAttempt,
    addEntry,
    completeAttempt,
  } = useAttempt(authUserId)
  const attemptIdRef = useRef<string | null>(null)

  useEffect(() => {
  attemptIdRef.current = attemptId
  }, [attemptId])

  const { results: evaluationResult, timedOut } = usePollResults(attemptId, evaluationStarted)

  const triggerEvaluation = useCallback(async (currentAttemptId: string) => {
    await fetchWithAuth(`/attempts/${currentAttemptId}/trigger-evaluation`, {
      method: 'POST',
    })
    startEvaluation();
  }, [startEvaluation])

  const allFakeStepsDone = useRef(false) 

  useEffect(() => {
    if (!evaluationResult) return

    if (allFakeStepsDone.current) {
      const timer = setTimeout(() => {
        dismissPopup()
        router.push(`/history/results/${evaluationResult.id}`)
      }, 1200)
      return () => clearTimeout(timer)
    }
  }, [evaluationResult, dismissPopup, router])

  useEffect(() => {
  if (timedOut) {
    setErrors(prev => [...prev, makeErrorItem("L'évaluation a pris trop de temps. Veuillez réessayer.")])
  }
  }, [timedOut])

  const handleTimerExpire = useCallback(async () => {
    isSessionActive.current = false
    setShouldConnect(false)
    shutdownAudio()
    const currentAttemptId = attemptIdRef.current
      if (currentAttemptId) {
        await completeAttempt()
        await triggerEvaluation(currentAttemptId)
      }
    }, [completeAttempt, triggerEvaluation])

    useEffect(() => {
      const handleUnload = () => {
        if (!attemptIdRef.current) return
        navigator.sendBeacon(
          `${process.env.NEXT_PUBLIC_URL_API_ECOS}/attempts/${attemptIdRef.current}/abandon`
        )
      }
      window.addEventListener('beforeunload', handleUnload)
      return () => window.removeEventListener('beforeunload', handleUnload)
    }, [backendServerUrl])


  const { formatted, status, progressPct, start: startTimer, reset: resetTimer, getElapsedSeconds } =
    useEcosTimer(handleTimerExpire);

  // ── Session end (déconnexion manuelle) ────────────────────────────────────
  const handleSessionEnd = useCallback(async () => {
    isSessionActive.current = false
    setShowDisconnectPopup(false)
    setShouldConnect(false)
    shutdownAudio()
    resetTimer()  
    if (!attemptId) {
    router.push("/scenarios")
    return
  }

    await completeAttempt()

    if (getElapsedSeconds() >= MIN_SESSION_DURATION_SECONDS) {
      await triggerEvaluation(attemptId)
    } else {
      router.push("/scenarios")
    }
  }, [attemptId, completeAttempt, triggerEvaluation, resetTimer, getElapsedSeconds, setShouldConnect])

  useWakeLock(shouldConnect);

  // ── Scenario loading (react-query) ───────────────────────────────────────
  useEffect(() => {
    if (scenarioLoading || !scenarioDetails) {
      setScenarioReady(false);
      return;
    }

    const masterPrompt = buildMasterPrompt(scenarioDetails, getScenarioDifficultyLabel);
    setUnmuteConfig((prev) => ({
      ...prev,
      instructions: { type: "constant", text: masterPrompt },
      voice: scenarioDetails.voice,
    }));
    setScenarioReady(true);

    if (scenarioError) {
      console.error("Erreur lors de la récupération du scénario:", scenarioErrorObject);
    }
  }, [scenarioDetails, scenarioLoading, scenarioError, scenarioErrorObject]);

  // ── Health check ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!backendServerUrl) return;
    setWebSocketUrl(backendServerUrl.toString() + "/v1/realtime");

    const checkHealth = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const response = await fetch(`${backendServerUrl}/v1/health`, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!response.ok) {
          setHealthStatus({ connected: "yes_request_fail", ok: false });
          return;
        }
        const data = await response.json();
        data["connected"] = "yes_request_ok";
        setHealthStatus(data);
      } catch {
        setHealthStatus({ connected: "no", ok: false });
      }
    };
    checkHealth();
  }, [backendServerUrl]);

  // ── Callbacks audio / WS ──────────────────────────────────────────────────
  const onError = useCallback((msg: string, isWarning?: boolean) => {
    if (isWarning) console.warn(`Warning: ${msg}`);
    else {
      console.error(`Error: ${msg}`);
      setErrors((prev) => [...prev, makeErrorItem(msg)]);
    }
  }, []);

  const onUserTranscription = useCallback((text: string) => {
    setRawChatHistory((prev) => [...prev, { role: "user", content: text }]);
    if (isSessionActive.current) addEntry("student", text)
  }, [addEntry]);

  const onAssistantText = useCallback((text: string) => {
    setRawChatHistory((prev) => [...prev, { role: "assistant", content: " " + text }]);
    if (isSessionActive.current) addEntry("patient", text) 
  }, [addEntry]);

  const { setupAudio, shutdownAudio, audioProcessor, recordingCanvasRef } = useEcosAudio({
    shouldRecord: shouldConnect,
    chatHistory: rawChatHistory,
    onSendAudio: (audio: string) => {
      sendMessage(JSON.stringify({ type: "input_audio_buffer.append", audio }));
    },
  });

  const onAudioDelta = useCallback(
    (opus: Uint8Array) => {
      const audioProc = audioProcessor.current;
      if (!audioProc) return;
      audioProc.decoder.postMessage({ command: "decode", pages: opus }, [opus.buffer]);
    },
    [audioProcessor]
  );

  const { sendMessage, readyState } = useEcosWebSocket({
    url: webSocketUrl,
    shouldConnect,
    onAudioDelta,
    onError,
    onUserTranscription,
    onAssistantText,
  });

  // ── Connect button ────────────────────────────────────────────────────────
  const onConnectButtonPress = async () => {
    if (!scenarioReady) return;
    if (!shouldConnect) {
      const mediaStream = await askMicrophoneAccess();
      if (mediaStream) {
        await setupAudio(mediaStream);
        isSessionActive.current = true
        await startAttempt(id);
        setShouldConnect(true);
        setShowOverlay(true);
        dismissPopup();
        setEvaluationStarted(false);
      }
    } else {
      setShowDisconnectPopup(true)
    }
  };

  // ── WS state effects ──────────────────────────────────────────────────────
  useEffect(() => {
    if (readyState === ReadyState.CLOSING || readyState === ReadyState.CLOSED) {
      setShouldConnect(false);
      shutdownAudio();
    }
  }, [readyState, shutdownAudio]);

  useEffect(() => {
    if (readyState !== ReadyState.OPEN) return;
    const recordingConsent = getRecordingConsent();
    setRawChatHistory([]);
    sendMessage(JSON.stringify({
      type: "session.update",
      session: {
        instructions: unmuteConfig.instructions,
        voice: unmuteConfig.voice,
        allow_recording: recordingConsent,
      },
    }));
  }, [unmuteConfig, readyState, sendMessage]);

  useEffect(() => {
    setShouldConnect(false);
    shutdownAudio();
  }, [shutdownAudio, unmuteConfig.voice, unmuteConfig.instructions]);

  // ── Guards ────────────────────────────────────────────────────────────────
  if (!healthStatus || !backendServerUrl) {
    return (
      <div className="h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative mx-auto w-10 h-10">
            <div className="absolute inset-0 rounded-full border-2 border-teal-900" />
            <div className="absolute inset-0 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
          </div>
          <p className="text-sm font-medium text-slate-400 tracking-wide uppercase">
            Connexion en cours…
          </p>
        </div>
      </div>
    );
  }

  if (!healthStatus.ok) {
    return <CouldNotConnect healthStatus={healthStatus} />;
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* HEADER */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-sm">M</span>
          </div>
          <div>
            <h2 className="text-white font-semibold">{scenarioDetails ? getDomainLabel(scenarioDetails.domain) : "Session en cours"}</h2>
            <p className="text-slate-400 text-sm">
              {scenarioDetails
                ? `${scenarioDetails.firstname} ${scenarioDetails.lastname} · ${scenarioDetails.category}`
                : "Chargement du scénario…"}
            </p>
          </div>
        </div>
        <div className={`px-4 py-2 rounded-xl font-mono text-sm ${
          status === "warning" ? "bg-yellow-500/20 text-yellow-400" : "bg-teal-500/20 text-teal-400"
        }`}>
          {formatted}
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/3 bg-slate-800 border-r border-slate-700 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {scenarioDetails ? (
              <>
                <div>
                  <h3 className="text-teal-400 font-semibold mb-4">Informations patient</h3>
                  <div className="space-y-3 text-slate-300">
                    <div>
                      <p className="text-slate-500 text-xs mb-1">Identité</p>
                      <p className="text-sm">{scenarioDetails.firstname} {scenarioDetails.lastname}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs mb-1">Âge</p>
                      <p className="text-sm">{scenarioDetails.age} ans</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs mb-1">Motif de consultation</p>
                      <p className="text-sm">{scenarioDetails.title}</p>
                    </div>
                  </div>
                </div>
                <div className="border-t border-slate-700 pt-6">
                  <h4 className="text-teal-400 font-semibold mb-3">Contexte</h4>
                  <p className="text-slate-300 text-sm leading-relaxed">{scenarioDetails.description}</p>
                </div>
                <div className="bg-slate-700/50 rounded-xl p-4">
                  <p className="text-yellow-400 text-sm">
                    <strong>Spécialité :</strong> {scenarioDetails.category}
                  </p>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-slate-500 text-sm">Chargement…</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 bg-slate-900 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            <ChatPanel chatHistory={chatHistory} isConnected={shouldConnect} />
          </div>
          <div className="flex items-end justify-center gap-1.5 h-24 px-6 pb-4 flex-shrink-0">
            {[...Array(24)].map((_, i) => (
              <div
                key={i}
                className={`w-1.5 rounded-full transition-all ${shouldConnect ? "bg-teal-500" : "bg-slate-700"}`}
                style={{
                  height: shouldConnect ? `${Math.random() * 70 + 20}%` : "20%",
                  animation: shouldConnect ? `ecosWave ${(Math.random() * 0.5 + 0.5).toFixed(2)}s ease-in-out infinite` : "none",
                }}
              />
            ))}
          </div>
          <div className="flex justify-center pb-4 flex-shrink-0">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm ${
              shouldConnect ? "bg-teal-500/20 text-teal-400" : "bg-slate-700 text-slate-400"
            }`}>
              <div className={`w-2 h-2 rounded-full ${shouldConnect ? "bg-teal-400 animate-pulse" : "bg-slate-500"}`} />
              {shouldConnect ? "Enregistrement en cours" : "En attente"}
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM CONTROLS */}
      <div className="bg-slate-800 border-t border-slate-700 px-6 py-4 flex-shrink-0">
        <EcosControlsBar
          formatted={formatted}
          status={status}
          progressPct={progressPct}
          onConnectButtonPress={onConnectButtonPress}
          shouldConnect={shouldConnect}
          microphoneAccess={microphoneAccess}
        />
      </div>

      <ErrorMessages errors={errors} setErrors={setErrors} />
      <canvas ref={recordingCanvasRef} className="hidden" />
      <SessionStartOverlay visible={showOverlay} onReady={() => {setShowOverlay(false); startTimer();}} />
      <EvaluationLoadingPopup 
        visible={evaluationStarted && !popupDismissed && !timedOut} 
        done={!!evaluationResult}
        onComplete={() => {
          allFakeStepsDone.current = true
          if (evaluationResult) {
            setTimeout(() => {
              dismissPopup()
              router.push(`/history/results/${evaluationResult.id}`)
            }, 1200)
          }
        }}
      />
      <DisconnectConfirmPopup
        visible={showDisconnectPopup}
        willBeEvaluated={getElapsedSeconds() >= MIN_SESSION_DURATION_SECONDS}
        onConfirm={handleSessionEnd}
        onCancel={() => setShowDisconnectPopup(false)}
      />
      <style>{`
        @keyframes ecosWave {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
};

export default EcosAssistant;