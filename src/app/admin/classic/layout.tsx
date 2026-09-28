import type { Metadata } from "next";

/**
 * Legacy admin — kept as a fallback while the new PWA admin is verified.
 * It renders exactly as before: no app shell, no tab bar.
 */
export const metadata: Metadata = {
  title: "Admin (класичен) | Original Patosnici",
  robots: { index: false, follow: false },
};

export default function ClassicAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
