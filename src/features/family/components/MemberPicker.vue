<script setup>
import { computed, ref } from 'vue'
import BaseAvatar from '@/shared/components/ui/BaseAvatar.vue'

/**
 * Searchable member list with checkbox-style selection — friendlier than a
 * native dropdown, especially on touch screens, and supports picking several
 * people at once (e.g. both parents of a child).
 */
const props = defineProps({
  /** @type {import('vue').PropType<import('@/shared/types/typedefs').Member[]>} */
  members: { type: Array, required: true },
  /** Max selectable; 1 = single-select behavior (tap replaces). */
  max: { type: Number, default: 1 },
})

/** Array of selected member ids. */
const selected = defineModel({ type: Array, default: () => [] })

const query = ref('')

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return props.members
    .filter((m) => !q || m.name.toLowerCase().includes(q))
    .sort((a, b) => a.name.localeCompare(b.name))
})

function toggle(id) {
  if (selected.value.includes(id)) {
    selected.value = selected.value.filter((s) => s !== id)
  } else if (props.max === 1) {
    selected.value = [id]
  } else if (selected.value.length < props.max) {
    selected.value = [...selected.value, id]
  }
}
</script>

<template>
  <div class="overflow-hidden rounded-lg ring-1 ring-slate-300 dark:ring-slate-600">
    <input
      v-model="query"
      type="search"
      placeholder="Filter by name…"
      class="w-full border-0 border-b border-slate-200 bg-white px-3 py-2 text-base placeholder:text-slate-400 focus:outline-none focus:ring-0 sm:text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
    />
    <ul class="max-h-44 overflow-y-auto bg-white dark:bg-slate-800">
      <li v-if="!filtered.length" class="px-3 py-3 text-center text-xs text-slate-400">
        No members match.
      </li>
      <li v-for="member in filtered" :key="member.id">
        <button
          type="button"
          class="flex w-full touch-manipulation items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors duration-75 active:bg-indigo-100 dark:active:bg-indigo-500/20"
          :class="
            selected.includes(member.id)
              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300'
              : 'hover:bg-slate-50 dark:hover:bg-slate-700/60'
          "
          :aria-pressed="selected.includes(member.id)"
          @click="toggle(member.id)"
        >
          <BaseAvatar :name="member.name" :photo-url="member.photoUrl" size="sm" />
          <span class="min-w-0 flex-1 truncate">{{ member.name }}</span>
          <svg
            v-if="selected.includes(member.id)"
            class="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd" />
          </svg>
        </button>
      </li>
    </ul>
  </div>
</template>
