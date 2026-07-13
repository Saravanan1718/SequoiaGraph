<script setup>
import { ref, watch } from 'vue'
import BaseModal from '@/shared/components/ui/BaseModal.vue'
import BaseButton from '@/shared/components/ui/BaseButton.vue'
import { parseFile, downloadTemplate } from '../services/importService'
import { validateRows } from '../services/importValidation'
import { useFamilyStore } from '../store/familyStore'

const props = defineProps({
  open: { type: Boolean, required: true },
})
const emit = defineEmits(['close', 'imported'])

const family = useFamilyStore()
const fileInput = ref(null)

// idle → preview → importing
const step = ref('idle')
const fileName = ref('')
const fileError = ref('')
const report = ref(null) // { people, errors, warnings }

watch(
  () => props.open,
  (open) => {
    if (!open) return
    step.value = 'idle'
    fileName.value = ''
    fileError.value = ''
    report.value = null
  },
)

async function onFilePicked(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return

  fileError.value = ''
  fileName.value = file.name
  try {
    const rows = await parseFile(file)
    if (!rows.length) {
      fileError.value = 'No rows found in that file.'
      return
    }
    report.value = validateRows(rows, family.membersArray)
    step.value = 'preview'
  } catch (err) {
    console.error('[import] parse failed', err)
    fileError.value = 'Could not read that file. Use the template (.xlsx or .csv).'
  }
}

/** Grid positions below the current tree so imports don't stack at the origin. */
function gridPositions(count) {
  const existing = family.membersArray
  const startY = existing.length ? Math.max(...existing.map((m) => m.posY)) + 160 : 0
  const cols = Math.ceil(Math.sqrt(count))
  return Array.from({ length: count }, (_, i) => ({
    x: (i % cols) * 200,
    y: startY + Math.floor(i / cols) * 140,
  }))
}

function runImport() {
  const { people } = report.value
  step.value = 'importing'
  const positions = gridPositions(people.length)
  people.forEach((draft, i) => {
    family.addMember({ ...draft, posX: positions[i].x, posY: positions[i].y })
  })
  emit('imported', people.length)
  emit('close')
}
</script>

<template>
  <BaseModal :open="open" title="Import members" @close="emit('close')">
    <!-- Step 1: pick a file -->
    <div v-if="step === 'idle'" class="space-y-4">
      <p class="text-sm text-slate-600 dark:text-slate-300">
        Upload a spreadsheet of people (.xlsx or .csv). Phone, email and birth
        place are saved into each member's notes.
      </p>

      <div class="flex flex-wrap gap-2">
        <BaseButton @click="fileInput?.click()">Choose file…</BaseButton>
        <BaseButton variant="secondary" @click="downloadTemplate">Download template</BaseButton>
      </div>

      <p v-if="fileError" class="text-sm text-red-600">{{ fileError }}</p>
      <input
        ref="fileInput"
        type="file"
        accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
        class="hidden"
        @change="onFilePicked"
      />
    </div>

    <!-- Step 2: preview -->
    <div v-else-if="step === 'preview'" class="space-y-4">
      <p class="text-xs text-slate-500 dark:text-slate-400">{{ fileName }}</p>

      <p class="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
        <span aria-hidden="true">✓</span>
        {{ report.people.length }} {{ report.people.length === 1 ? 'person' : 'people' }} found
      </p>

      <div v-if="report.errors.length" class="rounded-lg bg-red-50 p-3 dark:bg-red-950/40">
        <p class="mb-1 text-xs font-semibold text-red-700 dark:text-red-400">
          Skipped ({{ report.errors.length }})
        </p>
        <ul class="max-h-24 space-y-0.5 overflow-y-auto text-xs text-red-700 dark:text-red-300">
          <li v-for="(msg, i) in report.errors" :key="i">{{ msg }}</li>
        </ul>
      </div>

      <div v-if="report.warnings.length" class="rounded-lg bg-amber-50 p-3 dark:bg-amber-950/40">
        <p class="mb-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
          Warnings ({{ report.warnings.length }})
        </p>
        <ul class="max-h-32 space-y-0.5 overflow-y-auto text-xs text-amber-800 dark:text-amber-200">
          <li v-for="(msg, i) in report.warnings" :key="i">{{ msg }}</li>
        </ul>
      </div>

      <div class="flex justify-end gap-2 pt-2">
        <BaseButton variant="secondary" @click="emit('close')">Cancel</BaseButton>
        <BaseButton
          variant="success"
          :disabled="!report.people.length"
          @click="runImport"
        >
          Import {{ report.people.length }} {{ report.people.length === 1 ? 'member' : 'members' }}
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>
