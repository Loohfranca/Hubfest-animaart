"use server";

import { createClient } from "@/shared/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function resetPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  if (!email) return { error: "Informe o email" };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) return { error: error.message };
  return { ok: true };
}
