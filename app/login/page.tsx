import type { CSSProperties } from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { SupabaseLoginForm } from "@/components/auth/supabase-login-form";
import { AUTH_COOKIE_NAME, getAuthMode, getExpectedPassword, isPasswordConfigured } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
    redirectTo?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = (await searchParams) ?? {};
  const hasError = params.error === "1";
  const redirectTo = params.redirectTo?.startsWith("/") ? params.redirectTo : "/";
  const authMode = getAuthMode();
  const cookieStore = await cookies();
  const hasPasswordAccess =
    !isPasswordConfigured() || cookieStore.get(AUTH_COOKIE_NAME)?.value === getExpectedPassword();
  const shouldUseSupabase = (authMode === "supabase" || authMode === "hybrid") && hasPasswordAccess;

  if (shouldUseSupabase) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      redirect(redirectTo);
    }
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#0b0b0b_0%,#171717_56%,#008348_160%)] px-4 py-10"
      style={
        {
          "--core-green": "#008348",
          "--core-green-200": "#86d2ac",
          "--foreground": "#161616",
          "--muted": "#5b6160",
          "--border": "rgba(17, 17, 17, 0.1)",
        } as CSSProperties
      }
    >
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white p-8 shadow-[0_28px_80px_rgba(0,0,0,0.22)]">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--core-green)]">Protected Access</p>
        {shouldUseSupabase ? (
          <SupabaseLoginForm />
        ) : (
          <form action="/api/auth/login" method="POST" className="mt-6 space-y-4">
            <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">Enter Password</h1>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              This dashboard is password protected. Enter the shared password to continue.
            </p>
            <input type="hidden" name="redirectTo" value={redirectTo} />
            <div>
              <label htmlFor="password" className="text-sm font-semibold text-[var(--foreground)]">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-2 w-full rounded-[1.25rem] border border-[var(--border)] px-4 py-3 text-sm outline-none transition focus:border-[var(--core-green)]"
              />
            </div>
            {hasError ? (
              <p className="rounded-[1rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                The password was incorrect. Please try again.
              </p>
            ) : null}
            <button
              type="submit"
              className="w-full rounded-full bg-[var(--core-green)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Continue
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
