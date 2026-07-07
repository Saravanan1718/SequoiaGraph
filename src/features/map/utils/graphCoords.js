import L from 'leaflet'

/**
 * The single x/y ↔ Leaflet conversion point.
 *
 * With L.CRS.Simple, latLng is (y, x) on a flat plane. We keep app-facing
 * y growing DOWNWARD (children below parents, like screen coords), so y maps
 * to -lat. Nothing outside this module may convert coordinates.
 */

/** @returns {L.LatLng} */
export function toLatLng(x, y) {
  return L.latLng(-y, x)
}

/** @returns {{x: number, y: number}} */
export function fromLatLng(latlng) {
  return { x: latlng.lng, y: -latlng.lat }
}
