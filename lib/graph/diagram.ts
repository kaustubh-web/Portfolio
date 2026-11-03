import type { DiagramEdge, DiagramNode } from "@/content/site";
import { kahn } from "@/lib/graph/kahn";
import { layoutDag, type LayoutPoint } from "@/lib/graph/layout";

export type DiagramModelEdge = DiagramEdge & {
  /** Timeline step the edge draws in: its source's Kahn level; return edges come last. */
  step: number;
  /** Phone spine: gutter lane, 0 nearest the nodes. */
  lane: number;
};

export type DiagramModel = {
  /** Topological order of the forward flow: the phone spine, top to bottom. */
  order: string[];
  /** Wide layout: layered positions (level along x, cross along y), 0–1. */
  layout: Record<string, LayoutPoint>;
  levelCount: number;
  slotCount: number;
  edges: DiagramModelEdge[];
  steps: number;
  lanes: number;
  hasBack: boolean;
};

/**
 * Architecture diagram model, pure and server-safe. The forward flow goes
 * through Kahn's algorithm and the hero's layered layout; `back` edges
 * (return paths such as an SSE stream) stay out of the sort so the graph
 * remains a DAG, and are routed around it instead. For the phone spine,
 * each edge gets a gutter lane: overlapping spans take separate lanes,
 * except edges leaving the same node, which share theirs like a bus.
 */
export function buildDiagram(nodes: DiagramNode[], edges: DiagramEdge[]): DiagramModel {
  const forward = edges.filter((e) => !e.back);
  const { order, levels } = kahn(
    nodes.map((n) => n.id),
    forward,
  );
  const { nodes: layout, levelCount, slotCount } = layoutDag(levels, forward);

  const levelOf = new Map<string, number>();
  levels.forEach((ids, l) => ids.forEach((id) => levelOf.set(id, l)));
  const row = new Map(order.map((id, i) => [id, i]));
  const span = (e: DiagramEdge) => {
    const a = row.get(e.from) ?? 0;
    const b = row.get(e.to) ?? 0;
    return [Math.min(a, b), Math.max(a, b)] as const;
  };

  const lastLevel = Math.max(0, levels.length - 2);
  const stepped = edges.map((e) => ({
    ...e,
    step: e.back ? lastLevel + 1 : (levelOf.get(e.from) ?? 0),
    lane: 0,
  }));

  // Greedy interval colouring, shortest spans first (they hug the nodes).
  const placed: { lane: number; from: string; lo: number; hi: number }[] = [];
  [...stepped]
    .sort((a, b) => {
      const [al, ah] = span(a);
      const [bl, bh] = span(b);
      return ah - al - (bh - bl);
    })
    .forEach((edge) => {
      const [lo, hi] = span(edge);
      let lane = 0;
      // Touching spans conflict too, or two edges would read as one line.
      while (
        placed.some((p) => p.lane === lane && p.from !== edge.from && lo <= p.hi && p.lo <= hi)
      ) {
        lane++;
      }
      edge.lane = lane;
      placed.push({ lane, from: edge.from, lo, hi });
    });

  stepped.sort((a, b) => a.step - b.step || (row.get(a.to) ?? 0) - (row.get(b.to) ?? 0));

  return {
    order,
    layout,
    levelCount,
    slotCount,
    edges: stepped,
    steps: Math.max(0, ...stepped.map((e) => e.step)) + 1,
    lanes: Math.max(0, ...stepped.map((e) => e.lane)) + 1,
    hasBack: stepped.some((e) => e.back),
  };
}
