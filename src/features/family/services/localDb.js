/**
 * localStorage fallback used when Supabase env vars are missing.
 * Implements the same async surface as the Supabase-backed services so the
 * stores never know which backend they are talking to.
 */
const KEY = 'sequoiaroots:localdb'
const LEGACY_TREE_ID = 'local-default-tree'

function load() {
  let db = { trees: [], members: [], relationships: [] }
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) db = { trees: [], members: [], relationships: [], ...JSON.parse(raw) }
  } catch {
    /* corrupted storage — start fresh */
  }
  // migrate pre-multi-tree data: wrap orphaned rows into a default tree
  if (db.members.some((m) => !m.treeId)) {
    if (!db.trees.some((t) => t.id === LEGACY_TREE_ID)) {
      db.trees.push({ id: LEGACY_TREE_ID, name: 'My Family Tree', createdAt: null })
    }
    db.members = db.members.map((m) => ({ treeId: LEGACY_TREE_ID, ...m }))
    db.relationships = db.relationships.map((r) => ({ treeId: LEGACY_TREE_ID, ...r }))
    save(db)
  }
  return db
}

function save(db) {
  localStorage.setItem(KEY, JSON.stringify(db))
}

export const localDb = {
  async listTrees() {
    const db = load()
    return db.trees.map((t) => ({
      ...t,
      memberCount: db.members.filter((m) => m.treeId === t.id).length,
    }))
  },
  async insertTree(tree) {
    const db = load()
    db.trees.push(tree)
    save(db)
  },
  async updateTree(id, patch) {
    const db = load()
    const tree = db.trees.find((t) => t.id === id)
    if (tree) Object.assign(tree, patch)
    save(db)
  },
  async deleteTree(id) {
    const db = load()
    db.trees = db.trees.filter((t) => t.id !== id)
    db.members = db.members.filter((m) => m.treeId !== id)
    db.relationships = db.relationships.filter((r) => r.treeId !== id)
    save(db)
  },

  async listMembers(treeId) {
    return load().members.filter((m) => m.treeId === treeId)
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

  async listRelationships(treeId) {
    return load().relationships.filter((r) => r.treeId === treeId)
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
