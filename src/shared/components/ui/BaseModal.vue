<script setup>
import { useEscapeStack } from '@/shared/composables/useEscapeStack'

const props = defineProps({
  open: { type: Boolean, required: true },
  title: { type: String, default: '' },
})
const emit = defineEmits(['close'])

useEscapeStack(
  () => props.open,
  () => emit('close'),
)
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0"
      leave-active-class="transition duration-100 ease-in"
      leave-to-class="opacity-0"
    >
      <!-- centered dialog on desktop, bottom sheet on phones -->
      <div
        v-if="open"
        class="fixed inset-0 z-1100 flex items-end justify-center bg-slate-900/50 backdrop-blur-sm max-sm:p-0 sm:items-center sm:p-4"
        @click.self="emit('close')"
      >
        <div
          class="max-h-[88dvh] w-full max-w-md overflow-y-auto bg-white p-5 shadow-xl max-sm:rounded-t-2xl max-sm:pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:rounded-2xl dark:bg-slate-900 dark:ring-1 dark:ring-slate-700"
          role="dialog"
          aria-modal="true"
        >
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-base font-semibold">{{ title }}</h2>
            <button
              class="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              aria-label="Close"
              @click="emit('close')"
            >
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
              </svg>
            </button>
          </div>
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
