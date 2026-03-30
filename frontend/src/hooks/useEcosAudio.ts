import { useCallback } from "react";
import { useAudioProcessor } from "./useAudioProcessor";
import { useRecordingCanvas } from "./useRecordingCanvas";
import { base64EncodeOpus } from "../utils/audioUtil";
import { ChatMessage } from "../utils/chatHistory";

interface UseEcosAudioProps {
  shouldRecord: boolean;
  chatHistory: ChatMessage[];
  onSendAudio: (audio: string) => void;
}

export function useEcosAudio({ shouldRecord, chatHistory, onSendAudio }: UseEcosAudioProps) {
  // Callback pour envoyer l'audio encodé au serveur
  const onOpusRecorded = useCallback(
    (opus: Uint8Array) => {
      onSendAudio(base64EncodeOpus(opus));
    },
    [onSendAudio]
  );

  const { setupAudio, shutdownAudio, audioProcessor } = useAudioProcessor(onOpusRecorded);

  const {
    canvasRef: recordingCanvasRef,
    downloadRecording,
    recordingAvailable,
  } = useRecordingCanvas({
    size: 1080,
    shouldRecord,
    audioProcessor: audioProcessor.current,
    chatHistory,
  });

  return {
    setupAudio,
    shutdownAudio,
    audioProcessor,
    recordingCanvasRef,
    downloadRecording,
    recordingAvailable,
  };
}
