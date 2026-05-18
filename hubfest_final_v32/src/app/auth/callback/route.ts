import { createClient } from "@/shared/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error?.message ?? "auth_failed")}`);
  }

  const { session, user } = data;
  const providerToken = session.provider_token;
  const providerRefreshToken = session.provider_refresh_token;

  if (user && providerRefreshToken) {
    const expiresAt = new Date(Date.now() + 55 * 60 * 1000).toISOString();
    await supabase.from("user_google_tokens").upsert({
      user_id: user.id,
      refresh_token: providerRefreshToken,
      access_token: providerToken,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    });
  }

  return NextResponse.redirect(`${origin}${next}`);
}
