import { PARENT_LIKE, parentsOf, spousesOf } from '@/features/family/utils/kinship'

/**
 * Canvas layout. Users can always drag nodes afterwards — these functions
 * only produce sensible default positions. y grows downward: one generation
 * per row, children below parents, spouses side by side.
 */
export const GENERATION_GAP = 180
export const SIBLING_GAP = 160

function isTaken(members, x, y) {
  return members.some(
    (m) =>
      Math.abs(m.posX - x) < SIBLING_GAP * 0.6 &&
      Math.abs(m.posY - y) < GENERATION_GAP * 0.5,
  )
}

/** Slide right from (x, y) until the spot is free. */
function firstFreeSpot(members, x, y) {
  while (isTaken(members, x, y)) x += SIBLING_GAP
  return { x, y }
}

/**
 * Spawn a brand-new (unlinked) member near the current view center.
 * @param {import('@/shared/types/typedefs').Member[]} members
 */
export function spawnPosition(members, viewCenter = { x: 0, y: 0 }) {
  return firstFreeSpot(members, viewCenter.x, viewCenter.y)
}

/**
 * Neat spot for a member the moment its FIRST relationship is created:
 * spouse beside the partner, parent one row above, child one row below.
 * @param {import('@/shared/types/typedefs').Relationship} rel the new edge
 * @param {string} newcomerId the member to place (rel's other end is the anchor)
 * @returns {{x: number, y: number}|null}
 */
export function positionRelativeTo(rel, newcomerId, members) {
  const anchorId = rel.fromId === newcomerId ? rel.toId : rel.fromId
  const anchor = members.find((m) => m.id === anchorId)
  if (!anchor) return null

  let x = anchor.posX
  let y = anchor.posY
  if (rel.type === 'spouse') {
    x += SIBLING_GAP
  } else if (PARENT_LIKE.has(rel.type)) {
    // from = parent-figure, to = child
    y += rel.fromId === newcomerId ? -GENERATION_GAP : GENERATION_GAP
  } else {
    return null
  }
  return firstFreeSpot(members.filter((m) => m.id !== newcomerId), x, y)
}

/**
 * Full generational layout of the whole graph:
 *  1. depth = longest parent-chain above a member; couples aligned to the
 *     deeper partner so spouses share a row.
 *  2. Couples are laid out as one unit; rows are placed top-down, each
 *     member pulled toward the midpoint of its parents, then de-overlapped.
 *
 * @param {import('@/shared/types/typedefs').Member[]} members
 * @param {import('@/shared/types/typedefs').Relationship[]} relationships
 * @returns {Map<string, {x: number, y: number}>} new position per member id
 */
export function autoLayout(members, relationships) {
  const positions = new Map()
  if (members.length === 0) return positions

  // -- 1. generation depth (memoized longest ancestor chain; cycles are
  //       impossible thanks to validateEdge)
  const depth = new Map()
  function depthOf(id) {
    if (depth.has(id)) return depth.get(id)
    depth.set(id, 0) // guard for unexpected data
    const parents = parentsOf(id, relationships)
    const d = parents.length ? 1 + Math.max(...parents.map(depthOf)) : 0
    depth.set(id, d)
    return d
  }
  members.forEach((m) => depthOf(m.id))

  // align couples onto the deeper partner's row (a few passes settle chains)
  for (let pass = 0; pass < 3; pass += 1) {
    for (const m of members) {
      for (const sid of spousesOf(m.id, relationships)) {
        const d = Math.max(depth.get(m.id) ?? 0, depth.get(sid) ?? 0)
        depth.set(m.id, d)
        depth.set(sid, d)
      }
    }
  }

  // -- 2. group into units (couple or single), bucketed per generation
  const inUnit = new Set()
  const rows = new Map() // depth -> units; unit = { ids: [..], desiredX }
  for (const m of members) {
    if (inUnit.has(m.id)) continue
    const partner = spousesOf(m.id, relationships).find((sid) => !inUnit.has(sid))
    const ids = partner ? [m.id, partner] : [m.id]
    ids.forEach((id) => inUnit.add(id))
    const d = depth.get(m.id) ?? 0
    if (!rows.has(d)) rows.set(d, [])
    rows.get(d).push({ ids })
  }

  const rowDepths = [...rows.keys()].sort((a, b) => a - b)
  const byId = new Map(members.map((m) => [m.id, m]))

  for (const d of rowDepths) {
    const units = rows.get(d)
    const y = d * GENERATION_GAP

    for (const unit of units) {
      // pull toward parents' midpoint; fall back to current position so an
      // already-arranged (or user-dragged) order is respected as a tiebreak
      const anchors = unit.ids.flatMap((id) =>
        parentsOf(id, relationships)
          .map((pid) => positions.get(pid)?.x)
          .filter((x) => x !== undefined),
      )
      unit.desiredX = anchors.length
        ? anchors.reduce((a, b) => a + b, 0) / anchors.length
        : unit.ids.reduce((a, id) => a + (byId.get(id)?.posX ?? 0), 0) / unit.ids.length
    }

    // de-overlap: sort by desired x, then enforce minimum spacing
    units.sort((a, b) => a.desiredX - b.desiredX)
    let cursor = -Infinity
    for (const unit of units) {
      const width = (unit.ids.length - 1) * SIBLING_GAP
      let startX = unit.desiredX - width / 2
      if (startX < cursor) startX = cursor
      unit.ids.forEach((id, i) => positions.set(id, { x: startX + i * SIBLING_GAP, y }))
      cursor = startX + width + SIBLING_GAP
    }
  }

  return positions
}
