"use client";
import { useEcosAudio } from "../hooks/useEcosAudio";
import { ReadyState } from "react-use-websocket";
import { useEcosWebSocket } from "../hooks/useEcosWebSocket";
import { useCallback, useEffect, useState } from "react";
import { useMicrophoneAccess } from "../hooks/useMicrophoneAccess";
import EcosAudioVisualizers from "./EcosAudioVisualizers";
import EcosControlsBar from "./EcosControlsBar";

import CouldNotConnect, { HealthStatus } from "./CouldNotConnect";
import { ChatMessage, compressChatHistory } from "../utils/chatHistory";
import useWakeLock from "../hooks/useWakeLock";
import ErrorMessages, { ErrorItem, makeErrorItem } from "./ErrorMessages";
import { getRecordingConsent } from "../utils/recordingConsent";
import { getScenarioDifficultyLabel, buildMasterPrompt } from "../utils/scenario";
import { useEcosApi } from "@/hooks/useEcosApi";
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
  const { getSessionDetails, getScenarioDetail } = useEcosApi();
  const { microphoneAccess, askMicrophoneAccess } = useMicrophoneAccess();

  const [shouldConnect, setShouldConnect] = useState(false);
  const backendServerUrl = useBackendServerUrl();
  const [webSocketUrl, setWebSocketUrl] = useState<string | null>(null);
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [errors, setErrors] = useState<ErrorItem[]>([]);
  const [scenarioReady, setScenarioReady] = useState(false);


  useWakeLock(shouldConnect);

useEffect(() => {
    async function recoverFullContext() {
      if (!id) return;

      try {
        const sessionInfo = await getSessionDetails(id);
        const scenarioInfo = await getScenarioDetail(sessionInfo.sddNum);
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
    <><div className="w-full">
      <ErrorMessages errors={errors} setErrors={setErrors} />
      <div className="relative flex w-full min-h-screen flex-col text-white bg-background items-center">
        <EcosAudioVisualizers
          chatHistory={chatHistory}
          audioProcessor={audioProcessor}
          onConnectButtonPress={onConnectButtonPress}
          shouldConnect={shouldConnect}
        />
        <EcosControlsBar
          formatted={formatted}
          status={status}
          progressPct={progressPct}
          onConnectButtonPress={onConnectButtonPress}
          shouldConnect={shouldConnect}
          microphoneAccess={microphoneAccess}
        />
      </div>
      <canvas ref={recordingCanvasRef} className="hidden" />
    </div>
    <div className="w-80 xl:w-96 border-l border-white/10 bg-black/30 backdrop-blur-sm flex-shrink-0">
        <ChatPanel chatHistory={chatHistory} isConnected={shouldConnect} />
      </div></>

  );
};

export default EcosAssistant;
