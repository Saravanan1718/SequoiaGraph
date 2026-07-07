import { supabase } from '@/core/supabase/client'
import { treeFromRow } from '@/features/family/services/mappers'
import { localDb } from '@/features/family/services/localDb'

/** @returns {Promise<Array<{id: string, name: string, createdAt: string|null, memberCount: number}>>} */
export async function fetchTrees() {
  if (!supabase) return localDb.listTrees()
  const { data, error } = await supabase
    .from('trees')
    .select('*, members(count)')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data.map(treeFromRow)
}

export async function insertTree(tree) {
  if (!supabase) return localDb.insertTree(tree)
  const { error } = await supabase
    .from('trees')
    .insert({ id: tree.id, name: tree.name })
  if (error) throw error
}

export async function renameTree(id, name) {
  if (!supabase) return localDb.updateTree(id, { name })
  const { error } = await supabase.from('trees').update({ name }).eq('id', id)
  if (error) throw error
}

export async function deleteTree(id) {
  if (!supabase) return localDb.deleteTree(id)
  // members + relationships cascade via FK
  const { error } = await supabase.from('trees').delete().eq('id', id)
  if (error) throw error
}
