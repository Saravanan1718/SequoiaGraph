import { PARENT_LIKE, spousesOf } from '@/features/family/utils/kinship'

/**
 * Classic genealogy connector routing. Pure geometry in graph coords —
 * shared by the live Leaflet layer and the PNG/PDF exporter.
 *
 *  - Spouses: a straight "couple bar" between the two nodes.
 *  - A child of two parents who are a couple: one drop line from the
 *    couple bar's midpoint, elbow-routed to the child (┬ shape).
 *  - Any other parent-like edge: elbow from the parent to the child.
 *
 * @param {import('@/shared/types/typedefs').Member[]} members
 * @param {import('@/shared/types/typedefs').Relationship[]} relationships
 * @returns {Array<{key: string, type: string, memberIds: string[], points: {x:number,y:number}[]}>}
 */
export function computeEdgePaths(members, relationships) {
  const byId = new Map(members.map((m) => [m.id, m]))
  const paths = []

  /** Vertical elbow: start → down to mid-Y → across → into end. */
  function elbow(start, end) {
    const midY = start.y + (end.y - start.y) / 2
    if (Math.abs(start.x - end.x) < 1) return [start, end]
    return [start, { x: start.x, y: midY }, { x: end.x, y: midY }, end]
  }

  // couple bars
  for (const rel of relationships) {
    if (rel.type !== 'spouse') continue
    const a = byId.get(rel.fromId)
    const b = byId.get(rel.toId)
    if (!a || !b) continue
    paths.push({
      key: rel.id,
      type: 'spouse',
      memberIds: [a.id, b.id],
      points: [
        { x: a.posX, y: a.posY },
        { x: b.posX, y: b.posY },
      ],
    })
  }

  // group parent-like edges per child
  const parentEdgesByChild = new Map()
  for (const rel of relationships) {
    if (!PARENT_LIKE.has(rel.type)) continue
    if (!parentEdgesByChild.has(rel.toId)) parentEdgesByChild.set(rel.toId, [])
    parentEdgesByChild.get(rel.toId).push(rel)
  }

  for (const [childId, edges] of parentEdgesByChild) {
    const child = byId.get(childId)
    if (!child) continue
    const childPt = { x: child.posX, y: child.posY }

    // two parents forming a couple → single drop from the bar midpoint
    if (edges.length === 2 && edges[0].type === edges[1].type) {
      const p1 = byId.get(edges[0].fromId)
      const p2 = byId.get(edges[1].fromId)
      const coupled = p1 && p2 && spousesOf(p1.id, relationships).includes(p2.id)
      if (coupled) {
        const junction = {
          x: (p1.posX + p2.posX) / 2,
          y: (p1.posY + p2.posY) / 2,
        }
        paths.push({
          key: `${edges[0].id}+${edges[1].id}`,
          type: edges[0].type,
          memberIds: [p1.id, p2.id, childId],
          points: elbow(junction, childPt),
        })
        continue
      }
    }

    // otherwise, one elbow per parent edge
    for (const rel of edges) {
      const parent = byId.get(rel.fromId)
      if (!parent) continue
      paths.push({
        key: rel.id,
        type: rel.type,
        memberIds: [parent.id, childId],
        points: elbow({ x: parent.posX, y: parent.posY }, childPt),
      })
    }
  }

  return paths
}
