import AuthGuard from "@/components/AuthGuard";
import ScenarioSelectPage from "@/components/ScenarioSelect";

export default function Page() {
  return (
    <AuthGuard>
      <ScenarioSelectPage />
    </AuthGuard>
  );
}