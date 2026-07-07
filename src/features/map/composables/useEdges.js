import L from 'leaflet'
import { watchEffect } from 'vue'
import { useFamilyStore } from '@/features/family/store/familyStore'
import { useSettingsStore } from '@/features/settings/store/settingsStore'
import { useMapStore } from '../store/mapStore'
import { edgeStyle } from '../services/leafletRenderer'
import { computeEdgePaths } from '../utils/edgeRouting'
import { toLatLng } from '../utils/graphCoords'

/**
 * Draws genealogy connectors (couple bars, ┬-drops, elbows) as polylines on
 * a shared canvas renderer. Geometry comes from edgeRouting; rebuilt
 * reactively on relationship, position, highlight, or style changes.
 *
 * @param {import('vue').ShallowRef<L.Map|null>} map
 */
export function useEdges(map) {
  const family = useFamilyStore()
  const mapStore = useMapStore()
  const settings = useSettingsStore()

  const renderer = L.canvas({ padding: 0.5 })
  const layer = L.layerGroup()

  watchEffect(() => {
    if (!map.value) return
    if (!map.value.hasLayer(layer)) layer.addTo(map.value)

    layer.clearLayers()
    const highlighted = mapStore.highlightedIds
    const paths = computeEdgePaths(family.membersArray, family.relationshipsArray)

    for (const path of paths) {
      const isHighlighted =
        highlighted !== null && path.memberIds.every((id) => highlighted.has(id))
      const isDimmed = highlighted !== null && !isHighlighted

      layer.addLayer(
        L.polyline(
          path.points.map((p) => toLatLng(p.x, p.y)),
          {
            renderer,
            ...edgeStyle(
              path.type,
              { highlighted: isHighlighted, dimmed: isDimmed },
              settings.styles.edges,
            ),
          },
        ),
      )
    }
  })
}
