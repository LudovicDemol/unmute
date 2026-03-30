// Page.tsx
import EcosAssistant from "@/components/EcosAssistant";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;

  return (
    <div className="w-full h-screen flex justify-center bg-background">
      {/* Passe l'id au composant client, pas ici */}
      <EcosAssistant key={resolvedParams.id} id={resolvedParams.id} />
    </div>
  );
}