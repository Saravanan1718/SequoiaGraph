import { supabase } from '@/core/supabase/client'

const BUCKET = 'member-photos'

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
