import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as treeService from '../services/treeService'
import * as saveQueue from '@/features/family/services/saveQueue'
import { newId } from '@/shared/utils/id'

/** The user's tree collection (the post-login gallery screen). */
export const useTreesStore = defineStore('trees', () => {
  const trees = ref([])
  const loadStatus = ref('idle') // idle | loading | ready | error

  async function fetchAll() {
    loadStatus.value = 'loading'
    try {
      trees.value = await treeService.fetchTrees()
      loadStatus.value = 'ready'
    } catch (err) {
      console.error('[treesStore] load failed', err)
      loadStatus.value = 'error'
    }
  }

  function treeById(id) {
    return trees.value.find((t) => t.id === id)
  }

  /** Optimistic create; returns the new tree. */
  function createTree(name) {
    const tree = { id: newId(), name, createdAt: null, memberCount: 0 }
    trees.value.push(tree)
    saveQueue.run(() => treeService.insertTree(tree))
    return tree
  }

  function renameTree(id, name) {
    const tree = treeById(id)
    if (!tree) return
    tree.name = name
    saveQueue.schedule(`tree:${id}`, () => treeService.renameTree(id, name))
  }

  function deleteTree(id) {
    trees.value = trees.value.filter((t) => t.id !== id)
    saveQueue.run(() => treeService.deleteTree(id))
  }

  function clear() {
    trees.value = []
    loadStatus.value = 'idle'
  }

  return { trees, loadStatus, fetchAll, treeById, createTree, renameTree, deleteTree, clear }
})
