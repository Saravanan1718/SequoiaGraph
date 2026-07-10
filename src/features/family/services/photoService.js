import { supabase } from '@/core/supabase/client'

const BUCKET = 'member-photos'
// Cap the stored image so uploads (and data-URL fallbacks) stay small.
const MAX_DIMENSION = 512
const JPEG_QUALITY = 0.82

/**
 * Downscale a picked image file to a square-ish JPEG. Returns a Blob plus a
 * preview data URL. Keeps photos light whether they land in storage or inline.
 */
export async function processImage(file) {
  const bitmap = await loadBitmap(file)
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close?.()

  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY),
  )
  const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY)
  return { blob, dataUrl }
}

async function loadBitmap(file) {
  if ('createImageBitmap' in window) return createImageBitmap(file)
  // Fallback for browsers without createImageBitmap.
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Persist a processed image for a member and return the URL to store on the
 * member record. Uploads to Supabase Storage when configured; otherwise falls
 * back to an inline data URL so local mode keeps working.
 */
export async function uploadMemberPhoto(memberId, { blob, dataUrl }) {
  if (!supabase) return dataUrl

  const path = `${memberId}/${Date.now()}.jpg`
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { contentType: 'image/jpeg', upsert: true })
  if (error) throw error

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}
