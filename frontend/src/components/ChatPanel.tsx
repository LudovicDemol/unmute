"use client";

import { useEffect, useRef, useState } from "react";
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
      <div className="px-4 py-3 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-md rounded-t-3xl">
        <div className="flex items-center gap-2">
          <div
            className={clsx(
              "w-2 h-2 rounded-full transition-colors duration-300",
              isConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-700"
            )}
          />
          <span className="text-sm font-semibold text-slate-300 tracking-wide">
            Transcription
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-800">
        {chatHistory.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-500 text-sm italic text-center">
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
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 px-1 font-mono">
          {isAssistant ? "Patient" : "Médecin"}
        </span>

        {/* Bubble */}
        <div
          className={clsx(
            "px-4 py-3 rounded-2xl text-sm leading-relaxed font-sans transition-all duration-200",
            isAssistant
              ? "bg-slate-800/30 border border-slate-700/50 text-slate-300 rounded-tl-none shadow-blue-500/10 backdrop-blur-md"
              : "bg-blue-500/80 border border-blue-500/40 text-white rounded-tr-none shadow-blue-500/10 backdrop-blur-md"
          )}
          style={{ minHeight: 36 }}
        >
          {message.content.trim()}
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;