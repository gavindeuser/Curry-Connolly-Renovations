"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

export function SupabaseLoginForm({ hasSharedAccessCode = false }: { hasSharedAccessCode?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo")?.startsWith("/") ? searchParams.get("redirectTo")! : "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAccessCode, setShowAccessCode] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (mode === "sign-up" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (mode === "sign-up" && hasSharedAccessCode && !accessCode.trim()) {
      setError("Enter the shared access code to continue.");
      return;
    }

    setIsSubmitting(true);

    if (mode === "sign-up" && hasSharedAccessCode) {
      const accessResponse = await fetch("/api/auth/access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accessCode }),
      });

      if (!accessResponse.ok) {
        setError("The access code was incorrect. Please try again.");
        setIsSubmitting(false);
        return;
      }
    }

    const supabase = createClient();
    const action =
      mode === "sign-in"
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: typeof window === "undefined" ? undefined : `${window.location.origin}${redirectTo}`,
            },
          });

    const { data, error: authError } = await action;

    if (authError) {
      setError(authError.message);
      setIsSubmitting(false);
      return;
    }

    if (mode === "sign-up" && !data.session) {
      setMessage("Account created. Check your email if your Supabase project requires confirmation before sign-in.");
      setIsSubmitting(false);
      return;
    }

    router.replace(redirectTo);
    router.refresh();
  };

  return (
    <div className="mt-6">
      <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">
        {mode === "sign-in" ? "Sign In" : "Create Account"}
      </h1>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
        {mode === "sign-in"
          ? "Sign in with your project account to access shared saved options and collaboration features."
          : "Create a project account so you can save options, revisit scenarios, and collaborate across the dashboards."}
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      {mode === "sign-up" && hasSharedAccessCode ? (
        <div>
          <label htmlFor="access-code" className="text-sm font-semibold text-[var(--foreground)]">
            Access Code
          </label>
          <div className="mt-2 flex items-center overflow-hidden rounded-[1.25rem] border border-[var(--border)] bg-white transition focus-within:border-[var(--core-green)]">
            <input
              id="access-code"
              name="access-code"
              type={showAccessCode ? "text" : "password"}
              value={accessCode}
              onChange={(event) => setAccessCode(event.target.value)}
              required
              className="w-full px-4 py-3 text-sm outline-none"
            />
            <button
              type="button"
              onClick={() => setShowAccessCode((current) => !current)}
              className="flex h-full items-center gap-2 px-4 py-3 text-sm font-semibold text-[var(--muted)] transition hover:text-[var(--foreground)]"
              aria-label={showAccessCode ? "Hide access code" : "Show access code"}
            >
              {showAccessCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span>{showAccessCode ? "Hide" : "Show"}</span>
            </button>
          </div>
        </div>
      ) : null}
      <div>
        <label htmlFor="email" className="text-sm font-semibold text-[var(--foreground)]">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className="mt-2 w-full rounded-[1.25rem] border border-[var(--border)] px-4 py-3 text-sm outline-none transition focus:border-[var(--core-green)]"
        />
      </div>
      <div>
        <label htmlFor="password" className="text-sm font-semibold text-[var(--foreground)]">
          Password
        </label>
        <div className="mt-2 flex items-center overflow-hidden rounded-[1.25rem] border border-[var(--border)] bg-white transition focus-within:border-[var(--core-green)]">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="w-full px-4 py-3 text-sm outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="flex h-full items-center gap-2 px-4 py-3 text-sm font-semibold text-[var(--muted)] transition hover:text-[var(--foreground)]"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span>{showPassword ? "Hide" : "Show"}</span>
          </button>
        </div>
      </div>
      {mode === "sign-up" ? (
        <div>
          <label htmlFor="confirm-password" className="text-sm font-semibold text-[var(--foreground)]">
            Confirm Password
          </label>
          <div className="mt-2 flex items-center overflow-hidden rounded-[1.25rem] border border-[var(--border)] bg-white transition focus-within:border-[var(--core-green)]">
            <input
              id="confirm-password"
              name="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              className="w-full px-4 py-3 text-sm outline-none"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((current) => !current)}
              className="flex h-full items-center gap-2 px-4 py-3 text-sm font-semibold text-[var(--muted)] transition hover:text-[var(--foreground)]"
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span>{showConfirmPassword ? "Hide" : "Show"}</span>
            </button>
          </div>
        </div>
      ) : null}
      {error ? (
        <p className="rounded-[1rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}
      {message ? (
        <p className="rounded-[1rem] border border-[color:rgba(0,131,72,0.22)] bg-[color:rgba(0,131,72,0.08)] px-4 py-3 text-sm text-[var(--core-green)]">
          {message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-[var(--core-green)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Working..." : mode === "sign-in" ? "Sign In" : "Create Account"}
      </button>
      <button
        type="button"
        onClick={() => {
          setMode((current) => (current === "sign-in" ? "sign-up" : "sign-in"));
          setError("");
          setMessage("");
          setConfirmPassword("");
          setShowConfirmPassword(false);
        }}
        className="w-full text-sm font-semibold text-[var(--foreground)] underline decoration-[color:rgba(0,131,72,0.35)] underline-offset-4"
      >
        {mode === "sign-in" ? "Need an account? Create one" : "Already have an account? Sign in"}
      </button>
      </form>
    </div>
  );
}
