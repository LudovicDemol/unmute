// Page.tsx
import EcosAssistant from "@/components/EcosAssistant";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;

  return (
      <EcosAssistant key={resolvedParams.id} id={resolvedParams.id} />
  );
}