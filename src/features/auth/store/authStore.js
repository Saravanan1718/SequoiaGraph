import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { supabase } from '@/core/supabase/client'
import { useFamilyStore } from '@/features/family/store/familyStore'
import { useTreesStore } from '@/features/trees/store/treesStore'

/**
 * Session state. In local mode (no Supabase configured) auth is a no-op:
 * the app behaves as a single anonymous user and the login route is skipped.
 */
export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  let initPromise = null

  /** Idempotent: resolves once the initial session is known. */
  function init() {
    if (!supabase) return Promise.resolve()
    if (!initPromise) {
      initPromise = supabase.auth.getSession().then(({ data }) => {
        user.value = data.session?.user ?? null
        supabase.auth.onAuthStateChange((_event, session) => {
          user.value = session?.user ?? null
        })
      })
    }
    return initPromise
  }

  /** True when the user may use the app (always true in local mode). */
  const isAuthenticated = computed(() => !supabase || user.value !== null)
  const email = computed(() => user.value?.email ?? null)

  /** @returns {Promise<string|null>} error message, or null on success */
  async function signIn(emailAddress, password) {
    const { error } = await supabase.auth.signInWithPassword({
      email: emailAddress,
      password,
    })
    return error?.message ?? null
  }

  /** @returns {Promise<{error: string|null, needsConfirmation: boolean}>} */
  async function signUp(emailAddress, password) {
    const { data, error } = await supabase.auth.signUp({
      email: emailAddress,
      password,
    })
    if (error) return { error: error.message, needsConfirmation: false }
    // when email confirmation is on, no session is returned yet
    return { error: null, needsConfirmation: data.session === null }
  }

  async function signOut() {
    await supabase.auth.signOut()
    // drop the previous user's data from memory
    useFamilyStore().clear()
    useTreesStore().clear()
  }

  return { user, email, isAuthenticated, init, signIn, signUp, signOut }
})
