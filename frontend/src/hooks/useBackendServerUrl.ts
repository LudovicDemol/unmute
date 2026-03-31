import { useEffect, useState } from "react";

export const useBackendServerUrl = () => {
  const [backendServerUrl, setBackendServerUrl] = useState<string | null>(null);

  useEffect(() => {
      setBackendServerUrl("https://echo-valley-jefferson-nextel.trycloudflare.com");
  }, []);

  return backendServerUrl;
};
