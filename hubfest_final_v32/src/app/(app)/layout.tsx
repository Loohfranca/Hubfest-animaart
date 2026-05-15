import { Sidebar } from "@/shared/ui/sidebar";
import { createClient } from "@/shared/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen flex">
      <Sidebar userEmail={user?.email ?? undefined} />
      <main className="flex-1 min-w-0 p-4 lg:p-8 pt-16 lg:pt-8">{children}</main>
    </div>
  );
}
