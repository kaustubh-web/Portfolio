import type Lenis from "lenis";

/** Scroll to a section by id through Lenis when active, natively otherwise. */
export function scrollToId(id: string, lenis: Lenis | null) {
  const target = document.getElementById(id);
  if (!target) return;
  if (lenis) lenis.scrollTo(target, { force: true });
  else target.scrollIntoView();
  history.replaceState(null, "", `#${id}`);
}
