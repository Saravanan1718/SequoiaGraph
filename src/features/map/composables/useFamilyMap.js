import L from 'leaflet'
import { onBeforeUnmount, onMounted, shallowRef } from 'vue'
import { fromLatLng } from '../utils/graphCoords'

/**
 * Owns the Leaflet map lifecycle: an infinite CRS.Simple canvas.
 * @param {import('vue').Ref<HTMLElement|null>} containerRef
 */
export function useFamilyMap(containerRef) {
  /** @type {import('vue').ShallowRef<L.Map|null>} */
  const map = shallowRef(null)

  onMounted(() => {
    map.value = L.map(containerRef.value, {
      crs: L.CRS.Simple,
      center: [0, 0],
      zoom: 1,
      minZoom: -3,
      maxZoom: 4,
      zoomSnap: 0.25,
      zoomControl: false,
      attributionControl: false,
      // graph canvas, not a map: no world bounds, inertia for smooth pan
      inertia: true,
    })
  })

  onBeforeUnmount(() => {
    map.value?.remove()
    map.value = null
  })

  /** Current view center in graph coordinates (for spawning new members). */
  function viewCenter() {
    if (!map.value) return { x: 0, y: 0 }
    return fromLatLng(map.value.getCenter())
  }

  return { map, viewCenter }
}
