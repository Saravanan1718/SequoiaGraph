<script setup>
// Label + error wrapper so every form control shares one layout.
defineProps({
  label: { type: String, required: true },
  error: { type: String, default: '' },
})
</script>

<template>
  <label class="block">
    <span class="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
      {{ label }}
    </span>
    <slot />
    <span v-if="error" class="mt-1 block text-xs text-red-600 dark:text-red-400">
      {{ error }}
    </span>
  </label>
</template>
