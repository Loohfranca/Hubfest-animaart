import { notFound } from "next/navigation";
import { getFesta } from "@/features/festas/queries";
import { FestaForm } from "@/features/festas/festa-form";

export default async function EditarFestaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const festa = await getFesta(id);
  if (!festa) notFound();

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <h1 className="text-2xl font-bold">Editar Festa</h1>
      <FestaForm festa={festa} />
    </div>
  );
}
