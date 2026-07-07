import L from 'leaflet'
import { colorFromName, initials } from '@/shared/utils/color'

/** Escape user text before it enters Leaflet's HTML-string divIcon. */
function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * divIcon for a member node. Pure factory — no map or store knowledge.
 * @param {import('@/shared/types/typedefs').Member} member
 * @param {{selected?: boolean, dimmed?: boolean}} state
 */
export function createMemberIcon(member, { selected = false, dimmed = false } = {}) {
  const classes = [
    'kin-marker',
    selected && 'kin-marker--selected',
    dimmed && 'kin-marker--dimmed',
  ]
    .filter(Boolean)
    .join(' ')

  const avatar = member.photoUrl
    ? `<img src="${escapeHtml(member.photoUrl)}" alt="" draggable="false" />`
    : escapeHtml(initials(member.name))

  const bg = member.photoUrl ? '' : `style="background:${colorFromName(member.name)}"`

  return L.divIcon({
    className: '', // suppress leaflet's default white box
    iconSize: [96, 72],
    iconAnchor: [48, 24], // avatar center = the member's graph position
    html: `
      <div class="${classes}">
        <div class="kin-marker__avatar" ${bg}>${avatar}</div>
        <div class="kin-marker__label">${escapeHtml(member.name)}</div>
      </div>`,
  })
}

/** Polyline style per relationship type. */
export function edgeStyle(type, { highlighted = false, dimmed = false } = {}) {
  const base = {
    parent: { color: '#6366f1', weight: 2.5, dashArray: null },
    adopted: { color: '#6366f1', weight: 2.5, dashArray: '6 6' },
    guardian: { color: '#94a3b8', weight: 2, dashArray: '2 6' },
    spouse: { color: '#ec4899', weight: 2.5, dashArray: null },
  }[type] ?? { color: '#94a3b8', weight: 2, dashArray: null }

  return {
    ...base,
    opacity: dimmed ? 0.12 : highlighted ? 0.95 : 0.55,
    weight: highlighted ? base.weight + 1 : base.weight,
    interactive: false,
  }
}
