import { TimerStatus } from "@/hooks/useEcosTimer";
import clsx from "clsx";

interface EcosTimerProps {
  formatted: string;
  status: TimerStatus;
  progressPct: number;
}

const STATUS_COLORS: Record<TimerStatus, string> = {
  idle:    "text-white/30",
  running: "text-white",
  warning: "text-amber-400",
  expired: "text-red-500",
};

const BAR_COLORS: Record<TimerStatus, string> = {
  idle:    "bg-white/10",
  running: "bg-white/60",
  warning: "bg-amber-400",
  expired: "bg-red-500",
};

export default function EcosTimer({ formatted, status, progressPct }: EcosTimerProps) {
  if (status === "idle") return null; // invisible avant le démarrage

  return (
    <div className="flex flex-col items-center gap-2 w-full max-w-96">
      {/* Temps restant */}
      <span
        className={clsx(
          "text-2xl font-mono font-medium tabular-nums transition-colors duration-300",
          STATUS_COLORS[status],
          status === "warning" && "animate-pulse",
        )}
      >
        {formatted}
      </span>

      {/* Barre de progression */}
      <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
        <div
          className={clsx(
            "h-full rounded-full transition-all duration-1000 ease-linear",
            BAR_COLORS[status],
          )}
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Label contextuel */}
      {status === "warning" && (
        <span className="text-xs text-amber-400/80">Moins d'une minute</span>
      )}
      {status === "expired" && (
        <span className="text-xs text-red-400">Temps écoulé</span>
      )}
    </div>
  );
}
