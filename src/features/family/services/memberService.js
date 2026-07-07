import { supabase } from '@/core/supabase/client'
import { memberFromRow, memberToRow } from './mappers'
import { localDb } from './localDb'

/** @returns {Promise<import('@/shared/types/typedefs').Member[]>} */
export async function fetchMembers() {
  if (!supabase) return localDb.listMembers()
  const { data, error } = await supabase.from('members').select('*')
  if (error) throw error
  return data.map(memberFromRow)
}

export async function upsertMember(member) {
  if (!supabase) return localDb.upsertMember(member)
  const { error } = await supabase.from('members').upsert(memberToRow(member))
  if (error) throw error
}

export async function deleteMember(id) {
  if (!supabase) return localDb.deleteMember(id)
  // relationships cascade via FK
  const { error } = await supabase.from('members').delete().eq('id', id)
  if (error) throw error
}
