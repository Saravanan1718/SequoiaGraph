import { onUnmounted } from 'vue'
import { useFamilyStore } from '@/features/family/store/familyStore'
import { autoLayout, positionRelativeTo } from '../services/layoutEngine'

/**
 * Automatic neat positioning, without the family store knowing about layout:
 *
 *  - Subscribes to addRelationship. When one end of the new edge is a
 *    "newcomer" (that edge is their only relationship), it snaps them next
 *    to their anchor: spouse beside, parent above, child below. Members
 *    already woven into the tree are never moved — dragging stays king.
 *  - Exposes arrangeAll() for the toolbar's Auto-arrange button.
 */
export function useAutoPlacement() {
  const family = useFamilyStore()

  const unsubscribe = family.$onAction(({ name, args, after }) => {
    if (name !== 'addRelationship') return
    after((error) => {
      if (error !== null) return // validation rejected the edge
      const [edge] = args
      const newcomerId = [edge.fromId, edge.toId].find(
        (id) => family.relationshipsOf(id).length === 1,
      )
      if (!newcomerId) return
      const pos = positionRelativeTo(edge, newcomerId, family.membersArray)
      if (pos) family.moveMember(newcomerId, pos.x, pos.y)
    })
  })
  onUnmounted(unsubscribe)

  function arrangeAll() {
    const positions = autoLayout(family.membersArray, family.relationshipsArray)
    for (const [id, pos] of positions) family.moveMember(id, pos.x, pos.y)
  }

  return { arrangeAll }
}
