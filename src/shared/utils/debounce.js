/** Trailing-edge debounce. The returned function exposes .cancel() and .flush(). */
export function debounce(fn, wait) {
  let timer = null
  let lastArgs = null

  function debounced(...args) {
    lastArgs = args
    clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      fn(...lastArgs)
    }, wait)
  }

  debounced.cancel = () => {
    clearTimeout(timer)
    timer = null
  }
  debounced.flush = () => {
    if (timer === null) return
    debounced.cancel()
    fn(...lastArgs)
  }

  return debounced
}
