import { defineStore } from 'pinia'
import { computed, ref, shallowRef, triggerRef } from 'vue'
import * as memberService from '../services/memberService'
import * as relationshipService from '../services/relationshipService'
import * as saveQueue from '../services/saveQueue'
import * as kinship from '../utils/kinship'
import { newId } from '@/shared/utils/id'

/**
 * Source of truth for the family graph. All mutations are optimistic:
 * state changes immediately, persistence happens through the save queue.
 */
export const useFamilyStore = defineStore('family', () => {
  /** @type {import('vue').ShallowRef<Map<string, import('@/shared/types/typedefs').Member>>} */
  const members = shallowRef(new Map())
  /** @type {import('vue').ShallowRef<Map<string, import('@/shared/types/typedefs').Relationship>>} */
  const relationships = shallowRef(new Map())
  const loadStatus = ref('idle') // idle | loading | ready | error
  /** The tree all reads/writes are scoped to (set by fetchAll). */
  const activeTreeId = ref(null)

  const membersArray = computed(() => [...members.value.values()])
  const relationshipsArray = computed(() => [...relationships.value.values()])

  const memberById = (id) => members.value.get(id)

  const parentsOf = (id) => kinship.parentsOf(id, relationshipsArray.value)
  const childrenOf = (id) => kinship.childrenOf(id, relationshipsArray.value)
  const spousesOf = (id) => kinship.spousesOf(id, relationshipsArray.value)
  const siblingsOf = (id) => kinship.siblingsOf(id, relationshipsArray.value)
  const connectedIds = (id) => kinship.connectedIds(id, relationshipsArray.value)

  /** All stored edges touching a member, for the detail panel. */
  const relationshipsOf = (id) =>
    relationshipsArray.value.filter((r) => r.fromId === id || r.toId === id)

  async function fetchAll(treeId) {
    activeTreeId.value = treeId
    loadStatus.value = 'loading'
    try {
      const [memberList, relList] = await Promise.all([
        memberService.fetchMembers(treeId),
        relationshipService.fetchRelationships(treeId),
      ])
      members.value = new Map(memberList.map((m) => [m.id, m]))
      relationships.value = new Map(relList.map((r) => [r.id, r]))
      loadStatus.value = 'ready'
    } catch (err) {
      console.error('[familyStore] initial load failed', err)
      loadStatus.value = 'error'
    }
  }

  /** @param {Partial<import('@/shared/types/typedefs').Member>} draft */
  function addMember(draft) {
    const member = {
      id: newId(),
      treeId: activeTreeId.value,
      name: '',
      gender: null,
      photoUrl: null,
      birthDate: null,
      deathDate: null,
      occupation: null,
      notes: null,
      posX: 0,
      posY: 0,
      ...draft,
    }
    members.value.set(member.id, member)
    triggerRef(members)
    saveQueue.run(() => memberService.upsertMember(member))
    return member
  }

  function updateMember(id, patch) {
    const current = members.value.get(id)
    if (!current) return
    const updated = { ...current, ...patch }
    members.value.set(id, updated)
    triggerRef(members)
    saveQueue.schedule(`member:${id}`, () => memberService.upsertMember(updated))
  }

  /** Position updates during drag — same coalescing key as other member edits. */
  function moveMember(id, posX, posY) {
    updateMember(id, { posX, posY })
  }

  function deleteMember(id) {
    if (!members.value.delete(id)) return
    for (const [relId, rel] of relationships.value) {
      if (rel.fromId === id || rel.toId === id) relationships.value.delete(relId)
    }
    triggerRef(members)
    triggerRef(relationships)
    saveQueue.run(() => memberService.deleteMember(id))
  }

  /**
   * @param {{fromId: string, toId: string, type: string}} edge  a stored-form edge
   * @returns {string|null} validation error, or null on success
   */
  function addRelationship(edge) {
    const error = kinship.validateEdge(edge, relationshipsArray.value)
    if (error) return error
    const rel = { id: newId(), treeId: activeTreeId.value, ...edge }
    relationships.value.set(rel.id, rel)
    triggerRef(relationships)
    saveQueue.run(() => relationshipService.insertRelationship(rel))
    return null
  }

  /** Drop all in-memory data (used on sign-out). */
  function clear() {
    members.value = new Map()
    relationships.value = new Map()
    loadStatus.value = 'idle'
    activeTreeId.value = null
  }

  function removeRelationship(id) {
    if (!relationships.value.delete(id)) return
    triggerRef(relationships)
    saveQueue.run(() => relationshipService.deleteRelationship(id))
  }

  return {
    members,
    relationships,
    loadStatus,
    membersArray,
    relationshipsArray,
    memberById,
    parentsOf,
    childrenOf,
    spousesOf,
    siblingsOf,
    connectedIds,
    relationshipsOf,
    fetchAll,
    addMember,
    updateMember,
    moveMember,
    deleteMember,
    addRelationship,
    removeRelationship,
    clear,
  }
})
