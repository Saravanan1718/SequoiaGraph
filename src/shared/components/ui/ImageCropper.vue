<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import BaseModal from './BaseModal.vue'
import BaseButton from './BaseButton.vue'

/**
 * Reusable 1:1 image cropper. Give it a File; the user pans (drag) and zooms
 * (slider / wheel / pinch) inside a square viewport, then `cropped` emits
 * `{ blob, dataUrl }` — a JPEG of the visible square at `outputSize` px.
 */
const props = defineProps({
  open: { type: Boolean, required: true },
  /** Image file to crop. */
  file: { type: Object, default: null },
  outputSize: { type: Number, default: 512 },
})
const emit = defineEmits(['cropped', 'close'])

const VIEWPORT = 288 // px, matches w-72
const JPEG_QUALITY = 0.85

const imageUrl = ref(null)
const image = ref(null) // HTMLImageElement once loaded
const zoom = ref(1) // multiplier on top of base cover scale
const offset = ref({ x: 0, y: 0 }) // pan, in viewport px, from centered position
const loadError = ref('')

function cleanup() {
  if (imageUrl.value) URL.revokeObjectURL(imageUrl.value)
  imageUrl.value = null
  image.value = null
}

watch(
  () => [props.open, props.file],
  async ([open, file]) => {
    cleanup()
    zoom.value = 1
    offset.value = { x: 0, y: 0 }
    loadError.value = ''
    if (!open || !file) return
    imageUrl.value = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => (image.value = img)
    img.onerror = () => (loadError.value = 'Could not load that image.')
    img.src = imageUrl.value
  },
)
onBeforeUnmount(cleanup)

/** Scale so the image covers the square viewport at zoom = 1. */
function coverScale() {
  const img = image.value
  return (VIEWPORT / Math.min(img.width, img.height)) * zoom.value
}

/** Clamp the pan so the viewport never shows past the image edge. */
function clampOffset() {
  const img = image.value
  if (!img) return
  const s = coverScale()
  const maxX = Math.max(0, (img.width * s - VIEWPORT) / 2)
  const maxY = Math.max(0, (img.height * s - VIEWPORT) / 2)
  offset.value = {
    x: Math.min(maxX, Math.max(-maxX, offset.value.x)),
    y: Math.min(maxY, Math.max(-maxY, offset.value.y)),
  }
}

function setZoom(next) {
  zoom.value = Math.min(4, Math.max(1, next))
  clampOffset()
}

// --- pointer pan + two-finger pinch ---------------------------------------
const pointers = new Map()
let pinchStart = null // { dist, zoom }

function onPointerDown(e) {
  e.currentTarget.setPointerCapture(e.pointerId)
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
  if (pointers.size === 2) {
    pinchStart = { dist: pinchDistance(), zoom: zoom.value }
  }
}

function onPointerMove(e) {
  const prev = pointers.get(e.pointerId)
  if (!prev) return
  const curr = { x: e.clientX, y: e.clientY }
  pointers.set(e.pointerId, curr)

  if (pointers.size === 2 && pinchStart) {
    setZoom(pinchStart.zoom * (pinchDistance() / pinchStart.dist))
  } else if (pointers.size === 1 && image.value) {
    offset.value = { x: offset.value.x + curr.x - prev.x, y: offset.value.y + curr.y - prev.y }
    clampOffset()
  }
}

function onPointerUp(e) {
  pointers.delete(e.pointerId)
  if (pointers.size < 2) pinchStart = null
}

function pinchDistance() {
  const [a, b] = [...pointers.values()]
  return Math.hypot(a.x - b.x, a.y - b.y) || 1
}

function onWheel(e) {
  setZoom(zoom.value * (e.deltaY < 0 ? 1.08 : 1 / 1.08))
}

// --- output ----------------------------------------------------------------
async function apply() {
  const img = image.value
  if (!img) return
  const s = coverScale()
  // top-left corner of the viewport in source-image pixels
  const srcX = img.width / 2 - (VIEWPORT / 2 + offset.value.x) / s
  const srcY = img.height / 2 - (VIEWPORT / 2 + offset.value.y) / s
  const srcSize = VIEWPORT / s

  const canvas = document.createElement('canvas')
  canvas.width = props.outputSize
  canvas.height = props.outputSize
  canvas
    .getContext('2d')
    .drawImage(img, srcX, srcY, srcSize, srcSize, 0, 0, props.outputSize, props.outputSize)

  const blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', JPEG_QUALITY))
  emit('cropped', { blob, dataUrl: canvas.toDataURL('image/jpeg', JPEG_QUALITY) })
  emit('close')
}
</script>

<template>
  <BaseModal :open="open" title="Crop photo" @close="emit('close')">
    <div class="flex flex-col items-center gap-4">
      <p v-if="loadError" class="text-sm text-red-600">{{ loadError }}</p>

      <!-- square viewport -->
      <div
        v-else
        class="relative h-72 w-72 cursor-move touch-none select-none overflow-hidden rounded-xl bg-slate-900 ring-1 ring-slate-300 dark:ring-slate-600"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
        @wheel.prevent="onWheel"
      >
        <img
          v-if="image"
          :src="imageUrl"
          alt=""
          draggable="false"
          class="pointer-events-none absolute left-1/2 top-1/2 max-w-none"
          :style="{
            width: `${image.width * coverScale()}px`,
            height: `${image.height * coverScale()}px`,
            transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
          }"
        />
        <!-- circular guide matching the avatar shape -->
        <div class="pointer-events-none absolute inset-0 rounded-full ring-2 ring-white/70" />
      </div>

      <label class="flex w-72 items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
        Zoom
        <input
          type="range"
          min="1"
          max="4"
          step="0.01"
          :value="zoom"
          class="flex-1 accent-indigo-600"
          @input="setZoom(Number($event.target.value))"
        />
      </label>

      <div class="flex w-full justify-end gap-2">
        <BaseButton variant="secondary" @click="emit('close')">Cancel</BaseButton>
        <BaseButton :disabled="!image" @click="apply">Use photo</BaseButton>
      </div>
    </div>
  </BaseModal>
</template>
