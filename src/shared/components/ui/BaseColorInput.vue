<script setup>
defineProps({
  label: { type: String, required: true },
})
const model = defineModel({ type: String, required: true })
</script>

<template>
  <label class="flex items-center justify-between gap-2 text-sm">
    <span class="text-slate-600 dark:text-slate-300">{{ label }}</span>
    <span class="flex items-center gap-1.5">
      <span class="font-mono text-xs text-slate-400">{{ model }}</span>
      <input
        v-model="model"
        type="color"
        class="h-7 w-9 cursor-pointer rounded border-0 bg-transparent p-0"
      />
    </span>
  </label>
</template>
