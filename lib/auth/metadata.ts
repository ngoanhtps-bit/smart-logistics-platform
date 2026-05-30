export function nameFromUserMetadata(
  meta: Record<string, unknown> | undefined,
  email: string
): string {
  const m = meta ?? {};
  const combined = [m.given_name, m.family_name]
    .filter((v) => typeof v === "string" && v.trim())
    .join(" ")
    .trim();
  const fromMeta =
    (typeof m.full_name === "string" && m.full_name.trim()) ||
    (typeof m.name === "string" && m.name.trim()) ||
    combined;
  if (fromMeta) return fromMeta;
  const local = email.split("@")[0]?.trim();
  return local || "User";
}
