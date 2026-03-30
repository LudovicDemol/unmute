// utils/recordingConsent.ts
// Utilitaire pour gérer le consentement d'enregistrement
import { RECORDING_CONSENT_STORAGE_KEY } from "../components/ConsentModal";

export function getRecordingConsent(): boolean {
  return localStorage.getItem(RECORDING_CONSENT_STORAGE_KEY) === "true";
}
