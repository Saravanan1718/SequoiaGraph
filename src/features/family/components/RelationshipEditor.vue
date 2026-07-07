<script setup>
import { computed, ref } from 'vue'
import BaseButton from '@/shared/components/ui/BaseButton.vue'
import BaseSelect from '@/shared/components/ui/BaseSelect.vue'
import { useFamilyStore } from '../store/familyStore'
import { RELATIONSHIP_OPTIONS, toStoredEdge } from '../utils/kinship'

const props = defineProps({
  memberId: { type: String, required: true },
})

const family = useFamilyStore()
const uiType = ref(null)
const targetId = ref(null)
const error = ref('')

const targetOptions = computed(() =>
  family.membersArray
    .filter((m) => m.id !== props.memberId)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((m) => ({ value: m.id, label: m.name })),
)

function add() {
  error.value = ''
  if (!uiType.value || !targetId.value) {
    error.value = 'Pick a relationship and a member.'
    return
  }
  const edge = toStoredEdge(props.memberId, targetId.value, uiType.value)
  const validationError = family.addRelationship(edge)
  if (validationError) {
    error.value = validationError
    return
  }
  uiType.value = null
  targetId.value = null
}
</script>

<template>
  <div class="space-y-2">
    <div class="grid grid-cols-2 gap-2">
      <BaseSelect v-model="uiType" :options="RELATIONSHIP_OPTIONS" placeholder="Relationship…" />
      <BaseSelect v-model="targetId" :options="targetOptions" placeholder="Member…" />
    </div>
    <p v-if="error" class="text-xs text-red-600 dark:text-red-400">{{ error }}</p>
    <BaseButton size="sm" variant="secondary" class="w-full" @click="add">
      Link relationship
    </BaseButton>
  </div>
</template>
