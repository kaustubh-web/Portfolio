"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

import type { DiagramNode } from "@/content/site";
import type { DiagramModel } from "@/lib/graph/diagram";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

type Point = [number, number];
type Box = { left: number; top: number; right: number; bottom: number; cx: number; cy: number };
type EdgePath = { d: string; arrow: string; mid: Point };
type Geometry = { width: number; height: number; edges: EdgePath[] };

/** Unreached nodes while the diagram draws. */
const DIM = 0.35;
/** Corner radius of edge elbows, px. */
const RADIUS = 6;

const round = (n: number) => Math.round(n * 10) / 10;
const toward = ([x, y]: Point, [tx, ty]: Point, d: number): Point => {
  const len = Math.hypot(tx - x, ty - y) || 1;
  return [x + ((tx - x) / len) * d, y + ((ty - y) / len) * d];
};
const fmt = (p: Point) => `${round(p[0])},${round(p[1])}`;

/** Orthogonal polyline with rounded elbows. */
function roundedPath(points: Point[]): string {
  let d = `M${fmt(points[0]!)}`;
  for (let i = 1; i < points.length - 1; i++) {
    const [prev, cur, next] = [points[i - 1]!, points[i]!, points[i + 1]!];
    const r = Math.min(
      RADIUS,
      Math.hypot(cur[0] - prev[0], cur[1] - prev[1]) / 2,
      Math.hypot(next[0] - cur[0], next[1] - cur[1]) / 2,
    );
    d += ` L${fmt(toward(cur, prev, r))} Q${fmt(cur)} ${fmt(toward(cur, next, r))}`;
  }
  return `${d} L${fmt(points.at(-1)!)}`;
}

/** Open chevron at the last point, pointing along the last segment. */
function arrowHead(points: Point[]): string {
  const [ex, ey] = points.at(-1)!;
  const [px, py] = points.at(-2)!;
  const len = Math.hypot(ex - px, ey - py) || 1;
  const [ux, uy] = [(ex - px) / len, (ey - py) / len];
  const back: Point = [ex - ux * 6, ey - uy * 6];
  return `M${fmt([back[0] - uy * 4, back[1] + ux * 4])} L${fmt([ex, ey])} L${fmt([back[0] + uy * 4, back[1] - ux * 4])}`;
}

/** Midpoint of the middle segment: where an edge label sits. */
function midpoint(points: Point[]): Point {
  const i = Math.floor((points.length - 2) / 2);
  const [a, b] = [points[i]!, points[i + 1]!];
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
}

/**
 * Route every edge in pixels between the measured node boxes. Wide
 * (layered, left → right): elbows through the gap between levels, return
 * edges along a lane under the whole diagram. Spine (top → bottom): out of
 * the node's left side into its gutter lane, along, and back in.
 */
function route(model: DiagramModel, canvas: HTMLElement): Geometry | null {
  const origin = canvas.getBoundingClientRect();
  const boxes = new Map<string, Box>();
  let wide = false;
  canvas.querySelectorAll<HTMLElement>("[data-arch-node]").forEach((el) => {
    const r = el.getBoundingClientRect();
    const left = r.left - origin.left;
    const top = r.top - origin.top;
    boxes.set(el.dataset.archNode!, {
      left,
      top,
      right: left + r.width,
      bottom: top + r.height,
      cx: left + r.width / 2,
      cy: top + r.height / 2,
    });
    // Mirrors the container query in globals.css (`.arch-node` goes absolute).
    wide = getComputedStyle(el).position === "absolute";
  });
  if (boxes.size === 0) return null;

  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const lanePx = 0.875 * rem;
  const floor = Math.max(...[...boxes.values()].map((b) => b.bottom));
  let backIndex = 0;

  const edges = model.edges.map((edge) => {
    const a = boxes.get(edge.from)!;
    const b = boxes.get(edge.to)!;
    let points: Point[];

    if (!wide) {
      const x = Math.min(a.left, b.left);
      const lane = x - (edge.lane + 1) * lanePx;
      points = [
        [x, a.cy],
        [lane, a.cy],
        [lane, b.cy],
        [x, b.cy],
      ];
    } else if (edge.back) {
      const lane = floor + (1.5 + backIndex++ * 0.75) * rem;
      points = [
        [a.cx, a.bottom],
        [a.cx, lane],
        [b.cx, lane],
        [b.cx, b.bottom],
      ];
    } else if (b.left >= a.right) {
      const mx = (a.right + b.left) / 2;
      points =
        Math.abs(a.cy - b.cy) < 1
          ? [
              [a.right, a.cy],
              [b.left, b.cy],
            ]
          : [
              [a.right, a.cy],
              [mx, a.cy],
              [mx, b.cy],
              [b.left, b.cy],
            ];
    } else {
      points = [
        [a.cx, a.bottom],
        [b.cx, b.top],
      ];
    }

    return { d: roundedPath(points), arrow: arrowHead(points), mid: midpoint(points) };
  });

  return { width: origin.width, height: origin.height, edges };
}

type ArchitectureDiagramProps = {
  nodes: DiagramNode[];
  model: DiagramModel;
  /** Accessible name, e.g. "Forgefort architecture". */
  label: string;
};

/**
 * Architecture diagram whose edges draw as it scrolls through the
 * viewport (GSAP timeline scrubbed by ScrollTrigger): edges leaving each
 * Kahn level draw together, then the nodes they reach light up; return
 * paths draw last, in accent. Layered left → right when its container is
 * at least 40rem wide, a top → bottom spine below that. Nodes are HTML
 * (laid out by CSS, readable without JS); edges are SVG, routed in measured
 * pixels. Reduced motion and no-JS: the finished diagram, static.
 */
export function ArchitectureDiagram({ nodes, model, label }: ArchitectureDiagramProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [geometry, setGeometry] = useState<Geometry | null>(null);
  const byId = new Map(nodes.map((n) => [n.id, n]));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setGeometry(route(model, canvas)));
    };
    // Fires once on observe, then on every size change (fonts, viewport).
    const observer = new ResizeObserver(measure);
    observer.observe(canvas);
    document.fonts?.ready.then(measure);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [model]);

  useGSAP(
    () => {
      const canvas = canvasRef.current;
      if (reduced || !geometry || !canvas) return;

      const q = gsap.utils.selector(canvas);
      const lit = new Set(model.order.filter((id) => !model.edges.some((e) => !e.back && e.to === id)));
      const tl = gsap.timeline({ defaults: { ease: "none" } });

      model.order.forEach((id) => {
        if (lit.has(id)) return;
        tl.set(q(`[data-arch-node="${id}"]`), { opacity: DIM }, 0);
        tl.set(q(`[data-arch-node="${id}"] [data-arch-marker]`), { opacity: 0 }, 0);
      });

      model.edges.forEach((edge, i) => {
        tl.fromTo(q(`[data-arch-edge="${i}"]`), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1 }, edge.step);
        tl.fromTo(q(`[data-arch-tip="${i}"]`), { opacity: 0 }, { opacity: 1, duration: 0.2 }, edge.step + 0.8);
        if (lit.has(edge.to)) return;
        lit.add(edge.to);
        tl.to(q(`[data-arch-node="${edge.to}"]`), { opacity: 1, duration: 0.3 }, edge.step + 0.75);
        tl.to(q(`[data-arch-node="${edge.to}"] [data-arch-marker]`), { opacity: 1, duration: 0.3 }, edge.step + 0.75);
      });

      ScrollTrigger.create({
        trigger: canvas,
        // Finishes while the whole diagram is still on screen, phones included.
        start: "top 80%",
        end: "bottom 65%",
        scrub: true,
        animation: tl,
      });
    },
    { dependencies: [geometry, reduced, model], scope: canvasRef, revertOnUpdate: true },
  );

  return (
    <figure
      className="arch"
      data-back={model.hasBack ? "" : undefined}
      style={
        {
          "--arch-levels": model.levelCount,
          "--arch-slots": model.slotCount,
          "--arch-lanes": model.lanes,
        } as CSSProperties
      }
    >
      <div ref={canvasRef} className="arch-canvas">
        <svg
          aria-hidden
          width={geometry?.width}
          height={geometry?.height}
          viewBox={geometry ? `0 0 ${round(geometry.width)} ${round(geometry.height)}` : undefined}
          className="pointer-events-none absolute inset-0 overflow-visible"
        >
          {geometry?.edges.map((path, i) => {
            const back = model.edges[i]?.back;
            return (
              <g key={i} className={back ? "arch-edge-back" : undefined}>
                <path data-arch-edge={i} d={path.d} pathLength={1} className="arch-edge" />
                <path data-arch-tip={i} d={path.arrow} className="arch-edge-tip" />
              </g>
            );
          })}
        </svg>

        <ol aria-label={`${label}: components`} className="arch-nodes">
          {model.order.map((id) => {
            const node = byId.get(id);
            const point = model.layout[id];
            if (!node || !point) return null;
            return (
              <li
                key={id}
                data-arch-node={id}
                className="arch-node"
                style={{ "--lv": point.level, "--cr": point.cross } as CSSProperties}
              >
                <span aria-hidden className="relative mt-1.5 size-2.5 shrink-0 bg-line-strong">
                  <span data-arch-marker className="absolute inset-0 bg-accent" />
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="font-mono text-sm text-fg">{node.label}</span>
                  {node.detail && (
                    <span className="line-clamp-2 text-sm text-fg-muted">{node.detail}</span>
                  )}
                </span>
              </li>
            );
          })}
        </ol>

        {geometry?.edges.map((path, i) => {
          const text = model.edges[i]?.label;
          if (!text) return null;
          return (
            <span
              key={i}
              aria-hidden
              data-arch-tip={i}
              className="label-meta absolute -translate-1/2 bg-bg px-1.5 text-accent-ink"
              style={{ left: path.mid[0], top: path.mid[1] }}
            >
              {text}
            </span>
          );
        })}
      </div>

      <figcaption className="sr-only">
        {label}. Connections:{" "}
        {model.edges
          .map((e) => {
            const from = byId.get(e.from)?.label ?? e.from;
            const to = byId.get(e.to)?.label ?? e.to;
            return `${from} to ${to}${e.label ? ` (${e.label})` : ""}${e.back ? ", return path" : ""}`;
          })
          .join("; ")}
        .
      </figcaption>
    </figure>
  );
}
