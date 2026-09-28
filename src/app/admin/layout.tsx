import type { Metadata, Viewport } from "next";

const SITE_URL = "https://www.originalpatosnici.com";

/**
 * Admin metadata + PWA wiring.
 *
 * The admin is installable as a standalone app: its own manifest, icons and
 * iOS splash screens. It is deliberately NOT indexed — it must never appear
 * in search results next to the storefront.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "OP Admin",
    template: "%s | OP Admin",
  },
  description: "Управување со нарачки, производи, залиха и продажба.",
  manifest: "/admin/manifest.webmanifest",
  applicationName: "OP Admin",
  appleWebApp: {
    capable: true,
    title: "OP Admin",
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false, date: false, address: false, email: false },
  icons: {
    icon: [
      { url: "/admin/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/admin/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/admin/apple-touch-icon.png", sizes: "180x180" }],
  },
  // Never index the admin.
  robots: { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",          // draw under the iPhone notch / home indicator
  themeColor: "#08080a",
};

/** iPhone launch images — iOS reads these from media-query-tagged link tags. */
const SPLASHES: Array<[number, number]> = [
  [1290, 2796], [1179, 2556], [1284, 2778], [1170, 2532],
  [1242, 2688], [1125, 2436], [828, 1792], [750, 1334],
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {SPLASHES.map(([w, h]) => (
        <link
          key={`${w}x${h}`}
          rel="apple-touch-startup-image"
          href={`/admin/splash-${w}x${h}.png`}
          media={`(device-width: ${w / 3}px) and (device-height: ${h / 3}px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)`}
        />
      ))}
      {children}
    </>
  );
}
