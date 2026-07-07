<script setup>
import { ref, watch } from 'vue'
import BaseModal from '@/shared/components/ui/BaseModal.vue'
import BaseButton from '@/shared/components/ui/BaseButton.vue'
import BaseField from '@/shared/components/ui/BaseField.vue'
import BaseInput from '@/shared/components/ui/BaseInput.vue'

const props = defineProps({
  open: { type: Boolean, required: true },
  /** Tree to rename; null → create mode. */
  tree: { type: Object, default: null },
})
const emit = defineEmits(['close', 'submit'])

const name = ref('')
const error = ref('')

watch(
  () => props.open,
  (open) => {
    if (!open) return
    name.value = props.tree?.name ?? ''
    error.value = ''
  },
)

function submit() {
  if (!name.value.trim()) {
    error.value = 'Give your tree a name.'
    return
  }
  emit('submit', name.value.trim())
  emit('close')
}
</script>

<template>
  <BaseModal :open="open" :title="tree ? 'Rename tree' : 'Create a new tree'" @close="emit('close')">
    <form class="space-y-3" @submit.prevent="submit">
      <BaseField label="Tree name" :error="error">
        <BaseInput v-model="name" placeholder="e.g. Mom's side, The Kumars…" />
      </BaseField>
      <div class="flex justify-end gap-2 pt-1">
        <BaseButton variant="secondary" @click="emit('close')">Cancel</BaseButton>
        <BaseButton type="submit">{{ tree ? 'Save' : 'Create tree' }}</BaseButton>
      </div>
    </form>
  </BaseModal>
</template>
