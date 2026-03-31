export const useBackendServerUrl = () => {
  return process.env.NEXT_PUBLIC_URL_API_UNMUTE ?? null
}