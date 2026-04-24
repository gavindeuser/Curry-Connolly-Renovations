"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

import { AuthStatus } from "@/components/auth/auth-status";
import { PreconTabs } from "@/components/preconstruction/precon-tabs";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <main className="mx-auto w-[min(96vw,1600px)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-4 flex items-center gap-4 sm:gap-5">
        <div className="flex h-16 w-32 items-center rounded-[1.25rem] bg-[#050505] px-4 py-3 ring-1 ring-black/10 sm:h-20 sm:w-40 sm:px-5">
          <Image src="/logo.svg" alt="CORE Logo" width={160} height={80} className="h-full w-full object-contain object-left" priority />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--core-green)]">CORE Construction</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
            Precon Dashboard for Tempe Curry and Connolly Renovations
          </h1>
        </div>
        <AuthStatus />
      </div>
      <PreconTabs />
      {children}
    </main>
  );
}
