import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, getAuthMode, getExpectedPassword, isPasswordConfigured } from "@/lib/auth";
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

  const passwordConfigured = isPasswordConfigured();
  const expectedPassword = getExpectedPassword();
  const authCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const hasPasswordAccess = !passwordConfigured || authCookie === expectedPassword;

  if ((authMode === "password" || authMode === "hybrid") && !hasPasswordAccess && !isPublicPath) {
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
      if (pathname === "/login" && user && hasPasswordAccess) {
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
