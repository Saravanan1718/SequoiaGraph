<script setup>
import BaseModal from './BaseModal.vue'
import BaseButton from './BaseButton.vue'

defineProps({
  open: { type: Boolean, required: true },
  title: { type: String, default: 'Are you sure?' },
  message: { type: String, default: '' },
  confirmLabel: { type: String, default: 'Delete' },
})
const emit = defineEmits(['confirm', 'close'])
</script>

<template>
  <BaseModal :open="open" :title="title" @close="emit('close')">
    <p class="text-sm text-slate-600 dark:text-slate-300">{{ message }}</p>
    <div class="mt-5 flex justify-end gap-2">
      <BaseButton variant="secondary" @click="emit('close')">Cancel</BaseButton>
      <BaseButton variant="danger" @click="emit('confirm')">{{ confirmLabel }}</BaseButton>
    </div>
  </BaseModal>
</template>
