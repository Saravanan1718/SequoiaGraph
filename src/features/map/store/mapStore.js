import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useFamilyStore } from '@/features/family/store/familyStore'

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
    highlightedIds,
    flyToRequest,
    select,
    clearSelection,
    jumpTo,
  }
})
