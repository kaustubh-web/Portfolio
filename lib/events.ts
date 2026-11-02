/** Window events shared between independent client islands. */
export const OPEN_PALETTE_EVENT = "kb:open-palette";

export const openPalette = () =>
  window.dispatchEvent(new CustomEvent(OPEN_PALETTE_EVENT));
