<script setup>
defineProps({
  variant: { type: String, default: 'primary' }, // primary | secondary | danger | ghost | success
  size: { type: String, default: 'md' }, // sm | md
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
})

// every variant has hover + a clearly darker `active:` (pressed) state so
// taps/clicks give visible feedback on both desktop and touch
const variants = {
  primary:
    'bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-800 focus-visible:outline-indigo-600',
  secondary:
    'bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50 active:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-600 dark:hover:bg-slate-700 dark:active:bg-slate-600',
  danger:
    'bg-red-600 text-white hover:bg-red-500 active:bg-red-800 focus-visible:outline-red-600',
  ghost:
    'text-slate-600 hover:bg-slate-200/60 active:bg-slate-300 dark:text-slate-300 dark:hover:bg-slate-700/60 dark:active:bg-slate-600',
  success:
    'bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700 focus-visible:outline-emerald-600',
}
const sizes = {
  sm: 'px-2.5 py-1.5 text-xs',
  md: 'px-3.5 py-2 text-sm',
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="inline-flex touch-manipulation items-center justify-center gap-1.5 rounded-lg font-medium shadow-sm transition-[background-color,transform] duration-100 focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
    :class="[variants[variant], sizes[size]]"
  >
    <slot />
  </button>
</template>
