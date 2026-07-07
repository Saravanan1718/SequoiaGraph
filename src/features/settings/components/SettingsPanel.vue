<script setup>
import { useRouter } from 'vue-router'
import BaseModal from '@/shared/components/ui/BaseModal.vue'
import BaseButton from '@/shared/components/ui/BaseButton.vue'
import BaseColorInput from '@/shared/components/ui/BaseColorInput.vue'
import { useSettingsStore } from '../store/settingsStore'
import { useAuthStore } from '@/features/auth/store/authStore'

defineProps({
  open: { type: Boolean, required: true },
})
const emit = defineEmits(['close'])

const settings = useSettingsStore()
const { styles } = settings
const auth = useAuthStore()
const router = useRouter()

async function signOut() {
  await auth.signOut()
  emit('close')
  router.replace('/login')
}
</script>

<template>
  <BaseModal :open="open" title="Appearance settings" @close="emit('close')">
    <div class="space-y-5">
      <section class="space-y-2.5">
        <h3 class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Nodes
        </h3>
        <label class="flex items-center justify-between gap-2 text-sm">
          <span class="text-slate-600 dark:text-slate-300">Avatar size</span>
          <span class="flex items-center gap-2">
            <input
              v-model.number="styles.node.size"
              type="range"
              min="32"
              max="80"
              step="4"
              class="w-32 accent-indigo-600"
            />
            <span class="w-10 text-right font-mono text-xs text-slate-400">
              {{ styles.node.size }}px
            </span>
          </span>
        </label>
        <BaseColorInput v-model="styles.node.ringColor" label="Ring color" />
        <label class="flex items-center justify-between gap-2 text-sm">
          <span class="text-slate-600 dark:text-slate-300">Show name labels</span>
          <input
            v-model="styles.node.showLabels"
            type="checkbox"
            class="h-4 w-4 accent-indigo-600"
          />
        </label>
      </section>

      <section class="space-y-2.5">
        <h3 class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Connection lines
        </h3>
        <BaseColorInput v-model="styles.edges.parent" label="Parent / child" />
        <BaseColorInput v-model="styles.edges.adopted" label="Adopted (dashed)" />
        <BaseColorInput v-model="styles.edges.guardian" label="Guardian (dotted)" />
        <BaseColorInput v-model="styles.edges.spouse" label="Spouse" />
      </section>

      <section v-if="auth.email" class="space-y-2">
        <h3 class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Account
        </h3>
        <div class="flex items-center justify-between gap-2 text-sm">
          <span class="truncate text-slate-600 dark:text-slate-300">{{ auth.email }}</span>
          <BaseButton variant="secondary" size="sm" @click="signOut">Sign out</BaseButton>
        </div>
      </section>

      <div class="flex justify-between pt-1">
        <BaseButton variant="ghost" size="sm" @click="settings.resetStyles()">
          Reset to defaults
        </BaseButton>
        <BaseButton size="sm" @click="emit('close')">Done</BaseButton>
      </div>
    </div>
  </BaseModal>
</template>
