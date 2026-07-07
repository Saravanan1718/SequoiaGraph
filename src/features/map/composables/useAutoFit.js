import L from 'leaflet'
import { watch } from 'vue'
import { useFamilyStore } from '@/features/family/store/familyStore'
import { useMapStore } from '../store/mapStore'
import { toLatLng } from '../utils/graphCoords'

/**
 * fitAll() — frame every member; also honors mapStore.jumpTo() fly-to requests.
 * @param {import('vue').ShallowRef<L.Map|null>} map
 */
export function useAutoFit(map) {
  const family = useFamilyStore()
  const mapStore = useMapStore()

  function fitAll({ animate = true } = {}) {
    const m = map.value
    const members = family.membersArray
    if (!m || members.length === 0) return
    const bounds = L.latLngBounds(members.map((mem) => toLatLng(mem.posX, mem.posY)))
    m.fitBounds(bounds.pad(0.25), { animate, maxZoom: 2 })
  }

  watch(
    () => mapStore.flyToRequest,
    (req) => {
      const member = req && family.memberById(req.id)
      if (!member || !map.value) return
      map.value.flyTo(toLatLng(member.posX, member.posY), Math.max(map.value.getZoom(), 1.5), {
        duration: 0.8,
      })
    },
  )

  return { fitAll }
}
