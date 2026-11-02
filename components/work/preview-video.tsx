"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

import type { ResolvedMedia } from "@/lib/media";
import { cn } from "@/lib/utils";
import { useLazyVideo } from "@/hooks/use-lazy-video";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

type PreviewVideoProps = {
  media: ResolvedMedia;
  /** Project name, for the play/pause control's accessible name. */
  name: string;
  index: string;
  slug: string;
  /** Pause regardless of visibility. */
  hold?: boolean;
  /**
   * Load the poster eagerly at low priority: it becomes the LCP element when
   * the page opens scrolled to it (e.g. /#work), but must not compete with the hero.
   */
  eager?: boolean;
  /** next/image `sizes` for the poster. */
  sizes: string;
  className?: string;
  /** Places the play/pause control inside the frame. */
  controlClassName?: string;
};

/**
 * Built from tokens when a project has no poster yet: a 16×9 test-card
 * grid with the index and file name, so the frame reads as intentional.
 */
function TokenPoster({ index, slug }: { index: string; slug: string }) {
  return (
    <div aria-hidden className="media-poster absolute inset-0 flex flex-col items-end justify-between p-4 lg:p-6">
      <span className="label-meta text-fg-subtle">preview · {slug}</span>
      <span className="font-display text-[clamp(5rem,14vw,13rem)] leading-[0.8] text-fg-subtle">
        {index}
      </span>
    </div>
  );
}

/**
 * Muted looping preview in a fixed 16:9 frame (no layout shift). Sources
 * attach near the viewport, play only while visible and fade in over the
 * poster once the first frame plays. Missing or failing files leave the
 * poster in place. Reduced motion: poster + play button, nothing loads
 * until it is pressed.
 */
export function PreviewVideo({
  media,
  name,
  index,
  slug,
  hold = false,
  eager = false,
  sizes,
  className,
  controlClassName,
}: PreviewVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();
  const [failed, setFailed] = useState(false);
  const [started, setStarted] = useState(false);
  const { attached, paused, toggle } = useLazyVideo(videoRef, { autoplay: !reduced, hold });

  const sources = [
    media.webm && { src: media.webm, type: "video/webm" },
    media.mp4 && { src: media.mp4, type: "video/mp4" },
  ].filter((source) => !!source);
  const hasVideo = !failed && sources.length > 0;

  return (
    <div className={cn("relative aspect-video overflow-clip bg-surface-2", className)}>
      {media.poster ? (
        <Image
          src={media.poster}
          alt=""
          fill
          sizes={sizes}
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "low" : undefined}
          className="object-cover"
        />
      ) : (
        <TokenPoster index={index} slug={slug} />
      )}

      {hasVideo && (
        <video
          ref={videoRef}
          aria-hidden
          tabIndex={-1}
          muted
          loop
          playsInline
          disablePictureInPicture
          preload={attached ? "auto" : "none"}
          onPlaying={() => setStarted(true)}
          className={cn(
            "absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-(--dur-base) ease-out",
            started && "opacity-100",
          )}
        >
          {attached &&
            sources.map((source, i) => (
              <source
                key={source.type}
                src={source.src}
                type={source.type}
                // The last source erroring means none could play.
                onError={i === sources.length - 1 ? () => setFailed(true) : undefined}
              />
            ))}
        </video>
      )}

      {hasVideo && (
        <button
          type="button"
          onClick={toggle}
          aria-label={`${paused ? "Play" : "Pause"} ${name} preview`}
          className={cn(
            "label-meta absolute z-2 inline-flex h-11 items-center gap-2 rounded-xs border border-line-strong bg-bg px-3 text-fg transition-colors duration-(--dur-instant) hover:border-fg",
            controlClassName,
          )}
        >
          {paused ? (
            <Play aria-hidden className="size-3 fill-current" />
          ) : (
            <Pause aria-hidden className="size-3 fill-current" />
          )}
          {paused ? "play" : "pause"}
        </button>
      )}
    </div>
  );
}
