/** Client-side UUID for optimistic inserts (same id is persisted to Supabase). */
export function newId() {
  return crypto.randomUUID()
}
