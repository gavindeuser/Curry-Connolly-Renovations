import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getAuthMode } from "@/lib/auth";
import { updateSupabaseSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authMode = getAuthMode();

  const isPublicPath =
    pathname === "/login" ||
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/logo.svg") ||
    pathname.match(/\.(?:png|jpg|jpeg|gif|svg|webp|ico)$/);

  if (authMode === "open") {
    return NextResponse.next();
  }

  if (authMode === "password" && !isPublicPath) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (authMode === "password") {
    return NextResponse.next();
  }

  if (authMode === "supabase" || authMode === "hybrid") {
    const { response, user } = await updateSupabaseSession(request);

    if (isPublicPath) {
      if (pathname === "/login" && user) {
        return NextResponse.redirect(new URL("/", request.url));
      }

      return response;
    }

    if (user) {
      return response;
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
