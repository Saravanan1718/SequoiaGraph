/** DB snake_case ↔ app camelCase. The only place both shapes are known. */

export function treeFromRow(row) {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at ?? null,
    // populated by the `members(count)` aggregate in the list query
    memberCount: row.members?.[0]?.count ?? 0,
  }
}

export function memberFromRow(row) {
  return {
    id: row.id,
    treeId: row.tree_id,
    name: row.name,
    gender: row.gender ?? null,
    photoUrl: row.photo_url ?? null,
    birthDate: row.birth_date ?? null,
    deathDate: row.death_date ?? null,
    occupation: row.occupation ?? null,
    notes: row.notes ?? null,
    posX: row.pos_x ?? 0,
    posY: row.pos_y ?? 0,
  }
}

export function memberToRow(member) {
  return {
    id: member.id,
    tree_id: member.treeId,
    name: member.name,
    gender: member.gender ?? null,
    photo_url: member.photoUrl ?? null,
    birth_date: member.birthDate || null,
    death_date: member.deathDate || null,
    occupation: member.occupation ?? null,
    notes: member.notes ?? null,
    pos_x: member.posX ?? 0,
    pos_y: member.posY ?? 0,
  }
}

export function relationshipFromRow(row) {
  return {
    id: row.id,
    treeId: row.tree_id,
    fromId: row.from_id,
    toId: row.to_id,
    type: row.type,
  }
}

export function relationshipToRow(rel) {
  return {
    id: rel.id,
    tree_id: rel.treeId,
    from_id: rel.fromId,
    to_id: rel.toId,
    type: rel.type,
  }
}
