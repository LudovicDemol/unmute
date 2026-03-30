"use client";

import { useEffect, useRef } from "react";
import { ChatMessage } from "../utils/chatHistory";
import clsx from "clsx";

interface ChatPanelProps {
  chatHistory: ChatMessage[];
  isConnected: boolean;
}

const ChatPanel = ({ chatHistory, isConnected }: ChatPanelProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  return (
    <div className="flex flex-col w-full h-full max-h-screen">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div
            className={clsx(
              "w-2 h-2 rounded-full transition-colors duration-300",
              isConnected ? "bg-green-400 animate-pulse" : "bg-gray-500"
            )}
          />
          <span className="text-sm font-medium text-white/70">
            Transcription
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin scrollbar-thumb-white/10">
        {chatHistory.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-white/30 text-sm italic text-center">
              La transcription de la conversation apparaîtra ici...
            </p>
          </div>
        ) : (
          chatHistory.map((msg, index) => (
            <ChatBubble key={index} message={msg} />
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

const ChatBubble = ({ message }: { message: ChatMessage }) => {
  const isAssistant = message.role === "assistant";

  return (
    <div
      className={clsx(
        "flex w-full",
        isAssistant ? "justify-start" : "justify-end"
      )}
    >
      <div
        className={clsx(
          "flex flex-col gap-1 max-w-[85%]",
          isAssistant ? "items-start" : "items-end"
        )}
      >
        {/* Role label */}
        <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40 px-1">
          {isAssistant ? "Patient" : "Médecin"}
        </span>

        {/* Bubble */}
        <div
          className={clsx(
            "px-3 py-2 rounded-2xl text-sm leading-relaxed",
            isAssistant
              ? "bg-white/10 text-white/90 rounded-tl-sm"
              : "bg-blue-500/70 text-white rounded-tr-sm"
          )}
        >
          {message.content.trim()}
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;