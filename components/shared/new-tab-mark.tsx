/** The ↗ on links that open a new tab, announced as words to screen readers. */
export function NewTabMark() {
  return (
    <>
      <span aria-hidden>↗</span>
      <span className="sr-only"> (opens in a new tab)</span>
    </>
  );
}

/** Suffix for links whose accessible name comes from `aria-label`. */
export const NEW_TAB_LABEL = ", opens in a new tab";
