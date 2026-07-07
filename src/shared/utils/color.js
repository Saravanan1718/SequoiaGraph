const PALETTE = [
  '#6366f1', '#0ea5e9', '#10b981', '#f59e0b',
  '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6',
]

/** Deterministic avatar fallback color derived from a name. */
export function colorFromName(name = '') {
  let hash = 0
  for (const ch of name) hash = (hash * 31 + ch.codePointAt(0)) | 0
  return PALETTE[Math.abs(hash) % PALETTE.length]
}

/** Up-to-two-letter initials: "Ada Lovelace" → "AL". */
export function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}
