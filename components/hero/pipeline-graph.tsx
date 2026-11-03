"use client";

import {
  useEffect,
  useEffectEvent,
  useId,
  useMemo,
  useReducer,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import type { GraphEdge, GraphNode } from "@/content/site";
import { cn } from "@/lib/utils";
import { graphRun } from "@/lib/motion";
import { kahn } from "@/lib/graph/kahn";
import { layoutDag, type DagLayout, type LayoutPoint } from "@/lib/graph/layout";
import { formatRunTime, scheduleRun } from "@/lib/graph/schedule";
import { useBoot } from "@/hooks/use-boot";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/* ------------------------------------------------------------------ *
 * Model: Kahn order → layout → dataflow schedule (all pure, lib/graph)
 * ------------------------------------------------------------------ */

type Status = "queued" | "running" | "done";
type Phase = "queued" | "running" | "done";

type LogLine =
  | { kind: "start"; time: number }
  | { kind: "node"; id: string; time: number; status: Status }
  | { kind: "end"; time: number };

type RunState = {
  run: number;
  phase: Phase;
  status: Record<string, Status>;
  filled: boolean[];
  log: LogLine[];
};

type Action =
  | { type: "set"; state: RunState }
  | { type: "node"; id: string; status: Status; time: number; fill?: number[] }
  | { type: "finish"; time: number };

function buildModel(nodes: GraphNode[], edges: GraphEdge[]) {
  const { order, levels } = kahn(
    nodes.map((n) => n.id),
    edges,
  );
  return {
    order,
    levels,
    layout: layoutDag(levels, edges),
    schedule: scheduleRun(order, edges, graphRun),
  };
}

type Model = ReturnType<typeof buildModel>;

const statusOf = (model: Model, status: Status) =>
  Object.fromEntries(model.order.map((id) => [id, status]));

function idleState(model: Model, run: number, phase: Phase): RunState {
  return {
    run,
    phase,
    status: statusOf(model, "queued"),
    filled: model.layout.edges.map(() => false),
    log: phase === "running" ? [{ kind: "start", time: 0 }] : [],
  };
}

/** The finished run, all at once: reduced motion and the end of every run. */
function completedState(model: Model, run: number): RunState {
  const { nodes, total } = model.schedule;
  return {
    run,
    phase: "done",
    status: statusOf(model, "done"),
    filled: model.layout.edges.map(() => true),
    log: [
      { kind: "start", time: 0 },
      ...model.order.map((id) => ({
        kind: "node" as const,
        id,
        time: nodes[id].end,
        status: "done" as const,
      })),
      { kind: "end", time: total },
    ],
  };
}

function reducer(state: RunState, action: Action): RunState {
  switch (action.type) {
    case "set":
      return action.state;
    case "node": {
      const line: LogLine = { kind: "node", id: action.id, time: action.time, status: action.status };
      const at = state.log.findIndex((l) => l.kind === "node" && l.id === action.id);
      const fill = action.fill ?? [];
      return {
        ...state,
        status: { ...state.status, [action.id]: action.status },
        // One line per node: appended as "running", rewritten as "✓".
        log: at === -1 ? [...state.log, line] : state.log.map((l, i) => (i === at ? line : l)),
        filled: state.filled.map((f, i) => f || fill.includes(i)),
      };
    }
    case "finish":
      return { ...state, phase: "done", log: [...state.log, { kind: "end", time: action.time }] };
  }
}

/* ------------------------------------------------------------------ *
 * Edges: one SVG per orientation; a container query shows the right one
 * ------------------------------------------------------------------ */

type Axis = "x" | "y";
type Size = { w: number; h: number };

/** Server/first-paint sizes, close to the real boxes so nothing jumps. */
const FALLBACK: Record<Axis, Size> = { x: { w: 440, h: 148 }, y: { w: 220, h: 320 } };

const round = (n: number) => Math.round(n * 10) / 10;

function toXY(p: LayoutPoint, axis: Axis, { w, h }: Size): [number, number] {
  return axis === "x"
    ? [round(p.level * w), round(p.cross * h)]
    : [round(p.cross * w), round(p.level * h)];
}

/** Cubic segments with tangents along the flow axis, through each waypoint. */
function edgePath(points: LayoutPoint[], axis: Axis, size: Size): string {
  const xy = points.map((p) => toXY(p, axis, size));
  let d = `M${xy[0][0]} ${xy[0][1]}`;
  for (let i = 1; i < xy.length; i++) {
    const [x1, y1] = xy[i - 1];
    const [x2, y2] = xy[i];
    if (axis === "x") {
      const mx = round((x1 + x2) / 2);
      d += `C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`;
    } else {
      const my = round((y1 + y2) / 2);
      d += `C${x1} ${my} ${x2} ${my} ${x2} ${y2}`;
    }
  }
  return d;
}

type EdgesProps = {
  layout: DagLayout;
  axis: Axis;
  state: RunState;
  className?: string;
};

function Edges({ layout, axis, state, className }: EdgesProps) {
  const ref = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState(FALLBACK[axis]);

  // Draw in real pixels once measured; a hidden orientation reports 0 and is skipped.
  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setSize({ w: width, h: height });
    });
    observer.observe(svg);
    return () => observer.disconnect();
  }, []);

  const running = state.phase === "running";

  return (
    <svg
      ref={ref}
      aria-hidden
      viewBox={`0 0 ${size.w} ${size.h}`}
      preserveAspectRatio="none"
      className={cn("absolute inset-0 size-full overflow-visible", className)}
    >
      {layout.edges.map((edge, i) => {
        const d = edgePath(edge.points, axis, size);
        const filled = state.filled[i];
        return (
          <g key={`${edge.from}-${edge.to}`} fill="none">
            <path d={d} className="stroke-line-strong" vectorEffect="non-scaling-stroke" />
            <path
              d={d}
              pathLength={1}
              data-filled={filled || undefined}
              className={cn("edge-fill", state.phase === "done" ? "stroke-fg-muted" : "stroke-accent")}
            />
            {/* Data in flight: pulses until the downstream node completes. */}
            {running && filled && state.status[edge.to] !== "done" && (
              <path d={d} pathLength={1} className="edge-pulse stroke-accent" />
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 * Component
 * ------------------------------------------------------------------ */

const glyph: Record<Status, string> = { queued: "○", running: "→", done: "✓" };

const markerClass: Record<Status, string> = {
  queued: "border-fg-subtle bg-surface",
  running: "border-accent bg-accent",
  done: "border-fg-muted bg-fg-muted",
};

const labelClass: Record<Status, string> = {
  queued: "text-fg-muted",
  running: "text-accent-ink",
  done: "text-fg",
};

const glyphClass: Record<Status, string> = {
  queued: "text-fg-subtle",
  running: "text-accent-ink",
  done: "text-fg-muted",
};

type PipelineGraphProps = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  className?: string;
};

/**
 * The hero's "running system": a DAG executed in Kahn order. Nodes light up
 * as their dependencies deliver, edges fill and pulse while data is in
 * flight, and the log streams one line per node. Re-runnable.
 * Reduced motion: the completed run, static.
 */
export function PipelineGraph({ nodes, edges, className }: PipelineGraphProps) {
  const model = useMemo(() => buildModel(nodes, edges), [nodes, edges]);
  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const reduced = useReducedMotion();
  const boot = useBoot();
  const [state, dispatch] = useReducer(reducer, undefined, () => idleState(model, 1, "queued"));
  const [openId, setOpenId] = useState<string | null>(null);
  const timers = useRef(new Set<number>());
  const phase = useRef<Phase>("queued");
  const logRef = useRef<HTMLOListElement>(null);
  const captionId = useId();

  const view = reduced && state.phase !== "done" ? completedState(model, state.run) : state;

  const start = (run: number) => {
    const pending = timers.current;
    pending.forEach((t) => window.clearTimeout(t));
    pending.clear();
    phase.current = "running";
    dispatch({ type: "set", state: idleState(model, run, "running") });

    const at = (ms: number, fn: () => void) => pending.add(window.setTimeout(fn, ms));
    const { nodes: timing, outEdges, total } = model.schedule;
    for (const id of model.order) {
      const { start: begin, end } = timing[id];
      at(begin, () => dispatch({ type: "node", id, status: "running", time: begin }));
      at(end, () => dispatch({ type: "node", id, status: "done", time: end, fill: outEdges[id] }));
    }
    at(total, () => {
      phase.current = "done";
      dispatch({ type: "finish", time: total });
    });
  };

  const autoStart = useEffectEvent(() => start(state.run));

  // First run waits for the hero timeline (boot t0 + 600ms). A run cut short
  // by a hidden <Activity> restarts when the page is shown again.
  useEffect(() => {
    if (reduced || boot.phase === "pending" || phase.current === "done") return;
    const pending = timers.current;
    const delay =
      phase.current === "queued"
        ? Math.max(0, boot.heroStart + graphRun.delayMs - performance.now())
        : 0;
    const timer = window.setTimeout(autoStart, delay);
    return () => {
      window.clearTimeout(timer);
      pending.forEach((t) => window.clearTimeout(t));
      pending.clear();
    };
  }, [reduced, boot.phase, boot.heroStart]);

  // Keep the newest line in view.
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [view.log.length]);

  const rerun = () => {
    const run = state.run + 1;
    if (reduced) {
      phase.current = "done";
      dispatch({ type: "set", state: completedState(model, run) });
    } else {
      start(run);
    }
  };

  const total = model.order.length;
  const seconds = (model.schedule.total / 1000).toFixed(2);

  return (
    <figure
      aria-labelledby={captionId}
      className={cn("@container/graph border border-line bg-surface", className)}
    >
      <figcaption id={captionId} className="sr-only">
        Build pipeline executed in topological order (Kahn&apos;s algorithm):{" "}
        {model.order.join(", ")}.
      </figcaption>

      <div className="flex h-11 items-center justify-between gap-4 border-b border-line px-4 font-mono text-meta">
        <span>
          run #{view.run}{" "}
          <span className={view.phase === "running" ? "text-accent-ink" : "text-fg-muted"}>
            · {view.phase === "done" ? `ok · ${seconds}s` : view.phase}
          </span>
        </span>
        <span className="text-fg-muted">{total} nodes</span>
      </div>

      {/* Graph. <30rem container: levels top→bottom; wider: left→right. */}
      <div className="relative h-[22rem] @min-[30rem]/graph:h-52">
        <div className="absolute inset-y-4 right-24 left-6 @min-[30rem]/graph:inset-x-10 @min-[30rem]/graph:top-5 @min-[30rem]/graph:bottom-10">
          <Edges layout={model.layout} axis="y" state={view} className="@min-[30rem]/graph:hidden" />
          <Edges layout={model.layout} axis="x" state={view} className="hidden @min-[30rem]/graph:block" />

          {model.order.map((id) => {
            const node = byId.get(id);
            const point = model.layout.nodes[id];
            const status = view.status[id];
            if (!node || !point) return null;
            return (
              <Tooltip
                key={id}
                open={openId === id}
                onOpenChange={(open) =>
                  setOpenId((current) => (open ? id : current === id ? null : current))
                }
              >
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label={`${node.label}: ${status}`}
                    // Touch has no hover: a tap opens the tooltip.
                    onClick={(event) => {
                      event.preventDefault();
                      setOpenId(id);
                    }}
                    style={{ "--lv": point.level, "--cr": point.cross } as CSSProperties}
                    className="absolute top-[calc(var(--lv)*100%)] left-[calc(var(--cr)*100%)] flex size-11 -translate-1/2 items-center justify-center @min-[30rem]/graph:top-[calc(var(--cr)*100%)] @min-[30rem]/graph:left-[calc(var(--lv)*100%)]"
                  >
                    <span
                      className={cn(
                        "relative size-2.5 border transition-colors duration-(--dur-fast)",
                        markerClass[status],
                      )}
                    >
                      {status === "running" && (
                        <span aria-hidden className="node-pulse absolute -inset-px bg-accent" />
                      )}
                    </span>
                    <span
                      className={cn(
                        "absolute top-1/2 left-[calc(50%+0.875rem)] -translate-y-1/2 font-mono text-[0.6875rem] leading-none whitespace-nowrap transition-colors duration-(--dur-fast)",
                        "@min-[30rem]/graph:top-[calc(50%+0.75rem)] @min-[30rem]/graph:left-1/2 @min-[30rem]/graph:-translate-x-1/2 @min-[30rem]/graph:translate-y-0",
                        labelClass[status],
                      )}
                    >
                      <span className={glyphClass[status]}>{glyph[status]}</span> {node.label}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={2} className="max-w-60 flex-col items-start gap-1 font-mono">
                  <span className="uppercase tracking-[0.08em]">
                    node:{node.label} · {status}
                  </span>
                  <span className="font-sans">{node.tooltip}</span>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>

      <div className="flex h-9 items-center justify-between border-y border-line px-4 font-mono text-meta text-fg-muted">
        <span>log</span>
        <span className="tabular-nums">
          {view.log.filter((l) => l.kind === "node" && l.status === "done").length}/{total}
        </span>
      </div>

      <ol
        ref={logRef}
        tabIndex={0}
        aria-label="Run log"
        data-lenis-prevent
        // Exactly 3 (narrow) or 5 lines tall, spacing outside the scroller, so no line is ever cut.
        className="my-2 h-15 overflow-y-auto px-4 font-mono text-[0.75rem] leading-5 tabular-nums @min-[30rem]/graph:h-25"
      >
        {view.log.length === 0 && (
          <li className="whitespace-nowrap text-fg-muted">
            [--:--.--] run #{view.run} queued · {total} nodes
          </li>
        )}
        {view.log.map((line) => (
          <li
            key={line.kind === "node" ? line.id : line.kind}
            className="flex gap-3 whitespace-nowrap"
          >
            <span className="text-fg-muted">[{formatRunTime(line.time)}]</span>
            {line.kind === "start" && <span className="text-fg-muted">run #{view.run} started</span>}
            {line.kind === "node" && (
              <span>
                node:{byId.get(line.id)?.label ?? line.id}{" "}
                {line.status === "done" ? (
                  <span className="text-fg-muted">✓</span>
                ) : (
                  <span className="text-accent-ink">→ running</span>
                )}
              </span>
            )}
            {line.kind === "end" && (
              <span>
                run #{view.run} ok · {total}/{total} nodes
              </span>
            )}
          </li>
        ))}
      </ol>

      <div className="flex h-11 items-center justify-between border-t border-line pl-4 font-mono text-meta text-fg-muted">
        <span>kahn · {model.levels.length} levels</span>
        <button
          type="button"
          onClick={rerun}
          aria-label="Re-run the pipeline"
          className="inline-flex h-11 items-center gap-2 px-4 transition-colors duration-(--dur-instant) hover:text-fg"
        >
          <span aria-hidden>↻</span> re-run
        </button>
      </div>
    </figure>
  );
}
