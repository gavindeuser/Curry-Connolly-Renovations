"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils/format";

const tabItems = [
  { href: "/", label: "Skin + Structure" },
  { href: "/hvac", label: "HVAC Options" },
  { href: "/guardrails", label: "Guardrail Options" },
];

export function PreconTabs() {
  const pathname = usePathname();

  return (
    <nav className="mb-6 flex flex-wrap gap-2">
      {tabItems.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-semibold transition",
              isActive
                ? "border-white bg-white text-[var(--foreground)] shadow-[0_12px_28px_rgba(0,0,0,0.08)]"
                : "border-[color:rgba(17,17,17,0.1)] bg-[color:rgba(255,255,255,0.7)] text-[var(--foreground)] hover:border-[var(--core-green)] hover:text-[var(--core-green)]",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
