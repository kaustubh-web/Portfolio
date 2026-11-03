/**
 * Single source of truth for every word, link and asset path on the site.
 * Components read from here; adding a project means appending to `projects`.
 * Unknown values are the literal string "[[PLACEHOLDER]]" (grep for it).
 */

/* ------------------------------------------------------------------ *
 * Schema
 * ------------------------------------------------------------------ */

export type ExternalLink = {
  label: string;
  href: string;
};

export type Profile = {
  name: string;
  /** Hero renders these as two lines. */
  nameLines: [string, string];
  initials: string;
  domain: string;
  role: string;
  roleLine: string;
  email: string;
  location: string;
  timezone: { iana: string; label: string };
  status: { available: boolean; label: string; short: string };
  resume: { href: string; route: string };
};

export type SectionId =
  | "index"
  | "stack"
  | "work"
  | "principles"
  | "archive"
  | "education"
  | "now"
  | "contact";

export type Section = {
  id: SectionId;
  /** Two-digit index shown in labels, e.g. "01". Null for unnumbered bands. */
  index: string | null;
  label: string;
  title: string;
  /** Explicit line breaks for the title's masked reveal; defaults to one line. */
  titleLines?: string[];
  /** Shown in the navbar. */
  nav: boolean;
};

export type GraphNode = {
  id: string;
  label: string;
  tooltip: string;
};

export type GraphEdge = { from: string; to: string };

export type Snippet = {
  file: string;
  lang: "ts" | "js" | "py" | "json" | "bash";
  code: string;
  /** 1-based line numbers to highlight. */
  highlight: number[];
  caption: string;
};

export type DiagramNode = { id: string; label: string; detail?: string };
export type DiagramEdge = {
  from: string;
  to: string;
  label?: string;
  /** A return path (e.g. a stream back to the client): drawn last, routed around the flow. */
  back?: boolean;
};

export type CaseStudy = {
  role: string;
  problem: string;
  approach: string;
  architecture: { nodes: DiagramNode[]; edges: DiagramEdge[] };
  hardParts: string;
  result: string;
  snippets: Snippet[];
};

export type Project = {
  slug: string;
  index: string;
  name: string;
  subtitle?: string;
  pitch: string;
  stack: string[];
  highlights: string[];
  /** Present only when the project is publicly deployed. */
  liveUrl?: string;
  repoUrl: string;
  media: { mp4: string; webm: string; poster: string };
  caseStudy: CaseStudy;
};

export type ArchiveEntry = {
  year: string;
  name: string;
  stack: string;
  href: string;
  preview: string;
};

export type Education = {
  degree: string;
  school: string;
  location: string;
  period: string;
  coursework: string[];
};

export type Certification = {
  title: string;
  issuer: string;
  period: string;
};

export type Principle = {
  id: string;
  title: string;
  summary: string;
  snippet: { lang: Snippet["lang"]; code: string };
};

export type Now = {
  updated: string;
  rows: { key: string; value: string; live?: boolean }[];
};

export type Site = {
  meta: { title: string; description: string; url: string };
  profile: Profile;
  socials: ExternalLink[];
  sections: Section[];
  boot: string[];
  graph: { nodes: GraphNode[]; edges: GraphEdge[] };
  stack: string[];
  projects: Project[];
  principles: Principle[];
  archive: ArchiveEntry[];
  education: Education;
  certifications: Certification[];
  now: Now;
  footer: { builtWith: string; terminalHint: string; version: string; year: string };
  terminal: {
    prompt: string;
    whoami: string;
    greeting: string;
    /** `help` output, in this order. Commands themselves live in components/layout/terminal.tsx. */
    commands: { name: string; usage?: string; description: string }[];
  };
};

/* ------------------------------------------------------------------ *
 * Content
 * ------------------------------------------------------------------ */

const media = (slug: string): Project["media"] => ({
  mp4: `/work/${slug}.mp4`,
  webm: `/work/${slug}.webm`,
  poster: `/work/${slug}.webp`,
});

const pendingCaseStudy = {
  role: "[[PLACEHOLDER]]",
  problem: "[[PLACEHOLDER]]",
  approach: "[[PLACEHOLDER]]",
  hardParts: "[[PLACEHOLDER]]",
  result: "[[PLACEHOLDER]]",
} as const;

export const site: Site = {
  meta: {
    title: "Kaustubh Bramhe — Full-stack developer",
    description:
      "Full-stack developer building reliable backends, workflow engines, and LLM-powered products.",
    url: "https://kaustubh-bramhe.vercel.app",
  },

  profile: {
    name: "Kaustubh Bramhe",
    nameLines: ["Kaustubh", "Bramhe"],
    initials: "kb",
    domain: "kaustubh-bramhe",
    role: "Full-stack developer",
    roleLine:
      "Full-stack developer building reliable backends, workflow engines, and LLM-powered products.",
    email: "kaustubhbramhe777@gmail.com",
    location: "Madhya Pradesh, India",
    timezone: { iana: "Asia/Kolkata", label: "IST" },
    status: {
      available: true,
      label: "available for SDE roles · 2027",
      short: "available · SDE 2027",
    },
    resume: { href: "/Kaustubh_Bramhe_Resume.pdf", route: "/resume" },
  },

  socials: [
    { label: "GitHub", href: "[[PLACEHOLDER]]" },
    { label: "LinkedIn", href: "[[PLACEHOLDER]]" },
    { label: "LeetCode", href: "[[PLACEHOLDER]]" },
  ],

  sections: [
    { id: "index", index: "00", label: "Index", title: "Kaustubh Bramhe", nav: false },
    { id: "stack", index: null, label: "Stack", title: "Stack", nav: false },
    { id: "work", index: "01", label: "Work", title: "Selected Work", nav: true },
    { id: "principles", index: "02", label: "Principles", title: "How I build", titleLines: ["How I", "build"], nav: true },
    { id: "archive", index: "03", label: "Archive", title: "Archive", nav: true },
    { id: "education", index: "04", label: "Education", title: "Education", nav: false },
    { id: "now", index: "05", label: "Now", title: "Now", nav: false },
    { id: "contact", index: "06", label: "Contact", title: "Contact", nav: true },
  ],

  boot: [
    "initializing kaustubh-bramhe…",
    "resolving dependencies… ok",
    "compiling graph (8 nodes)… ok",
    "ready",
  ],

  graph: {
    nodes: [
      { id: "idea", label: "idea", tooltip: "Frame the problem and the constraints." },
      { id: "design", label: "design", tooltip: "Data model, API contract, and UI flows." },
      { id: "frontend", label: "frontend", tooltip: "React, typed end to end." },
      { id: "backend", label: "backend", tooltip: "Node.js / Express or FastAPI services." },
      { id: "db", label: "db", tooltip: "MongoDB or PostgreSQL, indexed and validated." },
      { id: "llm", label: "llm", tooltip: "LLM APIs behind a validated interface." },
      { id: "test", label: "test", tooltip: "Validation at every boundary, then tests." },
      { id: "ship", label: "ship", tooltip: "Deployed and observable." },
    ],
    edges: [
      { from: "idea", to: "design" },
      { from: "design", to: "frontend" },
      { from: "design", to: "backend" },
      { from: "backend", to: "db" },
      { from: "backend", to: "llm" },
      { from: "frontend", to: "test" },
      { from: "db", to: "test" },
      { from: "llm", to: "test" },
      { from: "test", to: "ship" },
    ],
  },

  stack: [
    "Java",
    "Python",
    "JavaScript",
    "TypeScript",
    "SQL",
    "React",
    "Node.js",
    "Express",
    "FastAPI",
    "MongoDB",
    "PostgreSQL",
    "Prisma",
    "Zod",
    "JWT",
    "SSE",
    "LLM APIs",
  ],

  projects: [
    {
      slug: "forgefort",
      index: "01",
      name: "Forgefort",
      subtitle: "Agentic Workflow Automation Platform",
      pitch: "A visual workflow builder with its own execution engine.",
      stack: [
        "React",
        "React Flow",
        "Tailwind",
        "Node.js",
        "Express",
        "MongoDB",
        "JWT",
        "Gemini API",
        "SSE",
      ],
      highlights: [
        "Custom Node.js engine orders nodes via topological sort (Kahn's algorithm), with conditional branching and retries.",
        "Live per-node execution status streamed over Server-Sent Events.",
        "Outbound HTTP nodes hardened with SSRF protection and safe expression resolution, behind JWT auth.",
      ],
      liveUrl: "https://forgefort.vercel.app/",
      repoUrl: "[[PLACEHOLDER]]",
      media: media("forgefort"),
      caseStudy: {
        ...pendingCaseStudy,
        architecture: {
          nodes: [
            { id: "client", label: "client", detail: "React + React Flow" },
            { id: "api", label: "api", detail: "Express · JWT" },
            { id: "engine", label: "engine", detail: "Kahn's sort · retries" },
            { id: "executors", label: "executors", detail: "HTTP · LLM · logic" },
          ],
          edges: [
            { from: "client", to: "api" },
            { from: "api", to: "engine" },
            { from: "engine", to: "executors" },
            { from: "engine", to: "client", label: "SSE", back: true },
          ],
        },
        snippets: [
          {
            file: "engine/kahn.ts",
            lang: "ts",
            code: `// [[REPLACE WITH REAL CODE]] illustrative only
export function topoSort(nodes: FlowNode[], edges: FlowEdge[]): string[] {
  const indegree = new Map(nodes.map((n) => [n.id, 0]));
  const out = new Map(nodes.map((n) => [n.id, [] as string[]]));
  for (const { source, target } of edges) {
    out.get(source)!.push(target);
    indegree.set(target, indegree.get(target)! + 1);
  }

  const queue = nodes.filter((n) => indegree.get(n.id) === 0).map((n) => n.id);
  const order: string[] = [];
  while (queue.length) {
    const id = queue.shift()!;
    order.push(id);
    for (const next of out.get(id)!) {
      indegree.set(next, indegree.get(next)! - 1);
      if (indegree.get(next) === 0) queue.push(next);
    }
  }

  if (order.length !== nodes.length) throw new CycleError(nodes, order);
  return order;
}`,
            highlight: [12, 16, 17, 21],
            caption: "Kahn's topological sort",
          },
          {
            file: "engine/stream.ts",
            lang: "ts",
            code: `// [[REPLACE WITH REAL CODE]] illustrative only
router.get("/runs/:id/stream", requireAuth, (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const send = (event: NodeEvent) =>
    res.write(\`event: \${event.type}\\ndata: \${JSON.stringify(event)}\\n\\n\`);

  const unsubscribe = runs.subscribe(req.params.id, send);
  req.on("close", unsubscribe);
});`,
            highlight: [4, 10, 13],
            caption: "SSE push of per-node status",
          },
        ],
      },
    },
    {
      slug: "price-optimizer",
      index: "02",
      name: "Price Optimizer",
      pitch: "ML-driven pricing recommendations for WooCommerce stores.",
      stack: [
        "React",
        "Node.js",
        "Express",
        "Python",
        "FastAPI",
        "PostgreSQL",
        "WooCommerce API",
      ],
      highlights: [
        "Ingests store data via the WooCommerce REST API.",
        "A FastAPI demand-elasticity model trained on historical sales recommends optimal prices.",
        "A Node.js orchestration layer combines the ML output with Gemini insights and shows projected revenue impact on a React dashboard.",
      ],
      liveUrl: "https://price-optimizer-tau.vercel.app/",
      repoUrl: "[[PLACEHOLDER]]",
      media: media("price-optimizer"),
      caseStudy: {
        ...pendingCaseStudy,
        architecture: {
          nodes: [
            { id: "dashboard", label: "dashboard", detail: "React" },
            { id: "api", label: "orchestrator", detail: "Node.js · Express" },
            { id: "woo", label: "woocommerce", detail: "REST API" },
            { id: "model", label: "model", detail: "FastAPI · elasticity" },
            { id: "llm", label: "gemini", detail: "insights" },
            { id: "db", label: "db", detail: "PostgreSQL" },
          ],
          edges: [
            { from: "dashboard", to: "api" },
            { from: "api", to: "woo" },
            { from: "api", to: "model" },
            { from: "api", to: "llm" },
            { from: "api", to: "db" },
          ],
        },
        snippets: [
          {
            file: "api/recommend.ts",
            lang: "ts",
            code: `// [[REPLACE WITH REAL CODE]] illustrative only
export async function recommend(productId: string) {
  const sales = await salesHistory(productId); // synced from WooCommerce

  const res = await fetch(\`\${ML_URL}/elasticity\`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, sales }),
    signal: AbortSignal.timeout(5_000),
  });
  if (!res.ok) throw new UpstreamError("ml", res.status);

  const { optimalPrice, elasticity } = (await res.json()) as MlResult;
  return { optimalPrice, elasticity, projected: projectRevenue(sales, optimalPrice) };
}`,
            highlight: [5, 9, 11],
            caption: "Node → FastAPI call",
          },
        ],
      },
    },
    {
      slug: "ticket-tracker",
      index: "03",
      name: "Support Ticket Tracker",
      pitch: "Ticket lifecycle management with production-grade validation.",
      stack: ["React", "Node.js", "Express", "MongoDB", "Zod"],
      highlights: [
        "REST APIs for ticket lifecycle and priority, with server-side search, filtering, and pagination.",
        "Layered Zod + Mongoose validation with centralized error handling.",
        "Queries optimized with MongoDB indexes and aggregations.",
      ],
      liveUrl: "https://support-ticket-rho.vercel.app/",
      repoUrl: "[[PLACEHOLDER]]",
      media: media("ticket-tracker"),
      caseStudy: {
        ...pendingCaseStudy,
        architecture: {
          nodes: [
            { id: "client", label: "client", detail: "React" },
            { id: "api", label: "api", detail: "Express" },
            { id: "zod", label: "zod", detail: "edge validation" },
            { id: "model", label: "mongoose", detail: "schema validation" },
            { id: "db", label: "db", detail: "MongoDB · indexes" },
          ],
          edges: [
            { from: "client", to: "api" },
            { from: "api", to: "zod" },
            { from: "zod", to: "model" },
            { from: "model", to: "db" },
          ],
        },
        snippets: [
          {
            file: "middleware/validate.ts",
            lang: "ts",
            code: `// [[REPLACE WITH REAL CODE]] illustrative only
export const validate =
  (schema: z.ZodType) => (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) return next(new ValidationError(result.error.issues));
    req.body = result.data; // layer 1: Zod at the edge
    next();
  };

router.post("/tickets", validate(CreateTicket), async (req, res) => {
  const ticket = await Ticket.create(req.body); // layer 2: Mongoose schema
  res.status(201).json(ticket);
});

// layer 3: one error handler shapes every failure
app.use(errorHandler);`,
            highlight: [4, 11, 16],
            caption: "Layered validation",
          },
        ],
      },
    },
    {
      slug: "backend-ledger",
      index: "04",
      name: "Backend-Ledger",
      pitch: "A ledger where balances are derived, never stored.",
      stack: ["Node.js", "Express", "MongoDB", "Mongoose", "JWT", "Nodemailer"],
      highlights: [
        "Account balances derived from immutable entries via MongoDB aggregations.",
        "Multi-document transactions plus idempotency keys block duplicate transfers.",
        "JWT-secured API.",
      ],
      repoUrl: "[[PLACEHOLDER]]",
      media: media("backend-ledger"),
      caseStudy: {
        ...pendingCaseStudy,
        architecture: {
          nodes: [
            { id: "client", label: "client" },
            { id: "api", label: "api", detail: "Express · JWT" },
            { id: "transfer", label: "transfer", detail: "transaction · idempotency key" },
            { id: "db", label: "ledger", detail: "MongoDB · immutable entries" },
            { id: "mail", label: "mailer", detail: "Nodemailer" },
          ],
          edges: [
            { from: "client", to: "api" },
            { from: "api", to: "transfer" },
            { from: "transfer", to: "db" },
            { from: "transfer", to: "mail" },
          ],
        },
        snippets: [
          {
            file: "services/transfer.ts",
            lang: "ts",
            code: `// [[REPLACE WITH REAL CODE]] illustrative only
export async function transfer({ key, from, to, amount }: TransferInput) {
  const session = await mongoose.startSession();
  try {
    return await session.withTransaction(async () => {
      const prior = await Transfer.findOne({ key }).session(session);
      if (prior) return prior; // same key: replay the result, never re-post

      const balance = await balanceOf(from, session); // derived from entries
      if (balance < amount) throw new InsufficientFunds(from);

      const [t] = await Transfer.create([{ key, from, to, amount }], { session });
      await Entry.create(
        [
          { account: from, amount: -amount, transfer: t._id },
          { account: to, amount, transfer: t._id },
        ],
        { session },
      );
      return t;
    });
  } finally {
    await session.endSession();
  }
}`,
            highlight: [5, 6, 7, 13],
            caption: "Idempotency check inside a transaction",
          },
        ],
      },
    },
  ],

  // Snippets are short illustrations of each principle — edit freely.
  // Keep lines ≤ 40 characters so they fit a card without scrolling.
  principles: [
    {
      id: "P.01",
      title: "Idempotent by default",
      summary: "Duplicate requests are not duplicate charges.",
      snippet: {
        lang: "ts",
        code: `const done = await Ops.findOne({ key });
if (done) return done.result; // replay
const result = await charge(body);
await Ops.create({ key, result });
return result;`,
      },
    },
    {
      id: "P.02",
      title: "Validate at every boundary",
      summary: "Zod at the edge, schema at the DB.",
      snippet: {
        lang: "ts",
        code: `const Ticket = z.object({
  title: z.string().min(3),
});
const input = Ticket.parse(req.body);
await TicketDoc.create(input); // schema`,
      },
    },
    {
      id: "P.03",
      title: "Never trust user URLs",
      summary: "SSRF guards on outbound calls.",
      snippet: {
        lang: "ts",
        code: `const url = new URL(input);
if (url.protocol !== "https:")
  throw new Blocked("scheme");
const ip = await resolve(url.hostname);
if (isPrivate(ip)) throw new Blocked(ip);`,
      },
    },
    {
      id: "P.04",
      title: "Derive, don't store",
      summary: "State is computed from immutable events.",
      snippet: {
        lang: "ts",
        code: `const [row] = await Entry.aggregate([
  { $match: { account: id } },
  { $group: { _id: null,
    balance: { $sum: "$amount" } } },
]);
return row?.balance ?? 0; // derived`,
      },
    },
  ],

  archive: [
    {
      year: "[[PLACEHOLDER]]",
      name: "Concurrent-safe Event Booking",
      stack: "PostgreSQL · advisory locks · SKIP LOCKED",
      href: "[[PLACEHOLDER]]",
      preview: "/archive/event-booking.webp",
    },
    {
      year: "[[PLACEHOLDER]]",
      name: "Creator Intelligence Platform",
      stack: "influencer discovery · RAG chat",
      href: "[[PLACEHOLDER]]",
      preview: "/archive/creator-intelligence.webp",
    },
    {
      year: "[[PLACEHOLDER]]",
      name: "Smart Resume Screener",
      stack: "[[PLACEHOLDER]]",
      href: "[[PLACEHOLDER]]",
      preview: "/archive/resume-screener.webp",
    },
    {
      year: "[[PLACEHOLDER]]",
      name: "AI Ambulance Route Optimization & Smart Signal Priority",
      stack: "capstone",
      href: "[[PLACEHOLDER]]",
      preview: "/archive/ambulance-routing.webp",
    },
    {
      year: "[[PLACEHOLDER]]",
      name: "Node.js educational website",
      stack: "24 chapters",
      href: "[[PLACEHOLDER]]",
      preview: "/archive/nodejs-course.webp",
    },
  ],

  education: {
    degree: "B.Tech, Computer Science & Engineering",
    school: "VIT-AP University",
    location: "Amaravati",
    period: "2023 — 2027",
    coursework: ["DSA", "DBMS", "Operating Systems", "Computer Networks", "OOP"],
  },

  certifications: [
    { title: "The Complete Full Stack", issuer: "Udemy", period: "2024–25" },
    { title: "Oracle Generative AI", issuer: "Oracle", period: "2025" },
    { title: "IBM Machine Learning", issuer: "IBM", period: "2025–26" },
  ],

  now: {
    updated: "[[PLACEHOLDER]]",
    rows: [
      { key: "building", value: "[[PLACEHOLDER]]" },
      { key: "learning", value: "[[PLACEHOLDER]]" },
      { key: "status", value: "open to SDE roles for 2027", live: true },
    ],
  },

  footer: {
    builtWith: "Built with Next.js, GSAP, Motion",
    terminalHint: "press ~ for a terminal",
    version: "v1 · 2026",
    year: "2026",
  },

  terminal: {
    prompt: "kaustubh@dev: ~",
    whoami: "kaustubh bramhe — full-stack developer",
    greeting: "kaustubh-bramhe shell · type help for commands · esc to close",
    commands: [
      { name: "help", description: "list commands" },
      { name: "whoami", description: "who runs this machine" },
      { name: "projects", description: "list selected work" },
      { name: "resume", description: "open the resume (new tab)" },
      { name: "contact", description: "email and socials" },
      { name: "theme", usage: "theme [dark|light]", description: "toggle or set the theme" },
      { name: "clear", description: "clear the screen" },
      { name: "exit", description: "close the terminal" },
    ],
  },
};

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

export const PLACEHOLDER = "[[PLACEHOLDER]]";

export const isPlaceholder = (value: string | undefined): boolean =>
  !value || value.includes("[[");

export const getSection = (id: SectionId): Section => {
  const section = site.sections.find((s) => s.id === id);
  if (!section) throw new Error(`Unknown section: ${id}`);
  return section;
};

/** "01 / WORK" — the system-metadata label for a section. */
export const sectionLabel = (section: Section): string =>
  section.index ? `${section.index} / ${section.label}` : section.label;

export const getProject = (slug: string): Project | undefined =>
  site.projects.find((p) => p.slug === slug);

/** The projects either side of `slug`, wrapping around: 01's prev is the last. */
export const getAdjacent = (slug: string): { prev: Project; next: Project } => {
  const { projects } = site;
  const i = projects.findIndex((p) => p.slug === slug);
  const at = (offset: number) => projects[(i + offset + projects.length) % projects.length]!;
  return { prev: at(-1), next: at(1) };
};
