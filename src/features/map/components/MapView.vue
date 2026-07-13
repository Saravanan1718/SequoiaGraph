<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFamilyStore } from '@/features/family/store/familyStore'
import { useTreesStore } from '@/features/trees/store/treesStore'
import { pendingCount, lastError } from '@/features/family/services/saveQueue'
import { useMapStore } from '../store/mapStore'
import { useFamilyMap } from '../composables/useFamilyMap'
import { useMarkers } from '../composables/useMarkers'
import { useEdges } from '../composables/useEdges'
import { useAutoFit } from '../composables/useAutoFit'
import { useAutoPlacement } from '../composables/useAutoPlacement'
import { spawnPosition } from '../services/layoutEngine'
import MapControls from './MapControls.vue'
import SearchBar from '@/features/search/components/SearchBar.vue'
import MemberDetailPanel from '@/features/family/components/MemberDetailPanel.vue'
import MemberFormModal from '@/features/family/components/MemberFormModal.vue'
import ImportMembersModal from '@/features/family/components/ImportMembersModal.vue'
import ExportModal from './ExportModal.vue'
import SettingsPanel from '@/features/settings/components/SettingsPanel.vue'
import BaseButton from '@/shared/components/ui/BaseButton.vue'

const props = defineProps({
  treeId: { type: String, required: true },
})

const family = useFamilyStore()
const treesStore = useTreesStore()
const mapStore = useMapStore()
const route = useRoute()
const router = useRouter()

const treeName = computed(
  () => treesStore.treeById(props.treeId)?.name ?? 'Family tree',
)

const container = ref(null)
const { map, viewCenter } = useFamilyMap(container)
useMarkers(map)
useEdges(map)
const { fitAll } = useAutoFit(map)
const { arrangeAll } = useAutoPlacement()

function onArrange() {
  arrangeAll()
  fitAll()
}

const formOpen = ref(false)
const importOpen = ref(false)
const exportOpen = ref(false)
const settingsOpen = ref(false)
const editingMember = ref(null) // null → create mode

const saving = computed(() => pendingCount.value > 0)
const saveError = computed(() => lastError.value !== null)

// tree names for the header when landing directly on /tree/:id
if (treesStore.loadStatus === 'idle') treesStore.fetchAll()

// initial load → fit tree, honor ?member= deep link
mapStore.clearSelection()
family.fetchAll(props.treeId).then(() => {
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
    <div class="pointer-events-none absolute inset-0 z-1000 flex max-sm:flex-col">
      <div class="flex min-w-0 flex-1 flex-col">
        <header class="flex items-start justify-between gap-3 p-4">
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <button
              class="pointer-events-auto flex items-center gap-1.5 rounded-full bg-white/95 py-2 pl-3 pr-4 text-sm font-bold tracking-tight shadow-md backdrop-blur transition hover:bg-slate-50 dark:bg-slate-800/95 dark:hover:bg-slate-700"
              title="Back to your trees"
              @click="router.push({ name: 'trees' })"
            >
              <svg class="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clip-rule="evenodd" />
              </svg>
              <span class="max-w-40 truncate">{{ treeName }}</span>
            </button>
            <SearchBar />
          </div>
          <MapControls
            :saving="saving"
            :save-error="saveError"
            @add="openCreate"
            @import="importOpen = true"
            @zoom-in="map?.zoomIn()"
            @zoom-out="map?.zoomOut()"
            @fit="fitAll()"
            @arrange="onArrange"
            @export="exportOpen = true"
            @settings="settingsOpen = true"
          />
        </header>

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

      <!-- detail panel: flex sibling (right on desktop, bottom sheet on phones) -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="max-sm:translate-y-full sm:translate-x-full"
        leave-active-class="transition duration-150 ease-in"
        leave-to-class="max-sm:translate-y-full sm:translate-x-full"
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
    <ImportMembersModal
      :open="importOpen"
      @close="importOpen = false"
      @imported="fitAll()"
    />
    <ExportModal :open="exportOpen" @close="exportOpen = false" />
    <SettingsPanel :open="settingsOpen" @close="settingsOpen = false" />
  </div>
</template>
