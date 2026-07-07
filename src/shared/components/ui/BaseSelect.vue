<script setup>
defineProps({
  /** [{ value, label }] */
  options: { type: Array, required: true },
  placeholder: { type: String, default: '' },
})
const model = defineModel({ type: [String, Number, null], default: null })
</script>

<template>
  <select
    v-model="model"
    class="w-full rounded-lg border-0 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-600"
  >
    <option v-if="placeholder" :value="null" disabled>{{ placeholder }}</option>
    <option v-for="opt in options" :key="opt.value" :value="opt.value">
      {{ opt.label }}
    </option>
  </select>
</template>
