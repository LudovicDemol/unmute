import EcosTimer from "@/components/EcosTimer";
import SlantedButton from "@/components/SlantedButton";
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
  <div className="w-full flex flex-col-reverse md:flex-row items-center justify-center px-3 gap-3 my-6">
    <EcosTimer formatted={formatted} status={status} progressPct={progressPct} />
    <SlantedButton
      onClick={onConnectButtonPress}
      kind={shouldConnect ? "secondary" : "primary"}
      extraClasses="w-full max-w-96"
    >
      {shouldConnect ? "disconnect" : "connect"}
    </SlantedButton>
    {microphoneAccess === "refused" && (
      <div className="text-red">
        {"You'll need to allow microphone access to use the demo. Please check your browser settings."}
      </div>
    )}
  </div>
);

export default EcosControlsBar;
