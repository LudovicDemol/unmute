import clsx from "clsx";

export type HealthStatus = {
  connected: "no" | "yes_request_ok" | "yes_request_fail";
  ok: boolean;
  tts_up?: boolean;
  stt_up?: boolean;
  llm_up?: boolean;
  voice_cloning_up?: boolean;
};

const renderServiceStatus = (
  name: string,
  status: string | boolean | undefined,
  necessary: boolean = true
) => {
  if (status === undefined) {
    status = "Unknown";
  } else if (status === true) {
    status = "Up";
  } else if (status === false) {
    status = "Down";
  }

  return (
    <p>
      {name}:{" "}
      <span
        className={clsx(
          status === "Up"
            ? "text-white"
            : necessary
            ? "text-red"
            : "text-lightgray"
        )}
      >
        {status}
      </span>
    </p>
  );
};

const humanReadableStatus = {
  no: "Down",
  yes_request_ok: "Up",
  yes_request_fail: "Up, but with errors",
};

const CouldNotConnect = ({ healthStatus }: { healthStatus: HealthStatus }) => {
  if (healthStatus.ok) {
    return null;
  }
  console.error("Health check failed:", healthStatus);

  return (
    <div className="w-full h-full flex flex-col gap-12 items-center justify-center bg-background">
      <div className="text-center text-xl">
        <h1 className="text-3xl mb-4">Désolés nos services sont indisponibles...</h1>
      </div>
    </div>
  );
};

export default CouldNotConnect;
