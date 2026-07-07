<script setup>
import { ref } from 'vue'
import BaseModal from '@/shared/components/ui/BaseModal.vue'
import BaseButton from '@/shared/components/ui/BaseButton.vue'
import BaseField from '@/shared/components/ui/BaseField.vue'
import BaseInput from '@/shared/components/ui/BaseInput.vue'
import BaseSelect from '@/shared/components/ui/BaseSelect.vue'
import BaseColorInput from '@/shared/components/ui/BaseColorInput.vue'
import { useFamilyStore } from '@/features/family/store/familyStore'
import { useSettingsStore } from '@/features/settings/store/settingsStore'
import { exportPng, exportPdf } from '../services/exporter'

defineProps({
  open: { type: Boolean, required: true },
})
const emit = defineEmits(['close'])

const family = useFamilyStore()
const settings = useSettingsStore()
const { styles } = settings

const busy = ref(false)
const error = ref('')

const frameOptions = [
  { value: 'classic', label: 'Classic (double border)' },
  { value: 'simple', label: 'Simple border' },
  { value: 'none', label: 'No frame' },
]

async function run(exporter) {
  if (family.membersArray.length === 0) {
    error.value = 'Nothing to export yet — add a member first.'
    return
  }
  busy.value = true
  error.value = ''
  try {
    await exporter(family.membersArray, family.relationshipsArray, styles)
    emit('close')
  } catch (err) {
    console.error('[export] failed', err)
    error.value = 'Export failed — a member photo may block cross-origin use.'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <BaseModal :open="open" title="Export family tree" @close="emit('close')">
    <div class="space-y-3">
      <BaseField label="Title on the artwork">
        <BaseInput v-model="styles.frame.title" placeholder="Our Family Tree" />
      </BaseField>
      <BaseField label="Frame">
        <BaseSelect v-model="styles.frame.style" :options="frameOptions" />
      </BaseField>
      <BaseColorInput
        v-if="styles.frame.style !== 'none'"
        v-model="styles.frame.color"
        label="Frame & title color"
      />

      <p v-if="error" class="text-xs text-red-600 dark:text-red-400">{{ error }}</p>

      <div class="flex justify-end gap-2 pt-2">
        <BaseButton variant="secondary" :disabled="busy" @click="run(exportPng)">
          {{ busy ? 'Rendering…' : 'Download PNG' }}
        </BaseButton>
        <BaseButton :disabled="busy" @click="run(exportPdf)">
          {{ busy ? 'Rendering…' : 'Download PDF' }}
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>
