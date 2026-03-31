// Page.tsx
import AuthGuard from "@/components/AuthGuard";
import EcosAssistant from "@/components/EcosAssistant";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;

  return (
    <AuthGuard>
      <EcosAssistant key={resolvedParams.id} id={resolvedParams.id} />
    </AuthGuard>
  );
}