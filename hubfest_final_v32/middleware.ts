import type { NextRequest } from "next/server";
import { updateSession } from "@/shared/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|svg|jpg|jpeg|gif|webp|ico|webmanifest)$).*)"],
};
