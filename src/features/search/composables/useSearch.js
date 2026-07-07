import { computed, ref } from 'vue'
import { useFamilyStore } from '@/features/family/store/familyStore'
import { useMapStore } from '@/features/map/store/mapStore'
import { useDebouncedRef } from '@/shared/composables/useDebouncedRef'

const MAX_RESULTS = 8

export function useSearch() {
  const family = useFamilyStore()
  const mapStore = useMapStore()

  const query = ref('')
  const debouncedQuery = useDebouncedRef(query, 200)

  const results = computed(() => {
    const q = debouncedQuery.value.trim().toLowerCase()
    if (!q) return []
    return family.membersArray
      .filter((m) => m.name.toLowerCase().includes(q))
      .sort((a, b) => {
        // prefix matches first, then alphabetical
        const aPrefix = a.name.toLowerCase().startsWith(q) ? 0 : 1
        const bPrefix = b.name.toLowerCase().startsWith(q) ? 0 : 1
        return aPrefix - bPrefix || a.name.localeCompare(b.name)
      })
      .slice(0, MAX_RESULTS)
  })

  function jumpTo(memberId) {
    mapStore.jumpTo(memberId)
    query.value = ''
  }

  return { query, results, jumpTo }
}
