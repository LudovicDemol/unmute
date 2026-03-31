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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex items-center gap-2 mb-4">
        <div
          className={clsx(
            "w-2 h-2 rounded-full transition-colors duration-300",
            isConnected ? "bg-teal-500 animate-pulse" : "bg-slate-300"
          )}
        />
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
          Transcription
        </span>
      </div>

      <div className="flex-1 space-y-3">
        {chatHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mb-3">
              <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
            </div>
            <p className="text-sm text-slate-400">La transcription apparaîtra ici</p>
            <p className="text-xs text-slate-300 mt-1">Démarrez la session pour commencer</p>
          </div>
        ) : (
          chatHistory.map((msg, index) => (
            <ChatBubble
              key={index}
              message={msg}
              animate={index === chatHistory.length - 1}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

const CHARS_PER_FRAME = 3;
const FRAME_MS = 16;

const ChatBubble = ({
  message,
  animate,
}: {
  message: ChatMessage;
  animate: boolean;
}) => {
  const isAssistant = message.role === "assistant";
  const fullText = message.content.trim();

  const [displayed, setDisplayed] = useState(animate ? "" : fullText);
  const indexRef = useRef(animate ? 0 : fullText.length);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!animate) {
      setDisplayed(fullText);
      return;
    }

    const tick = () => {
      if (indexRef.current >= fullText.length) return;
      indexRef.current = Math.min(indexRef.current + CHARS_PER_FRAME, fullText.length);
      setDisplayed(fullText.slice(0, indexRef.current));
      if (indexRef.current < fullText.length) {
        timerRef.current = setTimeout(tick, FRAME_MS);
      }
    };

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(tick, FRAME_MS);

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [fullText, animate]);

  const showCursor = animate && displayed.length < fullText.length;

  return (
    <div className={clsx("flex w-full", isAssistant ? "justify-start" : "justify-end")}>
      <div className={clsx("flex flex-col gap-1 max-w-[85%]", isAssistant ? "items-start" : "items-end")}>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-1">
          {isAssistant ? "Patient" : "Médecin"}
        </span>
        <div
          className={clsx(
            "px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
            isAssistant
              ? "bg-slate-100 border border-slate-200 text-slate-700 rounded-tl-none"
              : "bg-teal-500 text-white rounded-tr-none"
          )}
        >
          {displayed}
          {showCursor && (
            <span className="inline-block w-0.5 h-3.5 ml-0.5 align-middle bg-current opacity-70 animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;