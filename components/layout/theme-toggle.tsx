"use client";

import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";

/** Half-filled disc; flips 180° in light mode via CSS, so no hydration mismatch. */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      aria-label="Toggle color theme"
      onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
      className={cn(
        "inline-flex size-11 items-center justify-center text-fg-muted transition-colors duration-(--dur-instant) hover:text-fg",
        className,
      )}
    >
      <svg
        viewBox="0 0 16 16"
        aria-hidden
        className="size-4 transition-transform duration-(--dur-base) ease-out light:rotate-180"
      >
        <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.25" />
        <path d="M8 1.5a6.5 6.5 0 0 1 0 13z" fill="currentColor" />
      </svg>
    </button>
  );
}
