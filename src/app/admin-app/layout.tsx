import type { Metadata, Viewport } from "next";

const SITE_URL = "https://www.originalpatosnici.com";

/**
 * /admin-app — the installable admin application.
 *
 * Deliberately isolated from the storefront: its own manifest, icons, launch
 * screens and viewport, and it is never indexed. The legacy /admin panel is
 * untouched and unaffected by anything in this subtree.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "OP Admin", template: "%s · OP Admin" },
  description: "Управување со нарачки, производи, залиха и продажба.",
  applicationName: "OP Admin",
  manifest: "/admin-app/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "OP Admin",
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false, date: false, address: false, email: false },
  icons: {
    icon: [
      { url: "/admin-app/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/admin-app/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/admin-app/apple-touch-icon.png", sizes: "180x180" }],
  },
  robots: { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",          // render under the iPhone notch + home indicator
  themeColor: "#08080a",
};

/**
 * iOS launch images.
 *
 * Safari matches these by media query — NOT from the manifest — so each entry
 * must carry the device's true CSS points and pixel ratio. Using a single
 * ratio for every file silently skips the @2x devices (iPhone SE, XR, 11),
 * which would launch with no splash at all.
 *
 *   [image px width, image px height, css width, css height, pixel ratio]
 */
const SPLASHES: Array<[number, number, number, number, number]> = [
  [1290, 2796, 430, 932, 3],   // 15 Pro Max / 14 Pro Max
  [1179, 2556, 393, 852, 3],   // 15 / 14 Pro
  [1284, 2778, 428, 926, 3],   // 14 Plus / 13 Pro Max / 12 Pro Max
  [1170, 2532, 390, 844, 3],   // 14 / 13 / 12
  [1242, 2688, 414, 896, 3],   // 11 Pro Max / XS Max
  [1125, 2436, 375, 812, 3],   // X / XS / 11 Pro
  [828,  1792, 414, 896, 2],   // 11 / XR
  [750,  1334, 375, 667, 2],   // SE 2nd/3rd gen, 8
];


export default function AdminAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Older iOS only honours the apple- prefixed flag. */}
      <meta name="apple-mobile-web-app-capable" content="yes" />

      {SPLASHES.map(([w, h, cw, ch, dpr]) => (
        <link
          key={`${w}x${h}`}
          rel="apple-touch-startup-image"
          href={`/admin-app/splash-${w}x${h}.png`}
          media={
            `(device-width: ${cw}px) and (device-height: ${ch}px) ` +
            `and (-webkit-device-pixel-ratio: ${dpr}) and (orientation: portrait)`
          }
        />
      ))}
      {children}
    </>
  );
}
