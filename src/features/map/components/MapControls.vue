<script setup>
import { useSettingsStore } from '@/features/settings/store/settingsStore'

defineProps({
  saving: { type: Boolean, default: false },
  saveError: { type: Boolean, default: false },
})
const emit = defineEmits(['zoom-in', 'zoom-out', 'fit', 'add'])

const settings = useSettingsStore()

const buttonClass =
  'pointer-events-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white/95 text-slate-600 shadow-md ring-1 ring-slate-200 backdrop-blur transition hover:bg-slate-50 hover:text-slate-900 dark:bg-slate-800/95 dark:text-slate-300 dark:ring-slate-600 dark:hover:bg-slate-700'
</script>

<template>
  <div class="flex flex-col items-end gap-2">
    <!-- save status -->
    <div
      v-if="saving || saveError"
      class="pointer-events-auto rounded-full px-3 py-1 text-xs font-medium shadow-md backdrop-blur"
      :class="
        saveError
          ? 'bg-red-100/95 text-red-700 dark:bg-red-900/80 dark:text-red-200'
          : 'bg-white/95 text-slate-500 dark:bg-slate-800/95 dark:text-slate-400'
      "
    >
      {{ saveError ? 'Save failed — retrying on next change' : 'Saving…' }}
    </div>

    <button :class="buttonClass" aria-label="Add member" title="Add member" @click="emit('add')">
      <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
      </svg>
    </button>
    <button :class="buttonClass" aria-label="Zoom in" title="Zoom in" @click="emit('zoom-in')">
      <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clip-rule="evenodd" />
        <path d="M9 6.75a.75.75 0 0 1 .75.75v.75h.75a.75.75 0 0 1 0 1.5h-.75v.75a.75.75 0 0 1-1.5 0v-.75H7.5a.75.75 0 0 1 0-1.5h.75V7.5A.75.75 0 0 1 9 6.75Z" />
      </svg>
    </button>
    <button :class="buttonClass" aria-label="Zoom out" title="Zoom out" @click="emit('zoom-out')">
      <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clip-rule="evenodd" />
        <path d="M7.5 8.25a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5h-3Z" />
      </svg>
    </button>
    <button :class="buttonClass" aria-label="Fit tree" title="Fit whole tree" @click="emit('fit')">
      <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M3.28 2.22a.75.75 0 0 0-1.06 1.06L5.44 6.5H3.75a.75.75 0 0 0 0 1.5h3.5A.75.75 0 0 0 8 7.25v-3.5a.75.75 0 0 0-1.5 0v1.69L3.28 2.22ZM13.5 3.75a.75.75 0 0 0-1.5 0v3.5c0 .414.336.75.75.75h3.5a.75.75 0 0 0 0-1.5h-1.69l3.22-3.22a.75.75 0 0 0-1.06-1.06L13.5 5.44V3.75ZM3.75 12a.75.75 0 0 0 0 1.5h1.69l-3.22 3.22a.75.75 0 1 0 1.06 1.06l3.22-3.22v1.69a.75.75 0 0 0 1.5 0v-3.5a.75.75 0 0 0-.75-.75h-3.5ZM12 12.75a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 0 1.5h-1.69l3.22 3.22a.75.75 0 1 1-1.06 1.06l-3.22-3.22v1.69a.75.75 0 0 1-1.5 0v-3.5Z" />
      </svg>
    </button>
    <button
      :class="buttonClass"
      aria-label="Toggle theme"
      title="Toggle light/dark"
      @click="settings.toggleTheme()"
    >
      <svg v-if="settings.theme === 'dark'" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 2a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 2ZM10 15a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 15ZM10 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM15.657 5.404a.75.75 0 1 0-1.06-1.06l-1.061 1.06a.75.75 0 0 0 1.06 1.06l1.06-1.06ZM6.464 14.596a.75.75 0 1 0-1.06-1.06l-1.06 1.06a.75.75 0 0 0 1.06 1.06l1.06-1.06ZM18 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 18 10ZM5 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 5 10ZM14.596 15.657a.75.75 0 0 0 1.06-1.06l-1.06-1.061a.75.75 0 1 0-1.06 1.06l1.06 1.06ZM5.404 6.464a.75.75 0 0 0 1.06-1.06l-1.06-1.06a.75.75 0 1 0-1.061 1.06l1.06 1.06Z" />
      </svg>
      <svg v-else class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M7.455 2.004a.75.75 0 0 1 .26.77 7 7 0 0 0 9.958 7.967.75.75 0 0 1 1.067.853A8.5 8.5 0 1 1 6.647 1.921a.75.75 0 0 1 .808.083Z" clip-rule="evenodd" />
      </svg>
    </button>
  </div>
</template>
