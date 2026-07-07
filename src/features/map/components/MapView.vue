<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFamilyStore } from '@/features/family/store/familyStore'
import { pendingCount, lastError } from '@/features/family/services/saveQueue'
import { useMapStore } from '../store/mapStore'
import { useFamilyMap } from '../composables/useFamilyMap'
import { useMarkers } from '../composables/useMarkers'
import { useEdges } from '../composables/useEdges'
import { useAutoFit } from '../composables/useAutoFit'
import { spawnPosition } from '../services/layoutEngine'
import MapControls from './MapControls.vue'
import SearchBar from '@/features/search/components/SearchBar.vue'
import MemberDetailPanel from '@/features/family/components/MemberDetailPanel.vue'
import MemberFormModal from '@/features/family/components/MemberFormModal.vue'
import BaseButton from '@/shared/components/ui/BaseButton.vue'

const family = useFamilyStore()
const mapStore = useMapStore()
const route = useRoute()
const router = useRouter()

const container = ref(null)
const { map, viewCenter } = useFamilyMap(container)
useMarkers(map)
useEdges(map)
const { fitAll } = useAutoFit(map)

const formOpen = ref(false)
const editingMember = ref(null) // null → create mode

const saving = computed(() => pendingCount.value > 0)
const saveError = computed(() => lastError.value !== null)

// initial load → fit tree, honor ?member= deep link
family.fetchAll().then(() => {
  const deepLinkId = route.query.member
  if (deepLinkId && family.memberById(deepLinkId)) {
    mapStore.jumpTo(deepLinkId)
  } else {
    fitAll({ animate: false })
  }
})

// keep ?member= in sync with selection (replace → no history spam)
watch(
  () => mapStore.selectedId,
  (id) => {
    router.replace({ query: id ? { member: id } : {} })
  },
)

function openCreate() {
  editingMember.value = null
  formOpen.value = true
}

function openEdit() {
  editingMember.value = mapStore.selectedMember
  formOpen.value = true
}

function onSaved(member) {
  mapStore.jumpTo(member.id)
}

function getSpawnPosition() {
  return spawnPosition(family.membersArray, viewCenter())
}
</script>

<template>
  <div class="relative h-full">
    <div ref="container" class="absolute inset-0 z-0" />

    <!-- overlay UI; pointer-events re-enabled per element -->
    <div class="pointer-events-none absolute inset-0 z-1000 flex">
      <div class="flex min-w-0 flex-1 flex-col">
      <header class="flex items-start justify-between gap-3 p-4">
        <div class="flex items-center gap-3">
          <h1 class="pointer-events-auto select-none rounded-full bg-white/95 px-4 py-2 text-sm font-bold tracking-tight shadow-md backdrop-blur dark:bg-slate-800/95">
            Kin<span class="text-indigo-500">Graph</span>
          </h1>
          <SearchBar class="hidden sm:block" />
        </div>
        <MapControls
          :saving="saving"
          :save-error="saveError"
          @add="openCreate"
          @zoom-in="map?.zoomIn()"
          @zoom-out="map?.zoomOut()"
          @fit="fitAll()"
        />
      </header>

      <div class="px-4 sm:hidden">
        <SearchBar />
      </div>

      <!-- empty state -->
      <div
        v-if="family.loadStatus === 'ready' && family.membersArray.length === 0"
        class="flex flex-1 items-center justify-center"
      >
        <div class="pointer-events-auto rounded-2xl bg-white/95 p-8 text-center shadow-xl backdrop-blur dark:bg-slate-800/95">
          <p class="mb-1 text-lg font-semibold">Start your family tree</p>
          <p class="mb-4 text-sm text-slate-500 dark:text-slate-400">
            Add the first family member to begin.
          </p>
          <BaseButton @click="openCreate">Add first member</BaseButton>
        </div>
      </div>

      <!-- load / error states -->
      <div
        v-else-if="family.loadStatus === 'loading' || family.loadStatus === 'error'"
        class="flex flex-1 items-center justify-center"
      >
        <p class="pointer-events-auto rounded-full bg-white/95 px-4 py-2 text-sm shadow-md dark:bg-slate-800/95">
          {{ family.loadStatus === 'error' ? 'Could not load your tree — check your connection and refresh.' : 'Loading your tree…' }}
        </p>
      </div>
      </div>

      <!-- detail panel: flex sibling so it never covers the toolbar -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="translate-x-full"
        leave-active-class="transition duration-150 ease-in"
        leave-to-class="translate-x-full"
      >
        <MemberDetailPanel
          v-if="mapStore.selectedMember"
          :member="mapStore.selectedMember"
          class="shrink-0"
          @close="mapStore.clearSelection()"
          @edit="openEdit"
          @deleted="mapStore.clearSelection()"
          @navigate="mapStore.jumpTo($event)"
        />
      </Transition>
    </div>

    <MemberFormModal
      :open="formOpen"
      :member="editingMember"
      :get-spawn-position="getSpawnPosition"
      @close="formOpen = false"
      @saved="onSaved"
    />
  </div>
</template>
