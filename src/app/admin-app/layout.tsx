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

/** iOS launch images. Safari matches these by media query, not by manifest. */
const SPLASHES: Array<[number, number]> = [
  [1290, 2796], [1179, 2556], [1284, 2778], [1170, 2532],
  [1242, 2688], [1125, 2436], [828, 1792], [750, 1334],
];

export default function AdminAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {SPLASHES.map(([w, h]) => (
        <link
          key={`${w}x${h}`}
          rel="apple-touch-startup-image"
          href={`/admin-app/splash-${w}x${h}.png`}
          media={
            `(device-width: ${w / 3}px) and (device-height: ${h / 3}px) ` +
            `and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)`
          }
        />
      ))}
      {children}
    </>
  );
}
