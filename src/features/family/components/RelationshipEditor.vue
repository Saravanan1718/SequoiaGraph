<script setup>
import { computed, ref, watch } from 'vue'
import BaseButton from '@/shared/components/ui/BaseButton.vue'
import BaseSelect from '@/shared/components/ui/BaseSelect.vue'
import MemberPicker from './MemberPicker.vue'
import { useFamilyStore } from '../store/familyStore'
import { RELATIONSHIP_OPTIONS, toStoredEdge } from '../utils/kinship'

const props = defineProps({
  memberId: { type: String, required: true },
})

const family = useFamilyStore()
const uiType = ref(null)
const targetIds = ref([])
const error = ref('')
const justLinked = ref(false)
let linkedTimer = null

/**
 * How many people may be picked at once:
 *  - 'child'  → up to 2 (link mother AND father in one go)
 *  - 'spouse' → exactly 1
 *  - parent-figure types → any number of children at once
 */
const maxTargets = computed(() => {
  if (uiType.value === 'child') return 2
  if (uiType.value === 'spouse') return 1
  return 99
})

const hint = computed(() => {
  if (uiType.value === 'child') return 'Pick one or both parents.'
  if (uiType.value === 'parent') return 'Pick one or more children.'
  return ''
})

const candidates = computed(() =>
  family.membersArray.filter((m) => m.id !== props.memberId),
)

watch(uiType, () => {
  targetIds.value = targetIds.value.slice(0, maxTargets.value)
  error.value = ''
})

function link() {
  error.value = ''
  if (!uiType.value || targetIds.value.length === 0) {
    error.value = 'Pick a relationship and at least one member.'
    return
  }
  const failures = []
  for (const targetId of targetIds.value) {
    const edge = toStoredEdge(props.memberId, targetId, uiType.value)
    const validationError = family.addRelationship(edge)
    if (validationError) {
      const name = family.memberById(targetId)?.name ?? 'member'
      failures.push(`${name}: ${validationError}`)
    }
  }
  if (failures.length) {
    error.value = failures.join(' ')
    return
  }
  // clear success feedback: button flips to "✓ Linked" for a moment
  uiType.value = null
  targetIds.value = []
  justLinked.value = true
  clearTimeout(linkedTimer)
  linkedTimer = setTimeout(() => {
    justLinked.value = false
  }, 1800)
}
</script>

<template>
  <div class="space-y-2">
    <BaseSelect v-model="uiType" :options="RELATIONSHIP_OPTIONS" placeholder="Relationship…" />
    <p v-if="hint" class="text-xs text-slate-500 dark:text-slate-400">{{ hint }}</p>
    <MemberPicker v-if="uiType" v-model="targetIds" :members="candidates" :max="maxTargets" />
    <p v-if="error" class="text-xs text-red-600 dark:text-red-400">{{ error }}</p>
    <BaseButton
      size="sm"
      :variant="justLinked ? 'success' : 'primary'"
      class="w-full"
      :disabled="!justLinked && (!uiType || targetIds.length === 0)"
      @click="link"
    >
      <template v-if="justLinked">
        <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd" />
        </svg>
        Linked
      </template>
      <template v-else>
        Link {{ targetIds.length > 1 ? `${targetIds.length} relationships` : 'relationship' }}
      </template>
    </BaseButton>
  </div>
</template>
