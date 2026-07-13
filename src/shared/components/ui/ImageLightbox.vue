<script setup>
import { computed } from 'vue'
import { colorFromName, initials } from '@/shared/utils/color'
import { useEscapeStack } from '@/shared/composables/useEscapeStack'

/**
 * Fullscreen image viewer with a dark backdrop. Reusable for any image URL;
 * when `src` is empty it shows an initials placeholder instead.
 * Closes via ✕, outside click, or Escape (topmost-overlay aware).
 */
const props = defineProps({
  open: { type: Boolean, required: true },
  src: { type: String, default: null },
  /** Used for alt text and the no-photo placeholder. */
  name: { type: String, default: '' },
})
const emit = defineEmits(['close'])

useEscapeStack(
  () => props.open,
  () => emit('close'),
)

const bg = computed(() => colorFromName(props.name || '?'))
const label = computed(() => initials(props.name || '?'))
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0"
      leave-active-class="transition duration-100 ease-in"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-1200 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        :aria-label="name ? `Photo of ${name}` : 'Photo'"
        @click.self="emit('close')"
      >
        <button
          class="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white/80 transition hover:bg-white/20 hover:text-white"
          aria-label="Close"
          @click="emit('close')"
        >
          <svg class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        </button>

        <img
          v-if="src"
          :src="src"
          :alt="name"
          class="max-h-[85dvh] max-w-full rounded-2xl object-contain shadow-2xl"
        />

        <!-- no photo: initials placeholder -->
        <div v-else class="flex flex-col items-center gap-4">
          <div
            class="flex h-48 w-48 items-center justify-center rounded-full text-5xl font-semibold text-white shadow-2xl"
            :style="{ backgroundColor: bg }"
          >
            {{ label }}
          </div>
          <p class="text-sm text-white/70">No photo yet</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
