import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, getExpectedPassword, isPasswordValid } from "@/lib/auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "/");
  const expectedPassword = getExpectedPassword();

  if (!expectedPassword) {
    return NextResponse.redirect(new URL("/", request.url), 303);
  }

  if (!isPasswordValid(password)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "1");

    if (redirectTo.startsWith("/")) {
      loginUrl.searchParams.set("redirectTo", redirectTo);
    }

    return NextResponse.redirect(loginUrl, 303);
  }

  const response = NextResponse.redirect(new URL(redirectTo.startsWith("/") ? redirectTo : "/", request.url), 303);

  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: expectedPassword,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });

  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    expires: new Date(0),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return response;
}
