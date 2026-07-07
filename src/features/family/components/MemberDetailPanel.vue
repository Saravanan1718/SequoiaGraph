<script setup>
import { computed, ref } from 'vue'
import BaseAvatar from '@/shared/components/ui/BaseAvatar.vue'
import BaseButton from '@/shared/components/ui/BaseButton.vue'
import BaseConfirm from '@/shared/components/ui/BaseConfirm.vue'
import RelationshipEditor from './RelationshipEditor.vue'
import { useFamilyStore } from '../store/familyStore'
import { edgeLabelFor } from '../utils/kinship'
import { lifespan, age } from '@/shared/utils/date'

const props = defineProps({
  member: { type: Object, required: true },
})
const emit = defineEmits(['edit', 'close', 'deleted', 'navigate'])

const family = useFamilyStore()
const confirmDelete = ref(false)

const life = computed(() => lifespan(props.member.birthDate, props.member.deathDate))
const years = computed(() => age(props.member.birthDate, props.member.deathDate))

/** Stored edges + derived siblings, all rendered alike. */
const relationEntries = computed(() => {
  const stored = family.relationshipsOf(props.member.id).map((rel) => {
    const otherId = rel.fromId === props.member.id ? rel.toId : rel.fromId
    return {
      key: rel.id,
      relId: rel.id,
      label: edgeLabelFor(props.member.id, rel),
      other: family.memberById(otherId),
    }
  })
  const siblings = family.siblingsOf(props.member.id).map((id) => ({
    key: `sibling:${id}`,
    relId: null, // derived — not deletable
    label: 'Sibling',
    other: family.memberById(id),
  }))
  return [...stored, ...siblings].filter((e) => e.other)
})

function onDelete() {
  confirmDelete.value = false
  family.deleteMember(props.member.id)
  emit('deleted')
}
</script>

<template>
  <aside
    class="pointer-events-auto flex h-full w-80 max-w-full flex-col gap-4 overflow-y-auto bg-white/95 p-5 shadow-xl backdrop-blur dark:bg-slate-900/95 dark:ring-1 dark:ring-slate-700"
  >
    <div class="flex items-start justify-between">
      <div class="flex items-center gap-3">
        <BaseAvatar :name="member.name" :photo-url="member.photoUrl" size="lg" />
        <div>
          <h2 class="text-lg font-semibold leading-tight">{{ member.name }}</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400">
            {{ life }}<span v-if="years !== null"> · {{ years }} yrs</span>
          </p>
        </div>
      </div>
      <button
        class="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
        aria-label="Close panel"
        @click="emit('close')"
      >
        <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
        </svg>
      </button>
    </div>

    <dl class="space-y-1 text-sm">
      <div v-if="member.occupation" class="flex gap-2">
        <dt class="w-24 shrink-0 text-slate-500 dark:text-slate-400">Occupation</dt>
        <dd>{{ member.occupation }}</dd>
      </div>
      <div v-if="member.gender" class="flex gap-2">
        <dt class="w-24 shrink-0 text-slate-500 dark:text-slate-400">Gender</dt>
        <dd class="capitalize">{{ member.gender }}</dd>
      </div>
      <div v-if="member.notes" class="flex gap-2">
        <dt class="w-24 shrink-0 text-slate-500 dark:text-slate-400">Notes</dt>
        <dd class="whitespace-pre-line">{{ member.notes }}</dd>
      </div>
    </dl>

    <section>
      <h3 class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Relationships
      </h3>
      <ul v-if="relationEntries.length" class="mb-3 space-y-1.5">
        <li
          v-for="entry in relationEntries"
          :key="entry.key"
          class="flex items-center justify-between gap-2 rounded-lg bg-slate-100 px-2.5 py-1.5 text-sm dark:bg-slate-800"
        >
          <button
            class="flex min-w-0 items-center gap-2 hover:underline"
            @click="emit('navigate', entry.other.id)"
          >
            <BaseAvatar :name="entry.other.name" :photo-url="entry.other.photoUrl" size="sm" />
            <span class="truncate">{{ entry.other.name }}</span>
          </button>
          <span class="flex shrink-0 items-center gap-1.5">
            <span class="text-xs text-slate-500 dark:text-slate-400">{{ entry.label }}</span>
            <button
              v-if="entry.relId"
              class="rounded p-0.5 text-slate-400 hover:text-red-500"
              aria-label="Remove relationship"
              @click="family.removeRelationship(entry.relId)"
            >
              <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75V4H3.5a.75.75 0 0 0 0 1.5h.443l.673 10.09A2.25 2.25 0 0 0 6.86 17.7h6.28a2.25 2.25 0 0 0 2.244-2.11L16.057 5.5h.443a.75.75 0 0 0 0-1.5H14v-.25A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4h2.5v-.25c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25V4H10Z" clip-rule="evenodd" />
              </svg>
            </button>
          </span>
        </li>
      </ul>
      <p v-else class="mb-3 text-sm text-slate-400">No relationships yet.</p>
      <RelationshipEditor :member-id="member.id" />
    </section>

    <div class="mt-auto flex gap-2 pt-2">
      <BaseButton class="flex-1" variant="secondary" @click="emit('edit')">Edit</BaseButton>
      <BaseButton variant="danger" @click="confirmDelete = true">Delete</BaseButton>
    </div>

    <BaseConfirm
      :open="confirmDelete"
      title="Delete member"
      :message="`Delete ${member.name} and all of their relationships? This cannot be undone.`"
      @confirm="onDelete"
      @close="confirmDelete = false"
    />
  </aside>
</template>
