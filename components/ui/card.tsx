import { cn } from "@/lib/utils/format";

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export function Card({ children, className }: CardProps) {
  return (
    <section
      className={cn(
        "rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] backdrop-blur-md",
        className,
      )}
    >
      {children}
    </section>
  );
}
