import { cacheLife } from "next/cache";
import { createCssVariablesTheme, createHighlighter, type Highlighter } from "shiki";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

import type { Snippet } from "@/content/site";

/** Token colours are CSS variables (`--shiki-*`), mapped onto design tokens in globals.css. */
const theme = createCssVariablesTheme({ name: "kb-tokens", variablePrefix: "--shiki-" });

const langs = {
  ts: "typescript",
  js: "javascript",
  py: "python",
  json: "json",
  bash: "bash",
} as const satisfies Record<Snippet["lang"], string>;

let highlighter: Promise<Highlighter> | null = null;

const getHighlighter = () =>
  (highlighter ??= createHighlighter({
    themes: [theme],
    langs: Object.values(langs),
    // Pure JS regex engine: no wasm to load at build time.
    engine: createJavaScriptRegexEngine(),
  }));

/**
 * Server-only. A snippet as highlighted HTML: one `.line` span per line,
 * `data-hl` on the highlighted ones (1-based, from content). Cached, so each
 * snippet is highlighted once per build. `max`: content only changes with a
 * deploy, so the pages carry no revalidation window.
 */
export async function highlight({ code, lang, highlight: lines, file }: Snippet): Promise<string> {
  "use cache";
  cacheLife("max");
  const marked = new Set(lines);
  const shiki = await getHighlighter();
  return shiki.codeToHtml(code, {
    lang: langs[lang],
    theme: theme.name!,
    transformers: [
      {
        pre(node) {
          node.properties["aria-label"] = `${file}, ${code.split("\n").length} lines`;
          delete node.properties.style;
        },
        line(node, line) {
          if (marked.has(line)) node.properties["data-hl"] = "";
        },
      },
    ],
  });
}
