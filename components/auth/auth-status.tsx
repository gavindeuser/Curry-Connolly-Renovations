"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/client";

export function AuthStatus() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let isCancelled = false;

    void supabase.auth.getUser().then(({ data }) => {
      if (!isCancelled) {
        setUser(data.user ?? null);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      isCancelled = true;
      subscription.unsubscribe();
    };
  }, [supabase]);

  if (!user) {
    return null;
  }

  return (
    <div className="ml-auto flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--core-green)]">Signed in</p>
        <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">{user.email}</p>
      </div>
      <button
        type="button"
        disabled={isSigningOut}
        onClick={async () => {
          setIsSigningOut(true);
          await fetch("/api/auth/logout", {
            method: "POST",
          }).finally(() => {
            router.replace("/login");
            router.refresh();
            setIsSigningOut(false);
          });
        }}
        className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--core-green)] hover:text-[var(--core-green)] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSigningOut ? "Signing out..." : "Sign out"}
      </button>
    </div>
  );
}
