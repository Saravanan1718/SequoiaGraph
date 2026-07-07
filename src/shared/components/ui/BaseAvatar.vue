<script setup>
import { computed } from 'vue'
import { colorFromName, initials } from '@/shared/utils/color'

const props = defineProps({
  name: { type: String, required: true },
  photoUrl: { type: String, default: null },
  size: { type: String, default: 'md' }, // sm | md | lg
})

const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-16 w-16 text-lg' }
const bg = computed(() => colorFromName(props.name))
const label = computed(() => initials(props.name))
</script>

<template>
  <div
    class="flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold text-white"
    :class="sizes[size]"
    :style="photoUrl ? undefined : { backgroundColor: bg }"
  >
    <img v-if="photoUrl" :src="photoUrl" :alt="name" class="h-full w-full object-cover" />
    <span v-else>{{ label }}</span>
  </div>
</template>
