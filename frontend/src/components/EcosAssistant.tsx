"use client";
import { useEcosAudio } from "../hooks/useEcosAudio";
import { ReadyState } from "react-use-websocket";
import { useEcosWebSocket } from "../hooks/useEcosWebSocket";
import { useCallback, useEffect, useState } from "react";
import { useMicrophoneAccess } from "../hooks/useMicrophoneAccess";
import EcosControlsBar from "./EcosControlsBar";
import SessionStartOverlay from "./SessionStartOverlay";
import CouldNotConnect, { HealthStatus } from "./CouldNotConnect";
import { ChatMessage, compressChatHistory } from "../utils/chatHistory";
import useWakeLock from "../hooks/useWakeLock";
import ErrorMessages, { ErrorItem, makeErrorItem } from "./ErrorMessages";
import { getRecordingConsent } from "../utils/recordingConsent";
import { getScenarioDifficultyLabel, buildMasterPrompt } from "../utils/scenario";
import { ScenarioDetail, useEcosApi } from "@/hooks/useEcosApi";
import { useEcosTimer } from "@/hooks/useEcosTimer";
import ChatPanel from "./ChatPanel";
import { useBackendServerUrl } from "@/hooks/useBackendServerUrl";
import { DEFAULT_UNMUTE_CONFIG, UnmuteConfig } from "../types/type";

interface EcosAssistantProps {
  id: string;
}

const EcosAssistant = ({ id }: EcosAssistantProps) => {
  const [unmuteConfig, setUnmuteConfig] = useState<UnmuteConfig>(DEFAULT_UNMUTE_CONFIG);
  const [rawChatHistory, setRawChatHistory] = useState<ChatMessage[]>([]);
  const chatHistory = compressChatHistory(rawChatHistory);
  const { getScenarioDetail } = useEcosApi();
  const [scenarioDetails, setScenarioDetails] = useState<ScenarioDetail>();
  const { microphoneAccess, askMicrophoneAccess } = useMicrophoneAccess();
  const [showOverlay, setShowOverlay] = useState(false);
  const [shouldConnect, setShouldConnect] = useState(false);
  const backendServerUrl = useBackendServerUrl();
  const [webSocketUrl, setWebSocketUrl] = useState<string | null>(null);
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [errors, setErrors] = useState<ErrorItem[]>([]);
  const [scenarioReady, setScenarioReady] = useState(false);

  const [sceneMode, setSceneMode] = useState<"patient" | "exam" | "intervention">("patient");

  useWakeLock(shouldConnect);

  useEffect(() => {
    async function recoverFullContext() {
      if (!id) return;
      try {
        const scenarioInfo = await getScenarioDetail(id);
        setScenarioDetails(scenarioInfo);
        const masterPrompt = buildMasterPrompt(scenarioInfo, getScenarioDifficultyLabel);
        setUnmuteConfig((prev) => ({
          ...prev,
          instructions: { type: "constant", text: masterPrompt },
          voice: scenarioInfo.voice,
        }));
        setScenarioReady(true);
      } catch (err) {
        console.error("Erreur lors de la récupération du scénario:", err);
      }
    }
    recoverFullContext();
  }, [id]);

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

  const onError = useCallback((msg: string, isWarning?: boolean) => {
    if (isWarning) {
      console.warn(`Warning from server: ${msg}`);
    } else {
      console.error(`Error from server: ${msg}`);
      setErrors((prev) => [...prev, makeErrorItem(msg)]);
    }
  }, []);

  const onUserTranscription = useCallback((text: string) => {
    setRawChatHistory((prev) => [...prev, { role: "user", content: text }]);
  }, []);

  const onAssistantText = useCallback((text: string) => {
    setRawChatHistory((prev) => [...prev, { role: "assistant", content: " " + text }]);
  }, []);

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

  const onConnectButtonPress = async () => {
    if (!scenarioReady) return;
    if (!shouldConnect) {
      const mediaStream = await askMicrophoneAccess();
      if (mediaStream) {
        await setupAudio(mediaStream);
        setShouldConnect(true);
        startTimer();
        setShowOverlay(true);
      }
    } else {
      setShouldConnect(false);
      shutdownAudio();
      resetTimer();
    }
  };

  const handleTimerExpire = useCallback(() => {
    setShouldConnect(false);
    shutdownAudio();
  }, [shutdownAudio]);

  const { formatted, status, progressPct, start: startTimer, reset: resetTimer } =
    useEcosTimer(handleTimerExpire);

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
    sendMessage(
      JSON.stringify({
        type: "session.update",
        session: {
          instructions: unmuteConfig.instructions,
          voice: unmuteConfig.voice,
          allow_recording: recordingConsent,
        },
      })
    );
  }, [unmuteConfig, readyState, sendMessage]);

  useEffect(() => {
    setShouldConnect(false);
    shutdownAudio();
  }, [shutdownAudio, unmuteConfig.voice, unmuteConfig.instructions]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (!healthStatus || !backendServerUrl) {
    return (
      <div
        className=" min-h-screen flex items-center justify-center"
        style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}
      >
        <div className="text-center space-y-4">
          <div className="relative mx-auto w-10 h-10">
            <div className="absolute inset-0 rounded-full border-2 border-teal-100" />
            <div className="absolute inset-0 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
          </div>
          <p className="text-sm font-medium text-slate-400 tracking-wide uppercase">
            Connexion en cours…
          </p>
        </div>
      </div>
    );
  }

  if (healthStatus && !healthStatus.ok) {
    return <CouldNotConnect healthStatus={healthStatus} />;
  }

  // ── Scene mode labels ──────────────────────────────────────────────────────

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="flex w-full h-screen bg-slate-50 overflow-hidden"
      style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}
    >
      {/* ── LEFT PANEL: scene (60%) ─────────────────────────────────────── */}
      <div className="w-3/5 relative flex flex-col overflow-hidden bg-slate-100 border-r border-slate-200">


        {/* Scene image */}
        <div className="flex-1 relative overflow-hidden">
          {sceneMode === "patient" && (
            <img
              src="/patient.png"
              alt="Patient"
              className="w-full h-full object-cover"
            />
          )}
       

          {/* Speaking ring indicator */}
          {shouldConnect && (
            <div className="absolute inset-0 ring-inset ring-4 ring-teal-400/40 animate-pulse pointer-events-none" />
          )}
        </div>

        {/* Patient info card — pinned to the bottom */}
        {scenarioDetails && (
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-2xl px-5 py-4 shadow-sm flex items-center gap-4">
              {/* Avatar placeholder */}
              <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {scenarioDetails.firstname} {scenarioDetails.lastname},{" "}
                  <span className="font-normal text-slate-500">{scenarioDetails.age} ans</span>
                </p>
                <p className="text-xs font-semibold text-slate-900 truncate mt-0.5">
                  {scenarioDetails.title}
                </p>
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  {scenarioDetails.category}
                  {scenarioDetails.domain ? ` · ${scenarioDetails.domain}` : ""}
                </p>
              </div>
              {scenarioDetails.description && (
                <span className="text-xs text-teal-600 bg-teal-50 border border-teal-100 px-2.5 py-1 font-medium min-w-0">
                  {scenarioDetails.description}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="w-2/5 flex flex-col bg-white h-full">



        {/* Transcription / chat */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          <ChatPanel chatHistory={chatHistory} isConnected={shouldConnect} />
        </div>

        {/* Controls bar */}
        <div className="flex-shrink-0 border-t border-slate-100 bg-slate-50/80 backdrop-blur-sm">
          <EcosControlsBar
            formatted={formatted}
            status={status}
            progressPct={progressPct}
            onConnectButtonPress={onConnectButtonPress}
            shouldConnect={shouldConnect}
            microphoneAccess={microphoneAccess}
          />
        </div>
      </div>

      <ErrorMessages errors={errors} setErrors={setErrors} />
      <canvas ref={recordingCanvasRef} className="hidden" />
      <SessionStartOverlay
        visible={showOverlay}
        onReady={() => setShowOverlay(false)}
      />
    </div>
  );
};

export default EcosAssistant;