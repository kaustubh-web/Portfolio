import type { DagEdge } from "@/lib/graph/kahn";

/** Normalized position: `level` runs along the flow axis, `cross` across it. */
export type LayoutPoint = { level: number; cross: number };

export type DagLayout = {
  nodes: Record<string, LayoutPoint>;
  /** Each edge as a polyline; long edges bend through virtual waypoints. */
  edges: { from: string; to: string; points: LayoutPoint[] }[];
  levelCount: number;
  slotCount: number;
};

/**
 * Layered DAG layout (simplified Sugiyama). Edges that skip levels get a
 * virtual waypoint per skipped level so they route around real nodes; each
 * level is ordered by the barycenter of its neighbours to cut crossings,
 * then centred on the cross axis. Orientation-free: callers map
 * `level`/`cross` onto x/y, so mobile reuses it with the axes swapped.
 */
export function layoutDag(levels: string[][], edges: readonly DagEdge[]): DagLayout {
  const levelOf = new Map<string, number>();
  levels.forEach((ids, l) => ids.forEach((id) => levelOf.set(id, l)));

  const rows = levels.map((ids) => [...ids]);
  const prev = new Map<string, string[]>();
  const next = new Map<string, string[]>();
  const link = (a: string, b: string) => {
    next.set(a, [...(next.get(a) ?? []), b]);
    prev.set(b, [...(prev.get(b) ?? []), a]);
  };

  const chains = edges.map(({ from, to }) => {
    const chain = [from];
    const start = levelOf.get(from) ?? 0;
    const end = levelOf.get(to) ?? 0;
    for (let l = start + 1; l < end; l++) {
      const waypoint = `${from}→${to}@${l}`;
      rows[l].push(waypoint);
      chain.push(waypoint);
    }
    chain.push(to);
    for (let i = 1; i < chain.length; i++) link(chain[i - 1], chain[i]);
    return chain;
  });

  const barycenter = (row: string[], ref: string[], neighbours: Map<string, string[]>) => {
    const index = new Map(ref.map((id, i) => [id, i]));
    const score = new Map(
      row.map((id, i) => {
        const near = (neighbours.get(id) ?? []).map((n) => index.get(n) ?? 0);
        return [id, near.length ? near.reduce((a, b) => a + b, 0) / near.length : i];
      }),
    );
    // Array.prototype.sort is stable, so ties keep content order.
    row.sort((a, b) => (score.get(a) ?? 0) - (score.get(b) ?? 0));
  };

  for (let l = 1; l < rows.length; l++) barycenter(rows[l], rows[l - 1], prev);
  for (let l = rows.length - 2; l >= 0; l--) barycenter(rows[l], rows[l + 1], next);

  const levelCount = rows.length;
  const slotCount = Math.max(...rows.map((row) => row.length));
  const position = new Map<string, LayoutPoint>();
  rows.forEach((row, l) => {
    row.forEach((id, i) => {
      const offset = i - (row.length - 1) / 2;
      position.set(id, {
        level: levelCount > 1 ? l / (levelCount - 1) : 0.5,
        cross: slotCount > 1 ? 0.5 + offset / (slotCount - 1) : 0.5,
      });
    });
  });

  const nodes: Record<string, LayoutPoint> = {};
  levels.flat().forEach((id) => {
    nodes[id] = position.get(id) ?? { level: 0, cross: 0.5 };
  });

  return {
    nodes,
    edges: edges.map(({ from, to }, i) => ({
      from,
      to,
      points: chains[i].map((id) => position.get(id) ?? { level: 0, cross: 0.5 }),
    })),
    levelCount,
    slotCount,
  };
}
