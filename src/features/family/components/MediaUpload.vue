<script setup>
import { ref, computed } from 'vue'
import BaseButton from '@/shared/components/ui/BaseButton.vue'
import BaseAvatar from '@/shared/components/ui/BaseAvatar.vue'
import { processImage } from '../services/photoService'

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
const busy = ref(false)

const hasPhoto = computed(() => Boolean(props.modelValue))

async function handleFiles(event) {
  const file = event.target.files?.[0]
  event.target.value = '' // allow re-picking the same file
  if (!file) return

  if (!file.type.startsWith('image/')) {
    error.value = 'Please choose an image file.'
    return
  }

  error.value = ''
  busy.value = true
  try {
    const processed = await processImage(file)
    emit('update:modelValue', processed.dataUrl) // instant preview
    // hand the processed blob to the parent so it can persist on save
    emit('file-selected', processed)
  } catch (err) {
    error.value = 'Could not read that image.'
    console.error(err)
  } finally {
    busy.value = false
  }
}

function pickFromDevice() {
  fileInput.value?.click()
}

function takePhoto() {
  cameraInput.value?.click()
}

function remove() {
  error.value = ''
  emit('update:modelValue', null)
  emit('file-selected', null)
}
</script>

<template>
  <div class="flex items-center gap-4">
    <BaseAvatar :name="name || '?'" :photo-url="modelValue" size="lg" />

    <div class="flex flex-col gap-2">
      <div class="flex flex-wrap gap-2">
        <BaseButton
          type="button"
          variant="secondary"
          size="sm"
          :disabled="busy"
          @click="pickFromDevice"
        >
          {{ busy ? 'Processing…' : hasPhoto ? 'Change photo' : 'Upload photo' }}
        </BaseButton>

        <!-- capture="user" asks phones/laptops to open the camera directly -->
        <BaseButton
          type="button"
          variant="secondary"
          size="sm"
          :disabled="busy"
          @click="takePhoto"
        >
          Take photo
        </BaseButton>

        <BaseButton
          v-if="hasPhoto"
          type="button"
          variant="ghost"
          size="sm"
          :disabled="busy"
          @click="remove"
        >
          Remove
        </BaseButton>
      </div>

      <p class="text-xs text-slate-500 dark:text-slate-400">
        Upload from your device or take a picture with your camera.
      </p>
      <p v-if="error" class="text-xs text-red-600">{{ error }}</p>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleFiles"
    />
    <input
      ref="cameraInput"
      type="file"
      accept="image/*"
      capture="user"
      class="hidden"
      @change="handleFiles"
    />
  </div>
</template>
