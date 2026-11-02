import { cn } from "@/lib/utils";

const COLUMNS = 12;

/** Hairlines on every column edge of the 4 / 8 / 12-col grid. Decorative. */
export function GridOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-(--z-grid) print:hidden"
    >
      <div className="container-site grid-site h-full">
        {Array.from({ length: COLUMNS }, (_, i) => (
          <div
            key={i}
            className={cn(
              "h-full border-x border-grid-line",
              i >= 4 && "hidden md:block",
              i >= 8 && "md:hidden lg:block",
            )}
          />
        ))}
      </div>
    </div>
  );
}

/** Static tiled film grain. Never animates. */
export function GrainOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-(--z-grain) bg-[url(/grain.png)] bg-repeat opacity-(--grain-opacity) print:hidden"
    />
  );
}
