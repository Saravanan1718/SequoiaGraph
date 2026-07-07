import { ref, watch } from 'vue'

/** Returns a ref that mirrors `source` after `wait` ms of silence. */
export function useDebouncedRef(source, wait = 250) {
  const debounced = ref(source.value)
  let timer = null
  watch(source, (value) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      debounced.value = value
    }, wait)
  })
  return debounced
}
