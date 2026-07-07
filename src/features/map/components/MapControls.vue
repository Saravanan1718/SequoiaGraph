<script setup>
import { useSettingsStore } from '@/features/settings/store/settingsStore'

defineProps({
  saving: { type: Boolean, default: false },
  saveError: { type: Boolean, default: false },
})
const emit = defineEmits([
  'zoom-in',
  'zoom-out',
  'fit',
  'add',
  'export',
  'settings',
  'arrange',
])

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
    <button :class="buttonClass" aria-label="Auto arrange" title="Auto arrange tree by generations" @click="emit('arrange')">
      <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M2 4.25A2.25 2.25 0 0 1 4.25 2h2.5A2.25 2.25 0 0 1 9 4.25v2.5A2.25 2.25 0 0 1 6.75 9h-2.5A2.25 2.25 0 0 1 2 6.75v-2.5Zm9 0A2.25 2.25 0 0 1 13.25 2h2.5A2.25 2.25 0 0 1 18 4.25v2.5A2.25 2.25 0 0 1 15.75 9h-2.5A2.25 2.25 0 0 1 11 6.75v-2.5Zm-9 9A2.25 2.25 0 0 1 4.25 11h2.5A2.25 2.25 0 0 1 9 13.25v2.5A2.25 2.25 0 0 1 6.75 18h-2.5A2.25 2.25 0 0 1 2 15.75v-2.5Zm9 0A2.25 2.25 0 0 1 13.25 11h2.5A2.25 2.25 0 0 1 18 13.25v2.5A2.25 2.25 0 0 1 15.75 18h-2.5A2.25 2.25 0 0 1 11 15.75v-2.5Z" clip-rule="evenodd" />
      </svg>
    </button>
    <button :class="buttonClass" aria-label="Export tree" title="Export PNG / PDF" @click="emit('export')">
      <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
        <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
      </svg>
    </button>
    <button :class="buttonClass" aria-label="Appearance settings" title="Appearance settings" @click="emit('settings')">
      <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M7.84 1.804A1 1 0 0 1 8.82 1h2.36a1 1 0 0 1 .98.804l.331 1.652a6.993 6.993 0 0 1 1.929 1.115l1.598-.54a1 1 0 0 1 1.186.447l1.18 2.044a1 1 0 0 1-.205 1.251l-1.267 1.113a7.047 7.047 0 0 1 0 2.228l1.267 1.113a1 1 0 0 1 .206 1.25l-1.18 2.045a1 1 0 0 1-1.187.447l-1.598-.54a6.993 6.993 0 0 1-1.929 1.115l-.33 1.652a1 1 0 0 1-.98.804H8.82a1 1 0 0 1-.98-.804l-.331-1.652a6.993 6.993 0 0 1-1.929-1.115l-1.598.54a1 1 0 0 1-1.186-.447l-1.18-2.044a1 1 0 0 1 .205-1.251l1.267-1.114a7.05 7.05 0 0 1 0-2.227L1.821 7.773a1 1 0 0 1-.206-1.25l1.18-2.045a1 1 0 0 1 1.187-.447l1.598.54A6.992 6.992 0 0 1 7.51 3.456l.33-1.652ZM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clip-rule="evenodd" />
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
