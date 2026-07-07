import { computeEdgePaths } from '../utils/edgeRouting'
import { colorFromName, initials } from '@/shared/utils/color'

/**
 * Renders the whole tree to an offscreen canvas at print resolution
 * (independent of the current zoom) and downloads it as PNG or PDF.
 * Reuses edgeRouting so exported connectors match the live map exactly.
 */

const SCALE = 2 // canvas px per graph unit
const MAX_CANVAS = 6000 // safety cap (px, longest side)
const CONTENT_PADDING = 120 // graph-units of whitespace around the tree
const FRAME_MARGIN = 70 // canvas px reserved for the frame + title band

const EDGE_DASHES = { parent: [], adopted: [12, 12], guardian: [4, 12], spouse: [] }

function loadImage(url) {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous' // required, or the canvas taints and export fails
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null) // fall back to initials
    img.src = url
  })
}

/**
 * @param {import('@/shared/types/typedefs').Member[]} members
 * @param {import('@/shared/types/typedefs').Relationship[]} relationships
 * @param {typeof import('@/features/settings/store/settingsStore').DEFAULT_STYLES} styles
 * @returns {Promise<HTMLCanvasElement>}
 */
export async function renderTreeCanvas(members, relationships, styles) {
  const xs = members.map((m) => m.posX)
  const ys = members.map((m) => m.posY)
  const minX = Math.min(...xs) - CONTENT_PADDING
  const maxX = Math.max(...xs) + CONTENT_PADDING
  const minY = Math.min(...ys) - CONTENT_PADDING
  const maxY = Math.max(...ys) + CONTENT_PADDING

  let scale = SCALE
  const longest = Math.max(maxX - minX, maxY - minY) * scale
  if (longest > MAX_CANVAS) scale *= MAX_CANVAS / longest

  const frame = styles.frame.style === 'none' ? 20 : FRAME_MARGIN
  const width = Math.round((maxX - minX) * scale) + frame * 2
  const height = Math.round((maxY - minY) * scale) + frame * 2 + (styles.frame.title ? 60 : 0)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  const toCanvas = (x, y) => ({
    x: (x - minX) * scale + frame,
    y: (y - minY) * scale + frame + (styles.frame.title ? 60 : 0),
  })

  // background
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)

  drawFrame(ctx, width, height, styles.frame)

  // edges
  for (const path of computeEdgePaths(members, relationships)) {
    ctx.strokeStyle = styles.edges[path.type] ?? '#94a3b8'
    ctx.lineWidth = path.type === 'spouse' ? 4 : 3
    ctx.lineJoin = 'round'
    ctx.setLineDash((EDGE_DASHES[path.type] ?? []).map((d) => d * (scale / SCALE)))
    ctx.beginPath()
    path.points.forEach((p, i) => {
      const c = toCanvas(p.x, p.y)
      i === 0 ? ctx.moveTo(c.x, c.y) : ctx.lineTo(c.x, c.y)
    })
    ctx.stroke()
  }
  ctx.setLineDash([])

  // nodes (photos loaded concurrently up front)
  const radius = (styles.node.size / 2 + 8) * (scale / SCALE)
  const photos = new Map(
    await Promise.all(
      members
        .filter((m) => m.photoUrl)
        .map(async (m) => [m.id, await loadImage(m.photoUrl)]),
    ),
  )

  for (const member of members) {
    const c = toCanvas(member.posX, member.posY)
    const img = photos.get(member.id)

    ctx.save()
    ctx.beginPath()
    ctx.arc(c.x, c.y, radius, 0, Math.PI * 2)
    ctx.fillStyle = colorFromName(member.name)
    ctx.fill()
    if (img) {
      ctx.clip()
      // cover-fit the photo into the circle
      const side = Math.min(img.width, img.height)
      ctx.drawImage(
        img,
        (img.width - side) / 2,
        (img.height - side) / 2,
        side,
        side,
        c.x - radius,
        c.y - radius,
        radius * 2,
        radius * 2,
      )
    } else {
      ctx.fillStyle = '#ffffff'
      ctx.font = `600 ${radius * 0.7}px system-ui, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(initials(member.name), c.x, c.y)
    }
    ctx.restore()

    // ring
    ctx.beginPath()
    ctx.arc(c.x, c.y, radius, 0, Math.PI * 2)
    ctx.strokeStyle = styles.node.ringColor
    ctx.lineWidth = 4 * (scale / SCALE)
    ctx.stroke()

    // label
    if (styles.node.showLabels) {
      ctx.fillStyle = '#1e293b'
      ctx.font = `500 ${13 * (scale / SCALE) * 1.6}px system-ui, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(member.name, c.x, c.y + radius + 8 * (scale / SCALE))
    }
  }

  return canvas
}

function drawFrame(ctx, width, height, frame) {
  if (frame.title) {
    ctx.fillStyle = frame.color
    ctx.font = `600 34px Georgia, 'Times New Roman', serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(frame.title, width / 2, (frame.style === 'none' ? 20 : FRAME_MARGIN) / 2 + 30)
  }
  if (frame.style === 'none') return

  ctx.strokeStyle = frame.color
  const m = FRAME_MARGIN / 2

  if (frame.style === 'simple') {
    ctx.lineWidth = 3
    ctx.strokeRect(m, m, width - m * 2, height - m * 2)
    return
  }

  // classic: double border + corner accents
  ctx.lineWidth = 4
  ctx.strokeRect(m - 8, m - 8, width - (m - 8) * 2, height - (m - 8) * 2)
  ctx.lineWidth = 1.5
  ctx.strokeRect(m + 6, m + 6, width - (m + 6) * 2, height - (m + 6) * 2)
  const tick = 26
  ctx.lineWidth = 3
  for (const [cx, cy, dx, dy] of [
    [m + 6, m + 6, 1, 1],
    [width - m - 6, m + 6, -1, 1],
    [m + 6, height - m - 6, 1, -1],
    [width - m - 6, height - m - 6, -1, -1],
  ]) {
    ctx.beginPath()
    ctx.moveTo(cx + dx * tick, cy)
    ctx.lineTo(cx, cy)
    ctx.lineTo(cx, cy + dy * tick)
    ctx.stroke()
  }
}

function triggerDownload(url, filename) {
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
}

function slug(title) {
  return (title || 'family-tree').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export async function exportPng(members, relationships, styles) {
  const canvas = await renderTreeCanvas(members, relationships, styles)
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
  const url = URL.createObjectURL(blob)
  triggerDownload(url, `${slug(styles.frame.title)}.png`)
  URL.revokeObjectURL(url)
}

export async function exportPdf(members, relationships, styles) {
  const canvas = await renderTreeCanvas(members, relationships, styles)
  const { jsPDF } = await import('jspdf') // lazy: keeps jsPDF out of the main bundle
  const landscape = canvas.width >= canvas.height
  const pdf = new jsPDF({
    orientation: landscape ? 'landscape' : 'portrait',
    unit: 'px',
    format: [canvas.width, canvas.height],
    hotfixes: ['px_scaling'],
  })
  pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width, canvas.height)
  pdf.save(`${slug(styles.frame.title)}.pdf`)
}
