import { computed, reactive } from 'vue'
import { useFamilyStore } from '../store/familyStore'

const emptyForm = () => ({
  name: '',
  gender: null,
  photoUrl: '',
  birthDate: '',
  deathDate: '',
  occupation: '',
  notes: '',
})

/**
 * Form state + validation + submit for both create and edit.
 * @param {() => {x: number, y: number}} [getSpawnPosition] initial canvas position for new members
 */
export function useMemberForm(getSpawnPosition) {
  const family = useFamilyStore()

  const form = reactive(emptyForm())
  const errors = reactive({ name: '', deathDate: '' })
  let editingId = null

  function reset() {
    Object.assign(form, emptyForm())
    errors.name = ''
    errors.deathDate = ''
    editingId = null
  }

  function loadMember(member) {
    reset()
    editingId = member.id
    Object.assign(form, {
      name: member.name,
      gender: member.gender,
      photoUrl: member.photoUrl ?? '',
      birthDate: member.birthDate ?? '',
      deathDate: member.deathDate ?? '',
      occupation: member.occupation ?? '',
      notes: member.notes ?? '',
    })
  }

  const isEditing = computed(() => editingId !== null)

  function validate() {
    errors.name = form.name.trim() ? '' : 'Name is required.'
    errors.deathDate =
      form.birthDate && form.deathDate && form.deathDate < form.birthDate
        ? 'Death date is before birth date.'
        : ''
    return !errors.name && !errors.deathDate
  }

  /** @returns {import('@/shared/types/typedefs').Member|null} the saved member */
  function submit() {
    if (!validate()) return null
    const patch = {
      name: form.name.trim(),
      gender: form.gender,
      photoUrl: form.photoUrl.trim() || null,
      birthDate: form.birthDate || null,
      deathDate: form.deathDate || null,
      occupation: form.occupation.trim() || null,
      notes: form.notes.trim() || null,
    }
    if (editingId) {
      family.updateMember(editingId, patch)
      return family.memberById(editingId)
    }
    const pos = getSpawnPosition?.() ?? { x: 0, y: 0 }
    return family.addMember({ ...patch, posX: pos.x, posY: pos.y })
  }

  return { form, errors, isEditing, reset, loadMember, submit }
}
