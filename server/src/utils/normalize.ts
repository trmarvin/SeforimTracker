export function normalizeSearch(s: string): string {
  if (!s) return "";

  // Normalize Unicode (helps Hebrew + punctuation consistency)
  let out = s.normalize("NFKD");

  // Remove Hebrew niqqud + cantillation (U+0591–U+05C7)
  out = out.replace(/[\u0591-\u05C7]/g, "");

  // Normalize Hebrew punctuation to plain quotes (optional)
  out = out.replace(/[״]/g, '"').replace(/[׳]/g, "'");

  // Lowercase (fine even for Hebrew; Hebrew unaffected)
  out = out.toLowerCase();

  // Remove punctuation (keep Hebrew letters, Latin letters, numbers, spaces)
  // This strips things like commas, periods, parentheses, etc.
  out = out.replace(/[^0-9a-z\u05d0-\u05ea\s]/g, " ");

  // Collapse whitespace
  out = out.replace(/\s+/g, " ").trim();

  return out;
}
