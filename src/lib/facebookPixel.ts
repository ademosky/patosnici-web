/**
 * Meta Pixel helper — use `pageview()` and `event()` across the app.
 * Reads the Pixel ID from NEXT_PUBLIC_META_PIXEL_ID (falls back to the
 * hardcoded value so production works even without the env var set).
 */

export const FB_PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "1053477223792945";

type WindowWithFbq = Window & {
  fbq?: (...args: unknown[]) => void;
};

/** Fire a standard PageView event. */
export const pageview = (): void => {
  const win = window as WindowWithFbq;
  if (typeof win.fbq === "function") {
    win.fbq("track", "PageView");
  }
};

/** Fire any custom or standard Meta Pixel event. */
export const event = (
  name: string,
  options: Record<string, unknown> = {}
): void => {
  const win = window as WindowWithFbq;
  if (typeof win.fbq === "function") {
    win.fbq("track", name, options);
  }
};
