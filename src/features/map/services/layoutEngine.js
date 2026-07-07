/**
 * Initial canvas positions for new members. Users can always drag afterwards;
 * this only needs to produce a sensible, non-overlapping starting point.
 * y grows downward (children conventionally sit below parents).
 */
export const GENERATION_GAP = 160
export const SIBLING_GAP = 140

function isTaken(members, x, y) {
  return members.some(
    (m) =>
      Math.abs(m.posX - x) < SIBLING_GAP * 0.6 &&
      Math.abs(m.posY - y) < GENERATION_GAP * 0.5,
  )
}

/**
 * Spawn a new member at the first free spot right of the current view center.
 * @param {import('@/shared/types/typedefs').Member[]} members
 * @param {{x: number, y: number}} viewCenter current map center in graph coords
 */
export function spawnPosition(members, viewCenter = { x: 0, y: 0 }) {
  let x = viewCenter.x
  const y = viewCenter.y
  while (isTaken(members, x, y)) x += SIBLING_GAP
  return { x, y }
}
