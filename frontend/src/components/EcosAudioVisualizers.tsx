import PositionedAudioVisualizer from "./PositionedAudioVisualizer";
import { ChatMessage } from "../utils/chatHistory";
import { RefObject } from "react";

interface EcosAudioVisualizersProps {
  chatHistory: ChatMessage[];
  audioProcessor: any;
  onConnectButtonPress: () => void;
  shouldConnect: boolean;
}

const EcosAudioVisualizers = ({
  chatHistory,
  audioProcessor,
  onConnectButtonPress,
  shouldConnect,
}: EcosAudioVisualizersProps) => (
  <div
    className={
      "w-full h-auto min-h-75 flex flex-row-reverse md:flex-row items-center justify-center grow -mt-10 md:mt-0 mb-10 md:mb-0 md:-mr-4"
    }
  >
    <PositionedAudioVisualizer
      chatHistory={chatHistory}
      role={"assistant"}
      analyserNode={audioProcessor.current?.outputAnalyser || null}
      onCircleClick={onConnectButtonPress}
      isConnected={shouldConnect}
    />
    <PositionedAudioVisualizer
      chatHistory={chatHistory}
      role={"user"}
      analyserNode={audioProcessor.current?.inputAnalyser || null}
      isConnected={shouldConnect}
    />
  </div>
);

export default EcosAudioVisualizers;
