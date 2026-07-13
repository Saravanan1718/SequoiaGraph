<script setup>
import { ref, computed } from 'vue'
import BaseButton from '@/shared/components/ui/BaseButton.vue'
import BaseAvatar from '@/shared/components/ui/BaseAvatar.vue'
import ImageCropper from '@/shared/components/ui/ImageCropper.vue'
import ImageLightbox from '@/shared/components/ui/ImageLightbox.vue'

const props = defineProps({
  /** Current stored value: a URL or data URL. */
  modelValue: { type: String, default: null },
  /** Name used for the placeholder avatar initials. */
  name: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue', 'file-selected'])

const fileInput = ref(null)
const cameraInput = ref(null)
const error = ref('')

// file waiting in the cropper; null when the cropper is closed
const cropFile = ref(null)
const lightboxOpen = ref(false)

const hasPhoto = computed(() => Boolean(props.modelValue))

function onFilePicked(event) {
  const file = event.target.files?.[0]
  event.target.value = '' // allow re-picking the same file
  if (!file) return
  if (!file.type.startsWith('image/')) {
    error.value = 'Please choose an image file.'
    return
  }
  error.value = ''
  cropFile.value = file
}

/** Cropper output: preview immediately, hand the blob up to persist on save. */
function onCropped(processed) {
  emit('update:modelValue', processed.dataUrl)
  emit('file-selected', processed)
}

function remove() {
  error.value = ''
  emit('update:modelValue', null)
  emit('file-selected', null)
}
</script>

<template>
  <div class="flex items-center gap-4">
    <!-- clickable avatar → fullscreen viewer -->
    <button
      type="button"
      class="group relative shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      :title="hasPhoto ? 'View full photo' : 'No photo yet'"
      aria-label="View full photo"
      @click="lightboxOpen = true"
    >
      <BaseAvatar :name="name || '?'" :photo-url="modelValue" size="lg" />
      <span
        class="absolute inset-0 flex items-center justify-center rounded-full bg-slate-900/0 text-white opacity-0 transition group-hover:bg-slate-900/40 group-hover:opacity-100"
      >
        <svg class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
          <path fill-rule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clip-rule="evenodd" />
        </svg>
      </span>
    </button>

    <div class="flex flex-col gap-2">
      <div class="flex flex-wrap gap-2">
        <BaseButton type="button" variant="secondary" size="sm" @click="fileInput?.click()">
          {{ hasPhoto ? 'Change photo' : 'Upload photo' }}
        </BaseButton>

        <!-- capture="user" asks phones/laptops to open the camera directly -->
        <BaseButton type="button" variant="secondary" size="sm" @click="cameraInput?.click()">
          Take photo
        </BaseButton>

        <BaseButton v-if="hasPhoto" type="button" variant="ghost" size="sm" @click="remove">
          Remove
        </BaseButton>
      </div>

      <p class="text-xs text-slate-500 dark:text-slate-400">
        Upload from your device or take a picture with your camera.
      </p>
      <p v-if="error" class="text-xs text-red-600">{{ error }}</p>
    </div>

    <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFilePicked" />
    <input
      ref="cameraInput"
      type="file"
      accept="image/*"
      capture="user"
      class="hidden"
      @change="onFilePicked"
    />

    <ImageCropper
      :open="cropFile !== null"
      :file="cropFile"
      @cropped="onCropped"
      @close="cropFile = null"
    />
    <ImageLightbox
      :open="lightboxOpen"
      :src="modelValue"
      :name="name"
      @close="lightboxOpen = false"
    />
  </div>
</template>
