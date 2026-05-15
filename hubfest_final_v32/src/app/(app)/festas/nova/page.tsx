import { FestaForm } from "@/features/festas/festa-form";

export default function NovaFestaPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <h1 className="text-2xl font-bold">Nova Festa</h1>
      <FestaForm />
    </div>
  );
}
