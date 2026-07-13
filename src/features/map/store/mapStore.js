import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useFamilyStore } from '@/features/family/store/familyStore'
import { resolveRelationship } from '@/features/family/services/relationshipResolver'

/** Presentation-only state: selection, highlight, fly-to requests. No domain data. */
export const useMapStore = defineStore('map', () => {
  const family = useFamilyStore()

  const selectedId = ref(null)
  /** Incrementing token consumed by the map to fly to a member. */
  const flyToRequest = ref(null)

  /** Members visually emphasized: the selected member plus everyone connected. */
  const highlightedIds = computed(() =>
    selectedId.value ? family.connectedIds(selectedId.value) : null,
  )

  const selectedMember = computed(() =>
    selectedId.value ? family.memberById(selectedId.value) : null,
  )

  // viewpoint member for derived kinship labels ("Grandmother of …")
  const referenceId = ref(null)
  const referenceMember = computed(() =>
    referenceId.value ? family.memberById(referenceId.value) : null,
  )

  function setReference(id) {
    referenceId.value = id
  }

  /** Derived relationship of `memberId` to the reference member, or null. */
  function relationTo(memberId) {
    if (!referenceId.value) return null
    return resolveRelationship(referenceId.value, memberId, {
      members: family.membersArray,
      relationships: family.relationshipsArray,
    })
  }

  function select(id) {
    selectedId.value = id
  }

  function clearSelection() {
    selectedId.value = null
  }

  function jumpTo(id) {
    selectedId.value = id
    flyToRequest.value = { id, token: (flyToRequest.value?.token ?? 0) + 1 }
  }

  return {
    selectedId,
    selectedMember,
    referenceId,
    referenceMember,
    setReference,
    relationTo,
    highlightedIds,
    flyToRequest,
    select,
    clearSelection,
    jumpTo,
  }
})
