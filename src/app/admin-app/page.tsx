import { AdminAppShell, asTab } from "./_ui/AdminApp";

/**
 * /admin-app — the installable admin application.
 *
 * A Server Component purely so the initial tab can be resolved from the URL
 * before anything renders. That makes the PWA shortcuts (?tab=orders, …) and
 * deep links land on the right screen on the first paint, instead of flashing
 * the dashboard and switching after hydration.
 */
export default async function AdminAppPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const raw = Array.isArray(sp?.tab) ? sp.tab[0] : sp?.tab;

  return <AdminAppShell initialTab={asTab(raw)} />;
}
