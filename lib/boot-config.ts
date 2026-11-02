/**
 * Boot preloader timings and the inline script that decides, before first
 * paint, whether it runs. Server-safe (no "use client"): the root layout
 * inlines `bootScript`, and hooks/use-boot.ts reads the same constants.
 * The CSS timeline in app/globals.css (`--boot-*`) mirrors these values.
 */

export const BOOT_STORAGE_KEY = "kb:booted";

/** Boot log + progress bar. The accent curtain starts here. */
export const BOOT_LOG_MS = 700;
/** Hero timeline t0: the name starts rising as the curtain lifts. */
export const BOOT_REVEAL_MS = 1000;
/** Curtain fully lifted; the preloader is gone. */
export const BOOT_TOTAL_MS = 1200;
/** Exit wipe after a skip. */
export const BOOT_SKIP_MS = 320;

/* Runs once per session, never under reduced motion. Storage access is
   wrapped: if sessionStorage throws (private mode, blocked), skip the boot. */
export const bootScript = `(function(){try{var d=document.documentElement;if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;if(sessionStorage.getItem("${BOOT_STORAGE_KEY}"))return;sessionStorage.setItem("${BOOT_STORAGE_KEY}","1");d.dataset.bootT=String(performance.now());d.dataset.boot="run"}catch(e){}})()`;
