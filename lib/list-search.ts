export function normalizeSearchQuery(q: string) {
  return q.trim().toLowerCase();
}

export function matchesSearch(query: string, fields: (string | null | undefined)[]) {
  const n = normalizeSearchQuery(query);
  if (!n) return true;
  return fields.some((f) => (f ?? "").toLowerCase().includes(n));
}
