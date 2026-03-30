import React, { useEffect } from "react";
import { X } from "lucide-react";

export interface ErrorItem {
  id: string;
  message: string;
  timestamp: number;
}

export const makeErrorItem = (message: string): ErrorItem => {
  const timestamp = Date.now();
  return {
    id: `${timestamp}-${Math.random()}`,
    message,
    timestamp,
  };
};

const ERROR_TIMEOUT_SEC = 10;

export default function ErrorMessages({
  errors,
  setErrors,
}: {
  errors: ErrorItem[];
  setErrors: React.Dispatch<React.SetStateAction<ErrorItem[]>>;
}) {
  // Auto-dismiss errors after 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setErrors((prev) => {
        const now = Date.now();
        const filtered = prev.filter(
          (error) => now - error.timestamp < ERROR_TIMEOUT_SEC * 1000
        );
        return filtered;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [setErrors]);

  const handleDismiss = (index: number, errorId: string) => {
    setErrors((prev) => prev.filter((error) => error.id !== errorId));
  };

  if (errors.length === 0) {
    return null;
  }

  return (
   <div className="fixed top-6 left-0 md:left-6 z-50 space-y-3">
      {errors.map((error, index) => (
        <div
          key={error.id}
          className="max-w-md p-4 rounded-2xl bg-red-900/80 border border-red-500/30 shadow-blue-500/10 backdrop-blur-md flex items-start gap-3 animate-fade-in"
          role="alert"
        >
          <div className="flex-1">
            <span className="text-red-300 font-semibold font-sans text-sm">{error.message}</span>
          </div>
          <button
            onClick={() => handleDismiss(index, error.id)}
            className="text-red-400 hover:text-red-200 rounded-full p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            aria-label="Dismiss"
          >
            <X size={18} />
          </button>
        </div>
      ))}
    </div>
  );
}
