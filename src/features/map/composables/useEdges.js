import L from 'leaflet'
import { watchEffect } from 'vue'
import { useFamilyStore } from '@/features/family/store/familyStore'
import { useMapStore } from '../store/mapStore'
import { edgeStyle } from '../services/leafletRenderer'
import { toLatLng } from '../utils/graphCoords'

/**
 * Syncs relationships → polylines on a shared canvas renderer.
 * Rebuilt reactively when relationships, member positions, or the
 * selection highlight change. Canvas keeps thousands of lines cheap.
 *
 * @param {import('vue').ShallowRef<L.Map|null>} map
 */
export function useEdges(map) {
  const family = useFamilyStore()
  const mapStore = useMapStore()

  const renderer = L.canvas({ padding: 0.5 })
  const layer = L.layerGroup()

  watchEffect(() => {
    if (!map.value) return
    if (!map.value.hasLayer(layer)) layer.addTo(map.value)

    layer.clearLayers()
    const highlighted = mapStore.highlightedIds

    for (const rel of family.relationshipsArray) {
      const from = family.memberById(rel.fromId)
      const to = family.memberById(rel.toId)
      if (!from || !to) continue

      const isHighlighted =
        highlighted !== null && highlighted.has(rel.fromId) && highlighted.has(rel.toId)
      const isDimmed = highlighted !== null && !isHighlighted

      layer.addLayer(
        L.polyline(
          [toLatLng(from.posX, from.posY), toLatLng(to.posX, to.posY)],
          { renderer, ...edgeStyle(rel.type, { highlighted: isHighlighted, dimmed: isDimmed }) },
        ),
      )
    }
  })
}
