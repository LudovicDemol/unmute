import { useEffect, useState } from "react";

export const useBackendServerUrl = () => {
  const [backendServerUrl, setBackendServerUrl] = useState<string | null>(null);

  useEffect(() => {
      setBackendServerUrl("https://push-teddy-merge-kodak.trycloudflare.com");
  }, []);

  return backendServerUrl;
};
