import clsx from "clsx";

interface EcosControlsBarProps {
  formatted: string;
  status: string;
  progressPct: number;
  onConnectButtonPress: () => void;
  shouldConnect: boolean;
  microphoneAccess: string;
}

const EcosControlsBar = ({
  formatted,
  status,
  progressPct,
  onConnectButtonPress,
  shouldConnect,
  microphoneAccess,
}: EcosControlsBarProps) => (
  <div className="w-full flex flex-col gap-4 px-6 py-5">

    {/* Connect / Disconnect button */}
    <button
      onClick={onConnectButtonPress}
      className={clsx(
        "w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2",
        shouldConnect
          ? "bg-red-50 border border-red-200 text-red-500 hover:bg-red-100 focus:ring-red-300"
          : "bg-teal-500 text-white hover:bg-teal-600 shadow-sm shadow-teal-100 focus:ring-teal-400"
      )}
    >
      {shouldConnect ? (
        <>
          {/* Stop icon */}
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <rect x="5" y="5" width="10" height="10" rx="1.5" />
          </svg>
          Terminer la session
        </>
      ) : (
        <>
          {/* Mic icon */}
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
          </svg>
          Démarrer la session
        </>
      )}
    </button>

    {/* Microphone access warning */}
    {microphoneAccess === "refused" && (
      <div className="flex items-start gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl">
        <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        <p className="text-xs text-amber-700 leading-relaxed">
          L'accès au microphone est requis. Veuillez l'autoriser dans les paramètres de votre navigateur.
        </p>
      </div>
    )}
  </div>
);

export default EcosControlsBar;