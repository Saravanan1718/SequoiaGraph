import { supabase } from '@/core/supabase/client'
import { relationshipFromRow, relationshipToRow } from './mappers'
import { localDb } from './localDb'

/** @returns {Promise<import('@/shared/types/typedefs').Relationship[]>} */
export async function fetchRelationships(treeId) {
  if (!supabase) return localDb.listRelationships(treeId)
  const { data, error } = await supabase
    .from('relationships')
    .select('*')
    .eq('tree_id', treeId)
  if (error) throw error
  return data.map(relationshipFromRow)
}

export async function insertRelationship(rel) {
  if (!supabase) return localDb.insertRelationship(rel)
  const { error } = await supabase
    .from('relationships')
    .insert(relationshipToRow(rel))
  if (error) throw error
}

export async function deleteRelationship(id) {
  if (!supabase) return localDb.deleteRelationship(id)
  const { error } = await supabase.from('relationships').delete().eq('id', id)
  if (error) throw error
}
