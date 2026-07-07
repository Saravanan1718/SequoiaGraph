import L from 'leaflet'
import { colorFromName, initials } from '@/shared/utils/color'
import { DEFAULT_STYLES } from '@/features/settings/store/settingsStore'

/** Escape user text before it enters Leaflet's HTML-string divIcon. */
function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

const ICON_WIDTH = 120

/**
 * divIcon for a member node. Pure factory — no map or store knowledge.
 * @param {import('@/shared/types/typedefs').Member} member
 * @param {{selected?: boolean, dimmed?: boolean}} state
 * @param {{size: number, ringColor: string, showLabels: boolean}} nodeStyle
 */
export function createMemberIcon(
  member,
  { selected = false, dimmed = false } = {},
  nodeStyle = DEFAULT_STYLES.node,
) {
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

  const { size, ringColor, showLabels } = nodeStyle
  const avatarStyle = [
    `width:${size}px`,
    `height:${size}px`,
    `border-color:${ringColor}`,
    `font-size:${Math.max(11, size * 0.3)}px`,
    member.photoUrl ? '' : `background:${colorFromName(member.name)}`,
  ]
    .filter(Boolean)
    .join(';')

  const label = showLabels
    ? `<div class="kin-marker__label">${escapeHtml(member.name)}</div>`
    : ''

  return L.divIcon({
    className: '', // suppress leaflet's default white box
    iconSize: [ICON_WIDTH, size + (showLabels ? 26 : 0)],
    iconAnchor: [ICON_WIDTH / 2, size / 2], // avatar center = graph position
    html: `
      <div class="${classes}">
        <div class="kin-marker__avatar" style="${avatarStyle}">${avatar}</div>
        ${label}
      </div>`,
  })
}

const EDGE_SHAPES = {
  parent: { weight: 2.5, dashArray: null },
  adopted: { weight: 2.5, dashArray: '6 6' },
  guardian: { weight: 2, dashArray: '2 6' },
  spouse: { weight: 3, dashArray: null },
}

/**
 * Polyline style per relationship type.
 * @param {string} type
 * @param {{highlighted?: boolean, dimmed?: boolean}} state
 * @param {Record<string, string>} colors per-type color overrides
 */
export function edgeStyle(
  type,
  { highlighted = false, dimmed = false } = {},
  colors = DEFAULT_STYLES.edges,
) {
  const shape = EDGE_SHAPES[type] ?? { weight: 2, dashArray: null }
  return {
    ...shape,
    color: colors[type] ?? '#94a3b8',
    opacity: dimmed ? 0.12 : highlighted ? 0.95 : 0.55,
    weight: highlighted ? shape.weight + 1 : shape.weight,
    lineJoin: 'round',
    interactive: false,
  }
}
