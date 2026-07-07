/**
 * Pure kinship logic over the relationship list. No store imports —
 * everything takes plain data in and returns plain data out.
 */

/** Relationship types where fromId acts as a parent-figure of toId. */
export const PARENT_LIKE = new Set(['parent', 'adopted', 'guardian'])

/** UI vocabulary. 'child' and 'sibling' are views, not stored types. */
export const RELATIONSHIP_OPTIONS = [
  { value: 'parent', label: 'Parent of' },
  { value: 'child', label: 'Child of' },
  { value: 'spouse', label: 'Spouse of' },
  { value: 'adopted', label: 'Adoptive parent of' },
  { value: 'guardian', label: 'Guardian of' },
]

/**
 * Normalize a UI choice into a stored edge. 'child' inverts into 'parent'.
 * @returns {{fromId: string, toId: string, type: string}}
 */
export function toStoredEdge(memberId, targetId, uiType) {
  if (uiType === 'child') return { fromId: targetId, toId: memberId, type: 'parent' }
  return { fromId: memberId, toId: targetId, type: uiType }
}

export function parentsOf(memberId, relationships) {
  return relationships
    .filter((r) => PARENT_LIKE.has(r.type) && r.toId === memberId)
    .map((r) => r.fromId)
}

export function childrenOf(memberId, relationships) {
  return relationships
    .filter((r) => PARENT_LIKE.has(r.type) && r.fromId === memberId)
    .map((r) => r.toId)
}

export function spousesOf(memberId, relationships) {
  return relationships
    .filter(
      (r) => r.type === 'spouse' && (r.fromId === memberId || r.toId === memberId),
    )
    .map((r) => (r.fromId === memberId ? r.toId : r.fromId))
}

/** Siblings = other members sharing at least one parent-figure. Derived, never stored. */
export function siblingsOf(memberId, relationships) {
  const parents = new Set(parentsOf(memberId, relationships))
  if (parents.size === 0) return []
  const siblings = new Set()
  for (const r of relationships) {
    if (PARENT_LIKE.has(r.type) && parents.has(r.fromId) && r.toId !== memberId) {
      siblings.add(r.toId)
    }
  }
  return [...siblings]
}

/** All member ids reachable from `memberId` through any relationship (includes self). */
export function connectedIds(memberId, relationships) {
  const adjacency = new Map()
  for (const r of relationships) {
    if (!adjacency.has(r.fromId)) adjacency.set(r.fromId, [])
    if (!adjacency.has(r.toId)) adjacency.set(r.toId, [])
    adjacency.get(r.fromId).push(r.toId)
    adjacency.get(r.toId).push(r.fromId)
  }
  const seen = new Set([memberId])
  const queue = [memberId]
  while (queue.length) {
    for (const next of adjacency.get(queue.shift()) ?? []) {
      if (!seen.has(next)) {
        seen.add(next)
        queue.push(next)
      }
    }
  }
  return seen
}

/**
 * Validate a candidate stored edge against existing relationships.
 * @returns {string|null} error message, or null when valid
 */
export function validateEdge(edge, relationships) {
  if (edge.fromId === edge.toId) return 'A member cannot relate to themselves.'

  const spousePairExists = (a, b) =>
    relationships.some(
      (r) =>
        r.type === 'spouse' &&
        ((r.fromId === a && r.toId === b) || (r.fromId === b && r.toId === a)),
    )

  if (edge.type === 'spouse' && spousePairExists(edge.fromId, edge.toId)) {
    return 'These members are already spouses.'
  }
  const duplicate = relationships.some(
    (r) => r.fromId === edge.fromId && r.toId === edge.toId && r.type === edge.type,
  )
  if (duplicate) return 'This relationship already exists.'

  if (PARENT_LIKE.has(edge.type)) {
    // adding fromId as ancestor of toId must not create a cycle:
    // toId must not already be an ancestor of fromId
    const ancestors = new Set()
    const stack = [edge.fromId]
    while (stack.length) {
      for (const p of parentsOf(stack.pop(), relationships)) {
        if (!ancestors.has(p)) {
          ancestors.add(p)
          stack.push(p)
        }
      }
    }
    if (ancestors.has(edge.toId)) {
      return 'This would make someone their own ancestor.'
    }
  }
  return null
}

/**
 * Human label for the edge as seen from `memberId`'s perspective.
 * e.g. a 'parent' edge pointing at me reads "Parent"; pointing away reads "Child".
 */
export function edgeLabelFor(memberId, rel) {
  const outgoing = rel.fromId === memberId
  switch (rel.type) {
    case 'parent':
      return outgoing ? 'Child' : 'Parent'
    case 'adopted':
      return outgoing ? 'Adopted child' : 'Adoptive parent'
    case 'guardian':
      return outgoing ? 'Ward' : 'Guardian'
    case 'spouse':
      return 'Spouse'
    default:
      return rel.type
  }
}
