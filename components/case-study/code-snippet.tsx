import type { Snippet } from "@/content/site";
import { highlight } from "@/lib/highlight";

/**
 * A Shiki-highlighted snippet in a hairline frame: file name and caption
 * in the header, line numbers from a CSS counter, highlighted lines marked
 * with an accent rule. Long lines scroll inside the box (the <pre> is
 * focusable for keyboard scrolling). Rendered on the server.
 */
export async function CodeSnippet({ snippet }: { snippet: Snippet }) {
  const html = await highlight(snippet);

  return (
    <figure className="overflow-clip rounded-lg border border-line-strong bg-surface">
      <figcaption className="label-meta flex min-h-11 flex-wrap items-center gap-x-3 gap-y-1 border-b border-line px-4 py-2 text-fg-muted">
        <span className="normal-case text-fg">{snippet.file}</span>
        <span aria-hidden className="h-px min-w-4 flex-1 bg-line" />
        <span>{snippet.caption}</span>
      </figcaption>
      <div className="code-snippet" dangerouslySetInnerHTML={{ __html: html }} />
    </figure>
  );
}
