"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useSpring } from "motion/react";

import { isPlaceholder, type ArchiveEntry } from "@/content/site";
import { cn } from "@/lib/utils";
import { duration, ease, spring } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useFinePointer } from "@/hooks/use-fine-pointer";

const pad = (n: number) => String(n).padStart(2, "0");

/** Gap between the cursor and the preview, in px. */
const OFFSET = 24;

/** A content value, or the visible placeholder marker when it's unknown. */
function Value({ text, className }: { text: string; className?: string }) {
  if (isPlaceholder(text)) {
    return <span className="font-mono text-sm text-fg-muted">[[PLACEHOLDER]]</span>;
  }
  return <span className={className}>{text}</span>;
}

type PreviewProps = {
  entries: ArchiveEntry[];
  previews: (string | undefined)[];
  hovered: number | null;
  x: ReturnType<typeof useSpring>;
  y: ReturnType<typeof useSpring>;
  frameRef: React.Ref<HTMLDivElement>;
};

/**
 * The cursor-follow frame: one layer per entry, stacked, the hovered one
 * shown. A missing image renders a tokened poster (index + name).
 */
function Preview({ entries, previews, hovered, x, y, frameRef }: PreviewProps) {
  const shown = hovered !== null;
  return (
    <motion.div
      ref={frameRef}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-2 aspect-[4/3] w-64 overflow-clip rounded-lg border border-line-strong bg-surface-2 xl:w-72"
      style={{ x, y }}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: shown ? 1 : 0, scale: shown ? 1 : 0.92 }}
      transition={{ duration: duration.fast, ease: ease.out }}
    >
      {entries.map((entry, i) => (
        <div
          key={entry.name}
          className={cn(
            "absolute inset-0 opacity-0 transition-opacity duration-(--dur-fast)",
            hovered === i && "opacity-100",
          )}
        >
          {previews[i] ? (
            <Image src={previews[i]} alt="" fill sizes="18rem" className="object-cover" />
          ) : (
            <div className="media-poster absolute inset-0 flex flex-col justify-between p-4">
              <span className="label-meta text-fg-subtle">preview · {pad(i + 1)}</span>
              <span className="font-display text-display-m text-fg-muted">{entry.name}</span>
            </div>
          )}
        </div>
      ))}
    </motion.div>
  );
}

type ArchiveListProps = {
  entries: ArchiveEntry[];
  /** Per entry: the preview's path when the file exists, else undefined. */
  previews: (string | undefined)[];
};

/**
 * year · name · stack · link rows. With a fine pointer and motion allowed,
 * hovering a row shows its preview, which follows the cursor on a spring.
 * Rows with a placeholder href render unlinked.
 */
export function ArchiveList({ entries, previews }: ArchiveListProps) {
  const reduced = useReducedMotion();
  const finePointer = useFinePointer();
  const active = finePointer && !reduced;

  const [hovered, setHovered] = useState<number | null>(null);
  // Preview layers mount on the first hover, so images never load unasked.
  const [armed, setArmed] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const x = useSpring(0, spring.preview);
  const y = useSpring(0, spring.preview);

  const follow = (event: React.PointerEvent, jump: boolean) => {
    const frame = frameRef.current;
    const w = frame?.offsetWidth ?? 0;
    const h = frame?.offsetHeight ?? 0;
    const { clientX, clientY } = event;
    // Right of the cursor, flipped left near the edge; vertically centred, kept on screen.
    const nextX =
      clientX + OFFSET + w > window.innerWidth ? clientX - OFFSET - w : clientX + OFFSET;
    const nextY = Math.min(Math.max(clientY - h / 2, OFFSET), window.innerHeight - h - OFFSET);
    if (jump) {
      x.jump(nextX);
      y.jump(nextY);
    } else {
      x.set(nextX);
      y.set(nextY);
    }
  };

  const pointerProps = active
    ? {
        onPointerEnter: (event: React.PointerEvent) => {
          setArmed(true);
          follow(event, true);
        },
        onPointerMove: (event: React.PointerEvent) => follow(event, hovered === null),
        onPointerLeave: () => setHovered(null),
      }
    : {};

  return (
    <>
      <ul className="border-t border-line" {...pointerProps}>
        {entries.map((entry, i) => {
          const linked = !isPlaceholder(entry.href);
          return (
            <li
              key={entry.name}
              onPointerEnter={active ? () => setHovered(i) : undefined}
              className="group relative grid-site gap-y-2 border-b border-line py-5 lg:py-6"
            >
              <p className="label-meta col-span-3 self-center text-fg-muted md:col-span-2">
                <Value text={entry.year} />
              </p>

              <h3 className="col-span-full row-start-2 text-h3 md:col-span-3 md:col-start-3 md:row-start-1 lg:col-span-5 lg:col-start-3">
                {linked ? (
                  <a
                    href={entry.href}
                    target="_blank"
                    rel="noopener"
                    data-cursor="open"
                    className="after:absolute after:inset-0 after:content-['']"
                  >
                    <span className="inline-block transition-transform duration-(--dur-base) ease-out group-hover:translate-x-2">
                      {entry.name}
                    </span>
                  </a>
                ) : (
                  <span className="inline-block transition-transform duration-(--dur-base) ease-out group-hover:translate-x-2">
                    {entry.name}
                  </span>
                )}
              </h3>

              <p className="col-span-full row-start-3 text-sm text-fg-muted md:col-span-2 md:col-start-6 md:row-start-1 md:self-center lg:col-span-4 lg:col-start-8">
                <Value text={entry.stack} />
              </p>

              <p
                aria-hidden
                className={cn(
                  "col-span-1 col-start-4 row-start-1 self-center text-right font-mono md:col-start-8 lg:col-start-12",
                  linked
                    ? "text-fg-muted transition-colors duration-(--dur-instant) group-hover:text-accent-ink"
                    : "text-fg-subtle",
                )}
              >
                {linked ? "↗" : "—"}
              </p>
            </li>
          );
        })}
      </ul>

      {active && armed && (
        <Preview
          entries={entries}
          previews={previews}
          hovered={hovered}
          x={x}
          y={y}
          frameRef={frameRef}
        />
      )}
    </>
  );
}
