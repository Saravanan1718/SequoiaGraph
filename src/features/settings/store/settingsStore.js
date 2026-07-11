import { defineStore } from 'pinia'
import { reactive, ref, watch } from 'vue'

const THEME_KEY = 'sequoiaroots:theme'
const STYLES_KEY = 'sequoiaroots:styles'

export const DEFAULT_STYLES = {
  node: {
    size: 48, // avatar diameter, px
    ringColor: '#ffffff',
    showLabels: true,
  },
  edges: {
    parent: '#6366f1',
    adopted: '#6366f1',
    guardian: '#94a3b8',
    spouse: '#ec4899',
  },
  frame: {
    style: 'classic', // classic | simple | none
    color: '#334155',
    title: 'Our Family Tree',
  },
}

export const useSettingsStore = defineStore('settings', () => {
  /** @type {import('vue').Ref<'light'|'dark'>} */
  const theme = ref('light')
  const styles = reactive(structuredClone(DEFAULT_STYLES))

  function applyTheme() {
    document.documentElement.classList.toggle('dark', theme.value === 'dark')
  }

  function init() {
    const savedTheme = localStorage.getItem(THEME_KEY)
    if (savedTheme === 'light' || savedTheme === 'dark') {
      theme.value = savedTheme
    } else {
      theme.value = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
    }
    applyTheme()
    watch(theme, () => {
      localStorage.setItem(THEME_KEY, theme.value)
      applyTheme()
    })

    try {
      const savedStyles = JSON.parse(localStorage.getItem(STYLES_KEY))
      if (savedStyles) {
        // deep-merge over defaults so new keys survive old saved blobs
        for (const section of Object.keys(DEFAULT_STYLES)) {
          Object.assign(styles[section], savedStyles[section])
        }
      }
    } catch {
      /* corrupted blob — keep defaults */
    }
    watch(styles, () => localStorage.setItem(STYLES_KEY, JSON.stringify(styles)), {
      deep: true,
    })
  }

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  function resetStyles() {
    const defaults = structuredClone(DEFAULT_STYLES)
    for (const section of Object.keys(defaults)) {
      Object.assign(styles[section], defaults[section])
    }
  }

  return { theme, styles, init, toggleTheme, resetStyles }
})
