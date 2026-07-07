import L from 'leaflet'
import { watch, watchEffect } from 'vue'
import { useFamilyStore } from '@/features/family/store/familyStore'
import { useSettingsStore } from '@/features/settings/store/settingsStore'
import { useMapStore } from '../store/mapStore'
import { createMemberIcon } from '../services/leafletRenderer'
import { toLatLng, fromLatLng } from '../utils/graphCoords'

/**
 * Syncs familyStore.members → Leaflet markers (diff-based add/update/remove)
 * and wires marker interaction (click select, drag move) back into stores.
 *
 * Drag streams positions into the store on every move so edges follow live;
 * the save queue coalesces those updates into one write. While a marker is
 * dragging we skip pushing store state back onto it to avoid a feedback loop.
 *
 * @param {import('vue').ShallowRef<L.Map|null>} map
 */
export function useMarkers(map) {
  const family = useFamilyStore()
  const mapStore = useMapStore()
  const settings = useSettingsStore()

  /** @type {Map<string, L.Marker>} */
  const markers = new Map()
  const layer = L.layerGroup()
  let draggingId = null

  function markerState(member) {
    const highlighted = mapStore.highlightedIds
    return {
      selected: mapStore.selectedId === member.id,
      dimmed: highlighted !== null && !highlighted.has(member.id),
    }
  }

  function createMarker(member) {
    const marker = L.marker(toLatLng(member.posX, member.posY), {
      icon: createMemberIcon(member, markerState(member), settings.styles.node),
      draggable: true,
      keyboard: false,
    })
    const id = member.id
    marker.on('click', () => mapStore.select(id))
    marker.on('dragstart', () => {
      draggingId = id
      mapStore.select(id)
    })
    marker.on('drag', () => {
      const { x, y } = fromLatLng(marker.getLatLng())
      family.moveMember(id, x, y)
    })
    marker.on('dragend', () => {
      draggingId = null
      const { x, y } = fromLatLng(marker.getLatLng())
      family.moveMember(id, x, y)
    })
    return marker
  }

  watchEffect(() => {
    if (!map.value) return
    if (!map.value.hasLayer(layer)) layer.addTo(map.value)

    const current = family.members // shallowRef Map — tracked
    // additions & updates
    for (const member of current.values()) {
      const existing = markers.get(member.id)
      if (!existing) {
        const marker = createMarker(member)
        markers.set(member.id, marker)
        layer.addLayer(marker)
      } else if (member.id !== draggingId) {
        existing.setLatLng(toLatLng(member.posX, member.posY))
        existing.setIcon(createMemberIcon(member, markerState(member), settings.styles.node))
      }
    }
    // removals
    for (const [id, marker] of markers) {
      if (!current.has(id)) {
        layer.removeLayer(marker)
        markers.delete(id)
      }
    }
  })

  // click on empty canvas clears selection
  watch(map, (m) => {
    m?.on('click', () => mapStore.clearSelection())
  })
}
