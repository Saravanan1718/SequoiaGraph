<script setup>
import { onMounted } from 'vue'
import { useSettingsStore } from '@/features/settings/store/settingsStore'

const settings = useSettingsStore()
onMounted(() => settings.init())
</script>

<template>
  <div class="h-full bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
    <RouterView />
  </div>
</template>
