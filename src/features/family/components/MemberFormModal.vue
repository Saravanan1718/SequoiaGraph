<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import BaseModal from '@/shared/components/ui/BaseModal.vue'
import UnsavedChangesDialog from '@/shared/components/ui/UnsavedChangesDialog.vue'
import BaseButton from '@/shared/components/ui/BaseButton.vue'
import BaseField from '@/shared/components/ui/BaseField.vue'
import BaseInput from '@/shared/components/ui/BaseInput.vue'
import BaseSelect from '@/shared/components/ui/BaseSelect.vue'
import BaseTextarea from '@/shared/components/ui/BaseTextarea.vue'
import MediaUpload from './MediaUpload.vue'
import { useMemberForm } from '../composables/useMemberForm'

const props = defineProps({
  open: { type: Boolean, required: true },
  /** Member to edit; null → create mode. */
  member: { type: Object, default: null },
  /** () => {x, y} — canvas position for a newly created member. */
  getSpawnPosition: { type: Function, default: null },
})
const emit = defineEmits(['close', 'saved'])

const { form, errors, isEditing, isDirty, reset, loadMember, submit, setPendingPhoto } =
  useMemberForm(() => props.getSpawnPosition?.() ?? { x: 0, y: 0 })

const saving = ref(false)

function loadCurrent() {
  if (props.member) loadMember(props.member)
  else reset()
}

watch(
  () => props.open,
  (open) => {
    if (open) loadCurrent()
  },
)

// switching to another member while the form is open goes through the guard
watch(
  () => props.member,
  () => {
    if (props.open) guard(loadCurrent)
  },
)

// --- unsaved-changes guard --------------------------------------------------
const confirmOpen = ref(false)
let pending = null // { proceed, abort } for the action awaiting the user's choice

/** Run `proceed` immediately when clean, otherwise ask first. */
function guard(proceed, abort = () => {}) {
  if (!isDirty.value) return proceed()
  pending = { proceed, abort }
  confirmOpen.value = true
}

function requestClose() {
  guard(() => emit('close'))
}

function settle(run) {
  const action = pending
  pending = null
  confirmOpen.value = false
  if (action) run(action)
}

async function onDialogSave() {
  if (saving.value) return
  saving.value = true
  try {
    const saved = await submit()
    if (!saved) return settle((a) => a.abort()) // validation failed → stay and fix
    emit('saved', saved)
    settle((a) => a.proceed())
  } finally {
    saving.value = false
  }
}

function onDialogDiscard() {
  reset()
  settle((a) => a.proceed())
}

function onDialogCancel() {
  settle((a) => a.abort())
}

// browser refresh / tab close — the native prompt is all browsers allow here
function onBeforeUnload(e) {
  if (props.open && isDirty.value) {
    e.preventDefault()
    e.returnValue = ''
  }
}
window.addEventListener('beforeunload', onBeforeUnload)
onBeforeUnmount(() => window.removeEventListener('beforeunload', onBeforeUnload))

// in-app navigation (e.g. back to the tree list)
onBeforeRouteLeave(() => {
  if (!props.open || !isDirty.value) return true
  return new Promise((resolve) => {
    guard(
      () => {
        emit('close')
        resolve(true)
      },
      () => resolve(false),
    )
  })
})

const genderOptions = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'other', label: 'Other' },
]

async function onSubmit() {
  if (saving.value) return
  saving.value = true
  try {
    const saved = await submit()
    if (saved) {
      emit('saved', saved)
      emit('close')
    }
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <BaseModal :open="open" :title="isEditing ? 'Edit member' : 'Add member'" @close="requestClose">
    <form class="space-y-3" @submit.prevent="onSubmit">
      <BaseField label="Name" :error="errors.name">
        <BaseInput v-model="form.name" placeholder="Full name" />
      </BaseField>

      <div class="grid grid-cols-2 gap-3">
        <BaseField label="Gender">
          <BaseSelect v-model="form.gender" :options="genderOptions" placeholder="Select…" />
        </BaseField>
        <BaseField label="Occupation">
          <BaseInput v-model="form.occupation" placeholder="e.g. Teacher" />
        </BaseField>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <BaseField label="Birth date">
          <BaseInput v-model="form.birthDate" type="date" />
        </BaseField>
        <BaseField label="Death date" :error="errors.deathDate">
          <BaseInput v-model="form.deathDate" type="date" />
        </BaseField>
      </div>

      <BaseField label="Photo">
        <MediaUpload
          v-model="form.photoUrl"
          :name="form.name"
          @file-selected="setPendingPhoto"
        />
      </BaseField>

      <BaseField label="Notes">
        <BaseTextarea v-model="form.notes" placeholder="Anything worth remembering" />
      </BaseField>

      <div class="flex justify-end gap-2 pt-2">
        <BaseButton variant="secondary" :disabled="saving" @click="requestClose">Cancel</BaseButton>
        <BaseButton type="submit" :disabled="saving">
          {{ saving ? 'Saving…' : isEditing ? 'Save changes' : 'Add member' }}
        </BaseButton>
      </div>
    </form>

    <UnsavedChangesDialog
      :open="confirmOpen"
      @save="onDialogSave"
      @discard="onDialogDiscard"
      @cancel="onDialogCancel"
    />
  </BaseModal>
</template>
