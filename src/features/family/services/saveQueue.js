import { ref } from 'vue'

/**
 * Coalescing auto-save queue.
 *
 * `schedule(key, task)` — debounce per key: rapid updates to the same entity
 * (e.g. drag positions) collapse into one write of the latest state.
 * `run(task)` — immediate, tracked task (inserts/deletes).
 *
 * Failed tasks retry with backoff up to MAX_RETRIES, then surface in `lastError`.
 */
const DEBOUNCE_MS = 800
const MAX_RETRIES = 3

export const pendingCount = ref(0)
export const lastError = ref(null)

const timers = new Map()

async function execute(task, attempt = 0) {
  try {
    await task()
    lastError.value = null
  } catch (err) {
    if (attempt < MAX_RETRIES) {
      await new Promise((r) => setTimeout(r, 500 * 2 ** attempt))
      return execute(task, attempt + 1)
    }
    console.error('[saveQueue] task failed permanently', err)
    lastError.value = err
  }
}

export function schedule(key, task) {
  clearTimeout(timers.get(key)?.timer)
  if (!timers.has(key)) pendingCount.value += 1
  const timer = setTimeout(async () => {
    timers.delete(key)
    try {
      await execute(task)
    } finally {
      pendingCount.value -= 1
    }
  }, DEBOUNCE_MS)
  timers.set(key, { timer })
}

export async function run(task) {
  pendingCount.value += 1
  try {
    await execute(task)
  } finally {
    pendingCount.value -= 1
  }
}
