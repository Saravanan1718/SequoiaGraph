<script setup>
import BaseModal from './BaseModal.vue'
import BaseButton from './BaseButton.vue'

/**
 * Three-way unsaved-changes prompt. Sibling of BaseConfirm (which is a
 * fixed two-button confirm) built on the same BaseModal primitive.
 * Closing the modal (Esc / backdrop / ✕) counts as Cancel.
 */
defineProps({
  open: { type: Boolean, required: true },
})
const emit = defineEmits(['save', 'discard', 'cancel'])
</script>

<template>
  <BaseModal :open="open" title="Unsaved changes" @close="emit('cancel')">
    <p class="text-sm text-slate-600 dark:text-slate-300">
      You have unsaved changes. Do you want to save before leaving?
    </p>
    <div class="mt-5 flex flex-wrap justify-end gap-2">
      <BaseButton variant="secondary" @click="emit('cancel')">Cancel</BaseButton>
      <BaseButton variant="danger" @click="emit('discard')">Discard</BaseButton>
      <BaseButton variant="success" @click="emit('save')">Save &amp; Continue</BaseButton>
    </div>
  </BaseModal>
</template>
