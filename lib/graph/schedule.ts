import type { DagEdge } from "@/lib/graph/kahn";

export type Timing = { start: number; end: number };

export type RunSchedule = {
  nodes: Record<string, Timing>;
  /** Index-aligned with the input edges: when each edge carries data. */
  edges: Timing[];
  /** Out-edge indexes per node, filled when the node completes. */
  outEdges: Record<string, number[]>;
  total: number;
};

/**
 * Dataflow timing for a run, walked in Kahn order: a node starts once every
 * incoming edge has delivered, runs for `nodeMs`, then each out-edge takes
 * `edgeMs`. Times are in ms from the start of the run.
 */
export function scheduleRun(
  order: readonly string[],
  edges: readonly DagEdge[],
  { nodeMs, edgeMs }: { nodeMs: number; edgeMs: number },
): RunSchedule {
  const nodes: Record<string, Timing> = {};
  const timings: Timing[] = edges.map(() => ({ start: 0, end: 0 }));
  const outEdges: Record<string, number[]> = {};
  order.forEach((id) => (outEdges[id] = []));
  edges.forEach(({ from }, i) => outEdges[from]?.push(i));

  for (const id of order) {
    const start = Math.max(
      0,
      ...edges.flatMap((edge, i) => (edge.to === id ? [timings[i].end] : [])),
    );
    const end = start + nodeMs;
    nodes[id] = { start, end };
    for (const i of outEdges[id]) timings[i] = { start: end, end: end + edgeMs };
  }

  const total = Math.max(0, ...Object.values(nodes).map((t) => t.end));
  return { nodes, edges: timings, outEdges, total };
}

/** 2180 → "00:02.18" (mm:ss.cc), the log's timestamp format. */
export function formatRunTime(ms: number): string {
  const centis = Math.round(ms / 10);
  const minutes = Math.floor(centis / 6000);
  const seconds = Math.floor(centis / 100) % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(minutes)}:${pad(seconds)}.${pad(centis % 100)}`;
}
