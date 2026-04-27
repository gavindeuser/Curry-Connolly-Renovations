import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, getExpectedPassword, isPasswordValid } from "@/lib/auth";

export async function POST(request: Request) {
  const expectedPassword = getExpectedPassword();

  if (!expectedPassword) {
    return NextResponse.json({ ok: true });
  }

  const { accessCode } = (await request.json()) as { accessCode?: string };

  if (!isPasswordValid(accessCode ?? "")) {
    return NextResponse.json({ error: "Invalid access code." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });

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
