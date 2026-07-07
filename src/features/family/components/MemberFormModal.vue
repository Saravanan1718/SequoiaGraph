<script setup>
import { watch } from 'vue'
import BaseModal from '@/shared/components/ui/BaseModal.vue'
import BaseButton from '@/shared/components/ui/BaseButton.vue'
import BaseField from '@/shared/components/ui/BaseField.vue'
import BaseInput from '@/shared/components/ui/BaseInput.vue'
import BaseSelect from '@/shared/components/ui/BaseSelect.vue'
import BaseTextarea from '@/shared/components/ui/BaseTextarea.vue'
import { useMemberForm } from '../composables/useMemberForm'

const props = defineProps({
  open: { type: Boolean, required: true },
  /** Member to edit; null → create mode. */
  member: { type: Object, default: null },
  /** () => {x, y} — canvas position for a newly created member. */
  getSpawnPosition: { type: Function, default: null },
})
const emit = defineEmits(['close', 'saved'])

const { form, errors, isEditing, reset, loadMember, submit } = useMemberForm(
  () => props.getSpawnPosition?.() ?? { x: 0, y: 0 },
)

watch(
  () => props.open,
  (open) => {
    if (!open) return
    if (props.member) loadMember(props.member)
    else reset()
  },
)

const genderOptions = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'other', label: 'Other' },
]

function onSubmit() {
  const saved = submit()
  if (saved) {
    emit('saved', saved)
    emit('close')
  }
}
</script>

<template>
  <BaseModal :open="open" :title="isEditing ? 'Edit member' : 'Add member'" @close="emit('close')">
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

      <BaseField label="Photo URL">
        <BaseInput v-model="form.photoUrl" type="url" placeholder="https://…" />
      </BaseField>

      <BaseField label="Notes">
        <BaseTextarea v-model="form.notes" placeholder="Anything worth remembering" />
      </BaseField>

      <div class="flex justify-end gap-2 pt-2">
        <BaseButton variant="secondary" @click="emit('close')">Cancel</BaseButton>
        <BaseButton type="submit">{{ isEditing ? 'Save changes' : 'Add member' }}</BaseButton>
      </div>
    </form>
  </BaseModal>
</template>
