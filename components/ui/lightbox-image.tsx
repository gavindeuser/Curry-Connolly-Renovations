"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils/format";

type LightboxImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  imageClassName?: string;
  sizes?: string;
  expandedContainerClassName?: string;
  expandedImageClassName?: string;
};

export function LightboxImage({
  src,
  alt,
  width,
  height,
  className,
  imageClassName,
  sizes = "100vw",
  expandedContainerClassName,
  expandedImageClassName,
}: LightboxImageProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          "group relative block w-full overflow-hidden rounded-[1.25rem] border border-[var(--border)] bg-white text-left transition hover:shadow-[0_18px_42px_rgba(0,0,0,0.12)]",
          className,
        )}
      >
        <Image src={src} alt={alt} width={width} height={height} sizes={sizes} className={cn("h-auto w-full", imageClassName)} />
        <span className="pointer-events-none absolute inset-x-3 bottom-3 rounded-full bg-black/75 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white opacity-0 transition group-hover:opacity-100">
          Click to enlarge
        </span>
      </button>
      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/82 p-4 sm:p-6"
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={alt}
        >
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="absolute right-4 top-4 rounded-full border border-white/20 bg-black/30 px-3 py-2 text-sm font-semibold text-white transition hover:bg-black/50"
          >
            Close
          </button>
          <div
            className={cn("max-h-[90vh] w-full max-w-6xl", expandedContainerClassName)}
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={src}
              alt={alt}
              width={width}
              height={height}
              sizes="90vw"
              className={cn("max-h-[90vh] w-full rounded-[1.5rem] object-contain", expandedImageClassName)}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
