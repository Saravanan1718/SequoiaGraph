<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/shared/components/ui/BaseButton.vue'
import BaseConfirm from '@/shared/components/ui/BaseConfirm.vue'
import TreeFormModal from './TreeFormModal.vue'
import { useTreesStore } from '../store/treesStore'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useSettingsStore } from '@/features/settings/store/settingsStore'
import { formatDate } from '@/shared/utils/date'

const treesStore = useTreesStore()
const auth = useAuthStore()
const settings = useSettingsStore()
const router = useRouter()

const formOpen = ref(false)
const renaming = ref(null) // tree being renamed, null → create
const deleting = ref(null) // tree pending delete confirmation

onMounted(() => treesStore.fetchAll())

function openTree(tree) {
  router.push({ name: 'map', params: { treeId: tree.id } })
}

function onSubmit(name) {
  if (renaming.value) {
    treesStore.renameTree(renaming.value.id, name)
  } else {
    openTree(treesStore.createTree(name))
  }
}

function startCreate() {
  renaming.value = null
  formOpen.value = true
}

function startRename(tree) {
  renaming.value = tree
  formOpen.value = true
}

async function signOut() {
  await auth.signOut()
  treesStore.clear()
  router.replace('/login')
}
</script>

<template>
  <div class="mx-auto flex h-full max-w-5xl flex-col p-6">
    <header class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">
          Kin<span class="text-indigo-500">Graph</span>
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          {{ auth.email ?? 'Local mode — stored in this browser' }}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <BaseButton variant="ghost" size="sm" @click="settings.toggleTheme()">
          {{ settings.theme === 'dark' ? 'Light mode' : 'Dark mode' }}
        </BaseButton>
        <BaseButton v-if="auth.email" variant="secondary" size="sm" @click="signOut">
          Sign out
        </BaseButton>
      </div>
    </header>

    <p v-if="treesStore.loadStatus === 'loading'" class="text-sm text-slate-500">
      Loading your trees…
    </p>
    <p v-else-if="treesStore.loadStatus === 'error'" class="text-sm text-red-600 dark:text-red-400">
      Could not load your trees — check your connection and refresh.
    </p>

    <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <!-- tree cards -->
      <article
        v-for="tree in treesStore.trees"
        :key="tree.id"
        class="group relative cursor-pointer rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md hover:ring-indigo-400 dark:bg-slate-900 dark:ring-slate-700 dark:hover:ring-indigo-500"
        @click="openTree(tree)"
      >
        <div class="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
          <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 1a3 3 0 0 0-1 5.83V8H6a2 2 0 0 0-2 2v1.17a3.001 3.001 0 1 0 2 0V10h8v1.17a3.001 3.001 0 1 0 2 0V10a2 2 0 0 0-2-2h-3V6.83A3.001 3.001 0 0 0 10 1Z" clip-rule="evenodd" />
          </svg>
        </div>
        <h2 class="font-semibold">{{ tree.name }}</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          {{ tree.memberCount }} {{ tree.memberCount === 1 ? 'member' : 'members' }}
          <span v-if="tree.createdAt"> · created {{ formatDate(tree.createdAt) }}</span>
        </p>

        <span class="absolute right-3 top-3 flex gap-1 opacity-0 transition group-hover:opacity-100">
          <button
            class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
            aria-label="Rename tree"
            @click.stop="startRename(tree)"
          >
            <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
              <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
            </svg>
          </button>
          <button
            class="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
            aria-label="Delete tree"
            @click.stop="deleting = tree"
          >
            <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75V4H3.5a.75.75 0 0 0 0 1.5h.443l.673 10.09A2.25 2.25 0 0 0 6.86 17.7h6.28a2.25 2.25 0 0 0 2.244-2.11L16.057 5.5h.443a.75.75 0 0 0 0-1.5H14v-.25A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4h2.5v-.25c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25V4H10Z" clip-rule="evenodd" />
            </svg>
          </button>
        </span>
      </article>

      <!-- create card -->
      <button
        class="flex min-h-36 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 text-slate-400 transition hover:border-indigo-400 hover:text-indigo-500 dark:border-slate-700 dark:hover:border-indigo-500"
        @click="startCreate"
      >
        <svg class="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
        </svg>
        <span class="text-sm font-medium">Create a new tree</span>
      </button>
    </div>

    <TreeFormModal
      :open="formOpen"
      :tree="renaming"
      @close="formOpen = false"
      @submit="onSubmit"
    />
    <BaseConfirm
      :open="deleting !== null"
      title="Delete tree"
      :message="`Delete “${deleting?.name}” and everyone in it? This cannot be undone.`"
      @confirm="treesStore.deleteTree(deleting.id); deleting = null"
      @close="deleting = null"
    />
  </div>
</template>
