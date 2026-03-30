"use client";
import { useEcosAudio } from "../hooks/useEcosAudio";
import { ReadyState } from "react-use-websocket";
import { useEcosWebSocket } from "../hooks/useEcosWebSocket";
import { useCallback, useEffect, useState } from "react";
import { useMicrophoneAccess } from "../hooks/useMicrophoneAccess";
import EcosControlsBar from "./EcosControlsBar";

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

  const [shouldConnect, setShouldConnect] = useState(false);
  const backendServerUrl = useBackendServerUrl();
  const [webSocketUrl, setWebSocketUrl] = useState<string | null>(null);
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [errors, setErrors] = useState<ErrorItem[]>([]);
  const [scenarioReady, setScenarioReady] = useState(false);

  // Gestion du mode de scène (patient, exam, intervention)
  const [sceneMode, setSceneMode] = useState<'patient' | 'exam' | 'intervention'>('patient');

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
          instructions: {
            type: "constant",
            text: masterPrompt,
          },
          voice: scenarioInfo.voice,
        }));
        setScenarioReady(true);
      } catch (err) {
        console.error("Erreur lors de la récupération du scénario:", err);
      }
    }

    recoverFullContext();
  }, [id]);
  // Check if the backend server is healthy. If we setHealthStatus to null,
  // a "server is down" screen will be shown.
  useEffect(() => {
    if (!backendServerUrl) return;

    setWebSocketUrl(backendServerUrl.toString() + "/v1/realtime");

    const checkHealth = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const response = await fetch(`${backendServerUrl}/v1/health`, {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        if (!response.ok) {
          setHealthStatus({
            connected: "yes_request_fail",
            ok: false,
          });
        }
        const data = await response.json();
        data["connected"] = "yes_request_ok";

        if (data.ok && !data.voice_cloning_up) {
          console.debug("Voice cloning not available, hiding upload button.");
        }
        setHealthStatus(data);
      } catch {
        setHealthStatus({
          connected: "no",
          ok: false,
        });
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

  const {
    setupAudio,
    shutdownAudio,
    audioProcessor,
    recordingCanvasRef,
  } = useEcosAudio({
    shouldRecord: shouldConnect,
    chatHistory: rawChatHistory,
    onSendAudio: (audio: string) => {
      sendMessage(
        JSON.stringify({
          type: "input_audio_buffer.append",
          audio,
        })
      );
    },
  });

  const onAudioDelta = useCallback((opus: Uint8Array) => {
    const audioProc = audioProcessor.current;
    if (!audioProc) return;
    audioProc.decoder.postMessage(
      {
      command: "decode",
      pages: opus,
      },
      [opus.buffer],
    );
    }, [audioProcessor]);

  // Gestion audio centralisée via le hook dédié

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
    // If we're not connected yet
    if (!shouldConnect) {
      const mediaStream = await askMicrophoneAccess();
      // If we have access to the microphone:
      if (mediaStream) {
        await setupAudio(mediaStream);
        setShouldConnect(true);
        startTimer(); // ← démarrer le timer au moment où la session commence
      }
    } else {
      setShouldConnect(false);
      shutdownAudio();
      resetTimer();
    }
  };

  // Timer et gestion de la fin de session
  const handleTimerExpire = useCallback(() => {
    setShouldConnect(false);
    shutdownAudio();
    // TODO phase évaluation : sauvegarder rawChatHistory ici
    // await saveTranscript(id, rawChatHistory);
  }, [shutdownAudio]);

  const { formatted, status, progressPct, start: startTimer, reset: resetTimer } =
    useEcosTimer(handleTimerExpire);

  // If the websocket connection is closed, shut down the audio processing
  useEffect(() => {
    if (readyState === ReadyState.CLOSING || readyState === ReadyState.CLOSED) {
      setShouldConnect(false);
      shutdownAudio();
    }
  }, [readyState, shutdownAudio]);

  // When we connect, we send the initial config (voice and instructions) to the server.
  // Also clear the chat history.
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
      }),
    );
  }, [unmuteConfig, readyState, sendMessage]);

  useEffect(() => {
    setShouldConnect(false);
    shutdownAudio();
  }, [shutdownAudio, unmuteConfig.voice, unmuteConfig.instructions]);

  if (!healthStatus || !backendServerUrl) {
    return (
      <div className="flex flex-col gap-4 items-center">
        <h1 className="text-xl mb-4">Loading...</h1>
      </div>
    );
  }

  if (healthStatus && !healthStatus.ok) {
    return <CouldNotConnect healthStatus={healthStatus} />;
  }


  return (
    <div className="flex w-full ">
      {/* SCENE (60%) */}
      <div className="w-3/5 relative flex flex-col items-center justify-center p-8 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        {/* Portrait ou Exam/Intervention selon sceneMode */}
        {sceneMode === 'patient' && (
          <div className="relative group w-full h-screen flex items-end">
            {/* Image patient */}
            <img src="/public/models/patient.jpg" alt="Patient" className="w-full h-full object-cover rounded-[2rem] shadow-[0_0_50px_-12px_rgba(0,0,0,0.8)] border border-slate-800/50" />
            {/* Ring Pulse (indicateur vocal) */}
            <div className="absolute inset-0 rounded-[2rem] ring-4 ring-blue-500/50 opacity-0 group-data-[speaking=true]:opacity-100 pointer-events-none" />
            {/* Overlay Patient */}
            <div className="absolute bottom-6 left-6 right-6 p-4 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-white/10 flex flex-col gap-2 shadow-blue-500/10">
              <span className="font-bold text-lg">{scenarioDetails?.firstname} {scenarioDetails?.lastname} {scenarioDetails?.age} ans</span>
              <span className="font-bold text-l">{scenarioDetails?.category} - {scenarioDetails?.domain}</span>

              <span className="text-blue-400 text-xs font-mono uppercase">{scenarioDetails?.description}</span>
            </div>
          </div>
        )}
        {sceneMode === 'exam' && (
          <div className="w-full w-full h-screen flex items-center justify-center rounded-[2rem] bg-slate-900/80 border border-slate-800/50 shadow-blue-500/10">
            <img src="/public/models/ecg.png" alt="ECG" className="w-full h-full object-contain rounded-[2rem]" />
          </div>
        )}
        {sceneMode === 'intervention' && (
          <div className="w-full w-full h-screen flex items-center justify-center rounded-[2rem] bg-slate-900/80 border border-slate-800/50 shadow-blue-500/10">
            <img src="/public/models/hospital-room.jpg" alt="Chambre d'hôpital" className="w-full h-full object-cover rounded-[2rem]" />
          </div>
        )}
        {/* Bar d'action pour changer de mode (dev only) */}
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <button onClick={() => setSceneMode('patient')} className={`px-3 py-1 rounded-xl text-xs font-mono ${sceneMode==='patient'?'bg-blue-500 text-white':'bg-slate-800 text-blue-300'}`}>Patient</button>
          <button onClick={() => setSceneMode('exam')} className={`px-3 py-1 rounded-xl text-xs font-mono ${sceneMode==='exam'?'bg-blue-500 text-white':'bg-slate-800 text-blue-300'}`}>Exam</button>
          <button onClick={() => setSceneMode('intervention')} className={`px-3 py-1 rounded-xl text-xs font-mono ${sceneMode==='intervention'?'bg-blue-500 text-white':'bg-slate-800 text-blue-300'}`}>Intervention</button>
        </div>
      </div>
      {/* DASHBOARD (40%) */}
      <div className="w-2/5 flex flex-col bg-slate-900 border-l border-slate-800/50 shadow-[-20px_0_50px_rgba(0,0,0,0.3)] h-full">
        {/* Transcription (haut) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
          <ChatPanel chatHistory={chatHistory} isConnected={shouldConnect} />
        </div>
        {/* Zone d'action (bas) */}
        <div className="border-t border-slate-800 flex-1 flex flex-col bg-slate-900/80 backdrop-blur-md rounded-b-3xl">
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
      {/* Error messages et canvas caché */}
      <ErrorMessages errors={errors} setErrors={setErrors} />
      <canvas ref={recordingCanvasRef} className="hidden" />
    </div>
  );
};

export default EcosAssistant;
