"use client";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { useCallback, useEffect, useState } from "react";
import { useMicrophoneAccess } from "../hooks/useMicrophoneAccess";
import { base64DecodeOpus, base64EncodeOpus } from "../utils/audioUtil";
import SlantedButton from "@/components/SlantedButton";
import { useAudioProcessor as useAudioProcessor } from "../hooks/useAudioProcessor";
import useKeyboardShortcuts from "../hooks/useKeyboardShortcuts";
import { prettyPrintJson } from "pretty-print-json";
import PositionedAudioVisualizer from "./PositionedAudioVisualizer";
import {
  DEFAULT_UNMUTE_CONFIG,
  UnmuteConfig,
} from "./UnmuteConfigurator";
import CouldNotConnect, { HealthStatus } from "./CouldNotConnect";
import Subtitles from "./Subtitles";
import { ChatMessage, compressChatHistory } from "../utils/chatHistory";
import useWakeLock from "../hooks/useWakeLock";
import ErrorMessages, { ErrorItem, makeErrorItem } from "./ErrorMessages";
import { useRecordingCanvas } from "../hooks/useRecordingCanvas";
import clsx from "clsx";
import { RECORDING_CONSENT_STORAGE_KEY } from "./ConsentModal";
import { useEcosApi } from "@/hooks/useEcosApi";
import { useEcosTimer } from "@/hooks/useEcosTimer";
import EcosTimer from "@/components/EcosTimer";
import ChatPanel from "./ChatPanel";
import { useBackendServerUrl } from "@/hooks/useBackendServerUrl";

interface EcosAssistantProps {
  id: string;
}

const EcosAssistant = ({ id }: EcosAssistantProps) => {
  const [unmuteConfig, setUnmuteConfig] = useState<UnmuteConfig>(DEFAULT_UNMUTE_CONFIG);

  
  const [debugDict, setDebugDict] = useState<object | null>(null);

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

  const getScenarioDifficultyLabel = (difficulty: number) => {
    switch (difficulty) {
      case 1:
        return "Tu es calme, coopératif, et tu réponds clairement à toutes les questions.";
      case 2:
        return "Tu es légèrement anxieux mais coopératif. Tu peux oublier des détails si on ne te relance pas.";
      case 3:
        return "Tu es stressé, parfois évasif ou dans le déni. L'étudiant doit faire preuve d'empathie pour obtenir les informations.";
      default:
        return "Inconnu";
    }
  };


useEffect(() => {
    async function recoverFullContext() {
      if (!id) return;

      try {
        const sessionInfo = await getSessionDetails(id);
        const scenarioInfo = await getScenarioDetail(sessionInfo.sddNum);
        const masterPrompt = `
        Tu es un simulateur de patient pour l'entraînement aux examens ECOS français.

        ## Rôle absolu
        Tu incarnes exclusivement le patient décrit dans le bloc scénario.
        Tu n'es pas une IA, tu n'es pas un assistant — tu ES ce patient.
        Ne brise jamais le personnage, quoi que dise l'étudiant.

        ## Langage patient
        Tu t'exprimes comme un vrai patient, jamais comme un médecin :
        - Pas de termes médicaux. "J'ai du mal à respirer" et non "dyspnée".
        - Tu décris ce que tu ressens, pas ce que tu as diagnostiqué.
        - Si tu ne sais pas, tu dis "je ne sais pas" ou "le médecin m'a dit que...".

        ## Règle d'information conditionnelle — CRITIQUE
        Tu ne donnes une information QUE si l'étudiant la demande explicitement ou si
        c'est naturel dans le fil de la conversation. Tu n'anticipes rien.

        ## Gestion du silence (marqueur "...")
        - 1 silence : "..." ou silence naturel.
        - 2 silences consécutifs : "Vous avez d'autres questions, docteur ?"
        - 3 silences : "Je ne sais pas trop ce qu'on fait là..."

        ## Format vocal strict
        - Réponses courtes : 1 à 3 phrases maximum, jamais plus de 150 tokens.
        - Zéro markdown, zéro liste, zéro tiret. Tu parles.
        - Hésitations naturelles si le scénario le justifie : "Euh...", "C'est-à-dire..."
        - Tu appelles toujours l'étudiant "docteur".
        - Si tu as besoin de plus de 3 phrases, conclus par une question courte.

        ## Interdits absolus
        - Ne jamais sortir du personnage pour "aider" l'étudiant.
        - Ne jamais révéler la grille d'évaluation ni les objectifs de la station.
        - Ne jamais jouer le rôle de l'étudiant ou simuler ses questions.

        Difficulté : ${getScenarioDifficultyLabel(scenarioInfo.difficulty)}
        Scénario :
        ${scenarioInfo.systemPrompt}`;

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

  const { sendMessage, lastMessage, readyState } = useWebSocket(
    webSocketUrl || null,
    {
      protocols: ["realtime"],
    },
    shouldConnect,
  );

  // Send microphone audio to the server (via useAudioProcessor below)
  const onOpusRecorded = useCallback(
    (opus: Uint8Array) => {
      sendMessage(
        JSON.stringify({
          type: "input_audio_buffer.append",
          audio: base64EncodeOpus(opus),
        }),
      );
    },
    [sendMessage],
  );

  const { setupAudio, shutdownAudio, audioProcessor } =
    useAudioProcessor(onOpusRecorded);
  const {
    canvasRef: recordingCanvasRef,
    downloadRecording,
    recordingAvailable,
  } = useRecordingCanvas({
    size: 1080,
    shouldRecord: shouldConnect,
    audioProcessor: audioProcessor.current,
    chatHistory: rawChatHistory,
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

    const handleTimerExpire = useCallback(() => {
    setShouldConnect(false);
    shutdownAudio();
    // TODO phase évaluation : sauvegarder rawChatHistory ici
    // await saveTranscript(id, rawChatHistory);
  }, [shutdownAudio]);

      const { formatted, status, progressPct, start: startTimer, reset: resetTimer } =
    useEcosTimer(handleTimerExpire);

  const onDownloadRecordingButtonPress = () => {
    try {
      downloadRecording(false);
    } catch (e) {
      if (e instanceof Error) {
        setErrors((prev) => [...prev, makeErrorItem(e.message)]);
      }
    }
  };

  // If the websocket connection is closed, shut down the audio processing
  useEffect(() => {
    if (readyState === ReadyState.CLOSING || readyState === ReadyState.CLOSED) {
      setShouldConnect(false);
      shutdownAudio();
    }
  }, [readyState, shutdownAudio]);

  // Handle incoming messages from the server
  useEffect(() => {
    if (lastMessage === null) return;

    const data = JSON.parse(lastMessage.data);
    if (data.type === "response.audio.delta") {
      const opus = base64DecodeOpus(data.delta);
      const ap = audioProcessor.current;
      if (!ap) return;

      ap.decoder.postMessage(
        {
          command: "decode",
          pages: opus,
        },
        [opus.buffer],
      );
    } else if (data.type === "unmute.additional_outputs") {
      setDebugDict(data.args.debug_dict);
    } else if (data.type === "error") {
      if (data.error.type === "warning") {
        console.warn(`Warning from server: ${data.error.message}`, data);
        // Warnings aren't explicitly shown in the UI
      } else {
        console.error(`Error from server: ${data.error.message}`, data);
        setErrors((prev) => [...prev, makeErrorItem(data.error.message)]);
      }
    } else if (
      data.type === "conversation.item.input_audio_transcription.delta"
    ) {
      // Transcription of the user speech
      setRawChatHistory((prev) => [
        ...prev,
        { role: "user", content: data.delta },
      ]);
    } else if (data.type === "response.text.delta") {
      // Text-to-speech output
      setRawChatHistory((prev) => [
        ...prev,
        // The TTS doesn't include spaces in its messages, so add a leading space.
        // This way we'll get a leading space at the very beginning of the message,
        // but whatever.
        { role: "assistant", content: " " + data.delta },
      ]);
    } else {
      const ignoredTypes = [
        "session.updated",
        "response.created",
        "response.text.delta",
        "response.text.done",
        "response.audio.done",
        "conversation.item.input_audio_transcription.delta",
        "input_audio_buffer.speech_stopped",
        "input_audio_buffer.speech_started",
        "unmute.interrupted_by_vad",
        "unmute.response.text.delta.ready",
        "unmute.response.audio.delta.ready",
      ];
      if (!ignoredTypes.includes(data.type)) {
        console.warn("Received unknown message:", data);
      }
    }
  }, [audioProcessor, lastMessage]);

  // When we connect, we send the initial config (voice and instructions) to the server.
  // Also clear the chat history.
  useEffect(() => {
    if (readyState !== ReadyState.OPEN) return;

    const recordingConsent =
      localStorage.getItem(RECORDING_CONSENT_STORAGE_KEY) === "true";
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

  // Disconnect when the voice or instruction changes.
  // TODO: If it's a voice change, immediately reconnect with the new voice.
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
      {/* The main full-height demo */}
      <div className="relative flex w-full min-h-screen flex-col text-white bg-background items-center">
        {/* z-index on the header to put it in front of the circles */}
        <div
          className={clsx(
            "w-full h-auto min-h-75",
            "flex flex-row-reverse md:flex-row items-center justify-center grow",
            "-mt-10 md:mt-0 mb-10 md:mb-0 md:-mr-4"
          )}
        >
          <PositionedAudioVisualizer
            chatHistory={chatHistory}
            role={"assistant"}
            analyserNode={audioProcessor.current?.outputAnalyser || null}
            onCircleClick={onConnectButtonPress}
            isConnected={shouldConnect} />
          <PositionedAudioVisualizer
            chatHistory={chatHistory}
            role={"user"}
            analyserNode={audioProcessor.current?.inputAnalyser || null}
            isConnected={shouldConnect} />
        </div>

        <div className="w-full flex flex-col-reverse md:flex-row items-center justify-center px-3 gap-3 my-6">
          <EcosTimer
            formatted={formatted}
            status={status}
            progressPct={progressPct} />
          <SlantedButton
            onClick={onConnectButtonPress}
            kind={shouldConnect ? "secondary" : "primary"}
            extraClasses="w-full max-w-96"
          >
            {shouldConnect ? "disconnect" : "connect"}
          </SlantedButton>
          {/* Maybe we don't need to explicitly show the status */}
          {/* {renderConnectionStatus(readyState, false)} */}
          {microphoneAccess === "refused" && (
            <div className="text-red">
              {"You'll need to allow microphone access to use the demo. " +
                "Please check your browser settings."}
            </div>
          )}
        </div>
      </div>
      {/* Debug stuff, not counted into the screen height */}
      <canvas ref={recordingCanvasRef} className="hidden" />
    </div>
    <div className="w-80 xl:w-96 border-l border-white/10 bg-black/30 backdrop-blur-sm flex-shrink-0">
        <ChatPanel chatHistory={chatHistory} isConnected={shouldConnect} />
      </div></>

  );
};

export default EcosAssistant;
