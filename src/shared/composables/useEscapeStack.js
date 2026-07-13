import { onBeforeUnmount, watch } from 'vue'

// Shared stack of open overlays so Escape only closes the topmost one.
const stack = []

/**
 * Close-on-Escape for modal-like components. Pass the reactive open state
 * and the close handler; registration follows `open` automatically.
 * @param {() => boolean} isOpen
 * @param {() => void} onClose
 */
export function useEscapeStack(isOpen, onClose) {
  const self = Symbol('overlay')

  function onKeydown(e) {
    if (e.key === 'Escape' && stack.at(-1) === self) onClose()
  }

  function register(open) {
    const idx = stack.indexOf(self)
    if (open && idx === -1) {
      stack.push(self)
      window.addEventListener('keydown', onKeydown)
    } else if (!open && idx !== -1) {
      stack.splice(idx, 1)
      window.removeEventListener('keydown', onKeydown)
    }
  }

  watch(isOpen, register)
  onBeforeUnmount(() => register(false))
}
