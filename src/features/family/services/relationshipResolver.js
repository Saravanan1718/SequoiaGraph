import { parentsOf, spousesOf } from '../utils/kinship'

/**
 * RelationshipResolver — derives extended kinship (grandparent, uncle, cousin,
 * in-laws, …) from the stored base edges (parent-like + spouse) at call time.
 * Pure and renderer-independent: plain data in, a label out. Derived
 * relationships are never persisted.
 */

/** Pick a label by gender with a neutral fallback. */
const byGender = (gender, male, female, neutral) =>
  gender === 'male' ? male : gender === 'female' ? female : neutral

/** "Grandfather" → "Great-great-grandfather" for n = 2. */
const withGreats = (n, base) => {
  if (n <= 0) return base
  const label = 'great-'.repeat(n) + base.toLowerCase()
  return label[0].toUpperCase() + label.slice(1)
}

const ordinal = (n) => {
  const suffix = { 1: 'st', 2: 'nd', 3: 'rd' }[n % 100 > 10 && n % 100 < 14 ? 0 : n % 10] ?? 'th'
  return `${n}${suffix}`
}

const removedSuffix = (n) =>
  n === 0 ? '' : n === 1 ? ' once removed' : n === 2 ? ' twice removed' : ` ${n}× removed`

/** Map of ancestorId → minimum generations up from `id` (self included at 0). */
function ancestorDepths(id, relationships) {
  const depths = new Map([[id, 0]])
  const queue = [id]
  while (queue.length) {
    const current = queue.shift()
    for (const parent of parentsOf(current, relationships)) {
      if (!depths.has(parent)) {
        depths.set(parent, depths.get(current) + 1)
        queue.push(parent)
      }
    }
  }
  return depths
}

/**
 * Blood relation between two members via their nearest common ancestor.
 * @returns {{up: number, down: number}|null} generations a→ancestor and ancestor→b
 */
export function bloodRelation(aId, bId, relationships) {
  const fromA = ancestorDepths(aId, relationships)
  const fromB = ancestorDepths(bId, relationships)
  let best = null
  for (const [ancestor, up] of fromA) {
    const down = fromB.get(ancestor)
    if (down === undefined) continue
    if (!best || up + down < best.up + best.down) best = { up, down }
  }
  return best
}

/** Human label for a blood relation, from the reference member's viewpoint. */
function bloodLabel({ up, down }, gender) {
  if (up === 0 && down === 0) return 'Self'
  if (down === 0) {
    if (up === 1) return byGender(gender, 'Father', 'Mother', 'Parent')
    return withGreats(up - 2, byGender(gender, 'Grandfather', 'Grandmother', 'Grandparent'))
  }
  if (up === 0) {
    if (down === 1) return byGender(gender, 'Son', 'Daughter', 'Child')
    return withGreats(down - 2, byGender(gender, 'Grandson', 'Granddaughter', 'Grandchild'))
  }
  if (up === 1 && down === 1) return byGender(gender, 'Brother', 'Sister', 'Sibling')
  if (down === 1) return withGreats(up - 2, byGender(gender, 'Uncle', 'Aunt', 'Uncle/Aunt'))
  if (up === 1) return withGreats(down - 2, byGender(gender, 'Nephew', 'Niece', 'Nephew/Niece'))
  return `${ordinal(Math.min(up, down) - 1)} cousin${removedSuffix(Math.abs(up - down))}`
}

/** In-law / step labels reached through exactly one spouse edge. */
function affinalLabel(aId, bId, relationships, genderOf) {
  const gender = genderOf(bId)

  // b is blood kin of a's spouse (father-in-law, stepchild, …)
  for (const spouse of spousesOf(aId, relationships)) {
    const rel = bloodRelation(spouse, bId, relationships)
    if (!rel) continue
    if (rel.up === 1 && rel.down === 0)
      return byGender(gender, 'Father-in-law', 'Mother-in-law', 'Parent-in-law')
    if (rel.up === 1 && rel.down === 1)
      return byGender(gender, 'Brother-in-law', 'Sister-in-law', 'Sibling-in-law')
    if (rel.up === 0 && rel.down === 1)
      return byGender(gender, 'Stepson', 'Stepdaughter', 'Stepchild')
    return `${bloodLabel(rel, gender)} (by marriage)`
  }

  // b is the spouse of a's blood kin (son-in-law, stepmother, aunt by marriage, …)
  for (const spouse of spousesOf(bId, relationships)) {
    const rel = bloodRelation(aId, spouse, relationships)
    if (!rel) continue
    if (rel.up === 0 && rel.down === 1)
      return byGender(gender, 'Son-in-law', 'Daughter-in-law', 'Child-in-law')
    if (rel.up === 1 && rel.down === 1)
      return byGender(gender, 'Brother-in-law', 'Sister-in-law', 'Sibling-in-law')
    if (rel.up === 1 && rel.down === 0)
      return byGender(gender, 'Stepfather', 'Stepmother', 'Stepparent')
    return `${bloodLabel(rel, gender)} (by marriage)`
  }

  return null
}

/**
 * What `memberId` is to `referenceId`, e.g. "Grandmother", "1st cousin".
 * @param {string} referenceId  the viewpoint member
 * @param {string} memberId     the member being described
 * @param {{members: Map<string, Object>|Object[], relationships: Object[]}} data
 * @returns {string|null} label, or null when no relation can be derived
 */
export function resolveRelationship(referenceId, memberId, { members, relationships }) {
  if (!referenceId || !memberId) return null
  const list = members instanceof Map ? [...members.values()] : members
  const genderOf = (id) => list.find((m) => m.id === id)?.gender ?? null

  if (referenceId === memberId) return 'Self'

  if (spousesOf(referenceId, relationships).includes(memberId)) {
    return byGender(genderOf(memberId), 'Husband', 'Wife', 'Spouse')
  }

  const blood = bloodRelation(referenceId, memberId, relationships)
  if (blood) return bloodLabel(blood, genderOf(memberId))

  return affinalLabel(referenceId, memberId, relationships, genderOf)
}
