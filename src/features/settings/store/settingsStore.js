import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const STORAGE_KEY = 'kingraph:theme'

export const useSettingsStore = defineStore('settings', () => {
  /** @type {import('vue').Ref<'light'|'dark'>} */
  const theme = ref('light')

  function applyTheme() {
    document.documentElement.classList.toggle('dark', theme.value === 'dark')
  }

  function init() {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') {
      theme.value = saved
    } else {
      theme.value = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
    }
    applyTheme()
    watch(theme, () => {
      localStorage.setItem(STORAGE_KEY, theme.value)
      applyTheme()
    })
  }

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  return { theme, init, toggleTheme }
})
