// Shared search helpers — used by both the server API and client filters.

/** Split a string into normalized search words.
 *  Lowercases and replaces hyphens, underscores, parentheses, slashes and
 *  dots with spaces so "C-KLASSE", "C KLASSE" and "C (KLASSE)" all match.
 */
export function normalizeSearchWords(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[-_()/.,]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/** True if EVERY word in `query` appears (partially) in `haystack`.
 *  AND across query words, OR across haystack words. Case-insensitive.
 */
export function matchesAllWords(haystack: string, query: string): boolean {
  const words = normalizeSearchWords(query);
  if (words.length === 0) return true;
  const hay = normalizeSearchWords(haystack);
  return words.every((w) => hay.some((hw) => hw.includes(w)));
}
