/**
 * Chat history management for ECOS sessions
 * Handles chat messages from WebSocket (user transcriptions + assistant responses)
 */

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: number;
}

/**
 * Compress chat history by merging consecutive messages from the same role
 * Reduces noise when streaming text deltas
 */
export function compressChatHistory(messages: ChatMessage[]): ChatMessage[] {
  if (messages.length === 0) return [];

  const compressed: ChatMessage[] = [];
  let current = { ...messages[0] };

  for (let i = 1; i < messages.length; i++) {
    if (messages[i].role === current.role) {
      // Merge messages from same role
      current.content += messages[i].content;
    } else {
      // Push current and start new
      compressed.push(current);
      current = { ...messages[i] };
    }
  }

  compressed.push(current);
  return compressed;
}

/**
 * Convert chat history to string format for display
 */
export function chatHistoryToString(
  messages: ChatMessage[],
  separator = "\n"
): string {
  return messages.map((m) => `${m.role}: ${m.content}`).join(separator);
}

/**
 * Extract transcription from WebSocket events
 * Maps Unmute event types to chat history entries
 */
export function handleUnmuteEvent(
  event: Record<string, unknown>,
  onMessage: (message: ChatMessage) => void
) {
  const eventType = event.type as string;

  if (eventType === "conversation.item.input_audio_transcription.delta") {
    // User transcription
    onMessage({
      role: "user",
      content: event.delta as string,
    });
  } else if (eventType === "response.text.delta") {
    // Assistant text response
    onMessage({
      role: "assistant",
      content: event.delta as string,
    });
  }
}
