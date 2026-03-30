import { useCallback, useEffect, useRef } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { base64DecodeOpus } from "../utils/audioUtil";

export interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

interface UseEcosWebSocketProps {
  url: string | null;
  shouldConnect: boolean;
  onAudioDelta?: (opus: Uint8Array) => void;
  onAdditionalOutputs?: (debugDict: Record<string, unknown>) => void;
  onError?: (errorMsg: string, isWarning?: boolean) => void;
  onUserTranscription?: (text: string) => void;
  onAssistantText?: (text: string) => void;
}

export function useEcosWebSocket({
  url,
  shouldConnect,
  onAudioDelta,
  onAdditionalOutputs,
  onError,
  onUserTranscription,
  onAssistantText,
}: UseEcosWebSocketProps) {
  const { sendMessage, lastMessage, readyState } = useWebSocket(
    url,
    { protocols: ["realtime"] },
    shouldConnect
  );

  useEffect(() => {
    if (!lastMessage) return;
    let data: WebSocketMessage;
    try {
      data = JSON.parse(lastMessage.data);
    } catch {
      return;
    }
    switch (data.type) {
      case "response.audio.delta":
        if (onAudioDelta) onAudioDelta(base64DecodeOpus(data.delta));
        break;
      case "unmute.additional_outputs":
        if (onAdditionalOutputs) onAdditionalOutputs(data.args.debug_dict);
        break;
      case "error":
        if (onError) onError(data.error.message, data.error.type === "warning");
        break;
      case "conversation.item.input_audio_transcription.delta":
        if (onUserTranscription) onUserTranscription(data.delta);
        break;
      case "response.text.delta":
        if (onAssistantText) onAssistantText(data.delta);
        break;
      default:
        // Ignored types or unknown
        break;
    }
  }, [lastMessage, onAudioDelta, onAdditionalOutputs, onError, onUserTranscription, onAssistantText]);

  return { sendMessage, readyState };
}
