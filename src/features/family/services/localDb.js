/**
 * localStorage fallback used when Supabase env vars are missing.
 * Implements the same async surface as the Supabase-backed services so the
 * store never knows which backend it is talking to.
 */
const KEY = 'kingraph:localdb'

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* corrupted storage — start fresh */
  }
  return { members: [], relationships: [] }
}

function save(db) {
  localStorage.setItem(KEY, JSON.stringify(db))
}

export const localDb = {
  async listMembers() {
    return load().members
  },
  async upsertMember(member) {
    const db = load()
    const i = db.members.findIndex((m) => m.id === member.id)
    if (i >= 0) db.members[i] = member
    else db.members.push(member)
    save(db)
  },
  async deleteMember(id) {
    const db = load()
    db.members = db.members.filter((m) => m.id !== id)
    db.relationships = db.relationships.filter(
      (r) => r.fromId !== id && r.toId !== id,
    )
    save(db)
  },
  async listRelationships() {
    return load().relationships
  },
  async insertRelationship(rel) {
    const db = load()
    db.relationships.push(rel)
    save(db)
  },
  async deleteRelationship(id) {
    const db = load()
    db.relationships = db.relationships.filter((r) => r.id !== id)
    save(db)
  },
}
