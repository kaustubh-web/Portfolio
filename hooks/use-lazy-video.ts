"use client";

import { useEffect, useState, type RefObject } from "react";

type LazyVideoOptions = {
  /** Play on its own when visible. False under reduced motion: play only on request. */
  autoplay: boolean;
  /** Pause regardless of visibility (e.g. the card is covered by the next one). */
  hold?: boolean;
  /** How far outside the viewport sources get attached (IntersectionObserver rootMargin). */
  margin?: string;
  /** Fraction of the video that must be on screen for it to play. */
  amount?: number;
};

/** "auto" follows `autoplay`; the toggle switches to an explicit play/pause. */
type Intent = "auto" | "play" | "pause";

/**
 * IntersectionObserver-driven lifecycle for a muted preview video:
 * sources attach once it comes near the viewport (so videos never all load
 * at once), it plays only while visible, and pauses when it scrolls away or
 * is held. A blocked autoplay falls back to an explicit play button.
 */
export function useLazyVideo(
  ref: RefObject<HTMLVideoElement | null>,
  { autoplay, hold = false, margin = "25% 0px", amount = 0.25 }: LazyVideoOptions,
) {
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);
  const [intent, setIntent] = useState<Intent>("auto");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const nearObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setNear(true);
        nearObserver.disconnect();
      },
      { rootMargin: margin },
    );
    const visibleObserver = new IntersectionObserver(
      ([entry]) => setVisible(!!entry && entry.intersectionRatio >= amount),
      { threshold: [0, amount] },
    );

    nearObserver.observe(el);
    visibleObserver.observe(el);
    return () => {
      nearObserver.disconnect();
      visibleObserver.disconnect();
    };
  }, [ref, margin, amount]);

  const wantsPlay = intent === "play" || (intent === "auto" && autoplay);
  // Under reduced motion nothing downloads until the visitor asks for it.
  const attached = near && (autoplay || intent === "play");
  const playing = attached && visible && !hold && wantsPlay;

  useEffect(() => {
    const video = ref.current;
    if (!video || !attached) return;
    if (!playing) {
      video.pause();
      return;
    }
    video.play().catch((error: unknown) => {
      // AbortError just means a pause() won the race; only a policy block sticks.
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        setIntent("pause");
      }
    });
  }, [ref, attached, playing]);

  return {
    /** Render the <source> elements. */
    attached,
    playing,
    /** The visitor's (or the autoplay policy's) choice, independent of visibility. */
    paused: !wantsPlay,
    toggle: () => setIntent(wantsPlay ? "pause" : "play"),
  };
}
