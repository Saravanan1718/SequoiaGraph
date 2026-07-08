<script setup>
import { ref } from 'vue'
import BaseAvatar from '@/shared/components/ui/BaseAvatar.vue'
import { useSearch } from '../composables/useSearch'
import { lifespan } from '@/shared/utils/date'

const { query, results, jumpTo } = useSearch()
const focused = ref(false)
</script>

<template>
  <div class="pointer-events-auto relative w-72 max-w-full">
    <div class="relative">
      <svg
        class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clip-rule="evenodd" />
      </svg>
      <input
        v-model="query"
        type="search"
        placeholder="Search family…"
        class="w-full rounded-full border-0 bg-white/95 py-2 pl-9 pr-4 text-base shadow-md sm:text-sm ring-1 ring-slate-200 backdrop-blur placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800/95 dark:text-slate-100 dark:ring-slate-600"
        @focus="focused = true"
        @blur="focused = false"
      />
    </div>

    <Transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      leave-active-class="transition duration-75 ease-in"
      leave-to-class="opacity-0"
    >
      <ul
        v-if="results.length && (focused || query)"
        class="absolute z-10 mt-2 w-full overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-600"
      >
        <li v-for="member in results" :key="member.id">
          <button
            class="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-indigo-50 dark:hover:bg-slate-700"
            @mousedown.prevent="jumpTo(member.id)"
          >
            <BaseAvatar :name="member.name" :photo-url="member.photoUrl" size="sm" />
            <span class="min-w-0">
              <span class="block truncate font-medium">{{ member.name }}</span>
              <span class="block text-xs text-slate-500 dark:text-slate-400">
                {{ lifespan(member.birthDate, member.deathDate) || member.occupation || '' }}
              </span>
            </span>
          </button>
        </li>
      </ul>
    </Transition>
  </div>
</template>
