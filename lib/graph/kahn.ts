export type DagEdge = { from: string; to: string };

export type KahnResult = {
  /** Topological order: every node comes after all of its dependencies. */
  order: string[];
  /**
   * Nodes grouped by Kahn frontier. A node lands in level n when its last
   * dependency was released in level n − 1 (its longest path from a source).
   */
  levels: string[][];
};

/**
 * Kahn's algorithm. Repeatedly releases every node whose in-degree has
 * dropped to zero; ties keep the input order, so the result is stable.
 * Throws on unknown endpoints or a cycle.
 */
export function kahn(ids: readonly string[], edges: readonly DagEdge[]): KahnResult {
  const indegree = new Map(ids.map((id) => [id, 0]));
  const next = new Map(ids.map((id) => [id, [] as string[]]));

  for (const { from, to } of edges) {
    const out = next.get(from);
    const deg = indegree.get(to);
    if (!out || deg === undefined) {
      throw new Error(`Edge ${from} → ${to} references an unknown node`);
    }
    out.push(to);
    indegree.set(to, deg + 1);
  }

  const order: string[] = [];
  const levels: string[][] = [];
  let frontier = ids.filter((id) => indegree.get(id) === 0);

  while (frontier.length > 0) {
    levels.push(frontier);
    const released: string[] = [];
    for (const id of frontier) {
      order.push(id);
      for (const to of next.get(id) ?? []) {
        const remaining = (indegree.get(to) ?? 0) - 1;
        indegree.set(to, remaining);
        if (remaining === 0) released.push(to);
      }
    }
    frontier = released;
  }

  if (order.length !== ids.length) {
    const stuck = ids.filter((id) => !order.includes(id));
    throw new Error(`Cycle detected among: ${stuck.join(", ")}`);
  }

  return { order, levels };
}
