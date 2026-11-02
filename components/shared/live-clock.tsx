"use client";

import { useSyncExternalStore } from "react";

import { site } from "@/content/site";
import { cn } from "@/lib/utils";

const { timezone } = site.profile;
const formatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: timezone.iana,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

/* One shared ticker aligned to the second; runs only while subscribed. */
let current = "";
let timer = 0;
const listeners = new Set<() => void>();

function tick() {
  current = formatter.format(new Date());
  listeners.forEach((notify) => notify());
  timer = window.setTimeout(tick, 1000 - (Date.now() % 1000));
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  if (listeners.size === 1) tick();
  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0) window.clearTimeout(timer);
  };
}

const snapshot = () => current || (current = formatter.format(new Date()));

type LiveClockProps = {
  className?: string;
  /** Show seconds from this breakpoint up ("always" by default). */
  seconds?: "always" | "lg";
};

/** `IST 17:16:04`. Renders `--:--` on the server; digits are tabular, so nothing shifts. */
export function LiveClock({ className, seconds = "always" }: LiveClockProps) {
  const time = useSyncExternalStore(subscribe, snapshot, () => "--:--:--");
  const [hh, mm, ss] = time.split(":");

  return (
    <span className={cn("tabular-nums", className)}>
      {timezone.label} {hh}:{mm}
      <span className={cn(seconds === "lg" && "max-lg:hidden")}>:{ss}</span>
    </span>
  );
}
