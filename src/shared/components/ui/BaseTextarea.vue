<script setup>
defineProps({
  rows: { type: Number, default: 3 },
  placeholder: { type: String, default: '' },
})
const model = defineModel({ type: String, default: '' })
</script>

<template>
  <textarea
    v-model="model"
    :rows="rows"
    :placeholder="placeholder"
    class="w-full resize-y rounded-lg border-0 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-600"
  />
</template>
