"use client";

import { openTerminal } from "@/lib/events";
import { cn } from "@/lib/utils";

/** Footer "press ~ for a terminal": also clickable, for mouse users. */
export function TerminalHint({ label, className }: { label: string; className?: string }) {
  return (
    <button
      type="button"
      onClick={openTerminal}
      aria-keyshortcuts="~"
      className={cn(
        "-my-3 inline-flex h-11 items-center self-start text-left transition-colors duration-(--dur-instant) hover:text-fg",
        className,
      )}
    >
      {label}
    </button>
  );
}
