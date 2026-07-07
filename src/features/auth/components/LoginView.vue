<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/shared/components/ui/BaseButton.vue'
import BaseField from '@/shared/components/ui/BaseField.vue'
import BaseInput from '@/shared/components/ui/BaseInput.vue'
import { useAuthStore } from '../store/authStore'

const auth = useAuthStore()
const router = useRouter()

const mode = ref('signin') // signin | signup
const email = ref('')
const password = ref('')
const busy = ref(false)
const error = ref('')
const notice = ref('')

async function submit() {
  error.value = ''
  notice.value = ''
  if (!email.value.trim() || password.value.length < 6) {
    error.value = 'Enter your email and a password of at least 6 characters.'
    return
  }
  busy.value = true
  try {
    if (mode.value === 'signin') {
      const err = await auth.signIn(email.value.trim(), password.value)
      if (err) {
        error.value = err
        return
      }
      router.replace('/')
    } else {
      const { error: err, needsConfirmation } = await auth.signUp(
        email.value.trim(),
        password.value,
      )
      if (err) {
        error.value = err
        return
      }
      if (needsConfirmation) {
        notice.value = 'Check your inbox and confirm your email, then sign in.'
        mode.value = 'signin'
      } else {
        router.replace('/')
      }
    }
  } finally {
    busy.value = false
  }
}

function switchMode() {
  mode.value = mode.value === 'signin' ? 'signup' : 'signin'
  error.value = ''
  notice.value = ''
}
</script>

<template>
  <div class="flex h-full items-center justify-center bg-slate-100 p-4 dark:bg-slate-950">
    <div class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 dark:ring-1 dark:ring-slate-700">
      <h1 class="mb-1 text-center text-xl font-bold tracking-tight">
        Kin<span class="text-indigo-500">Graph</span>
      </h1>
      <p class="mb-6 text-center text-sm text-slate-500 dark:text-slate-400">
        {{ mode === 'signin' ? 'Sign in to your family tree' : 'Create an account to start your tree' }}
      </p>

      <form class="space-y-3" @submit.prevent="submit">
        <BaseField label="Email">
          <BaseInput v-model="email" type="email" placeholder="you@example.com" />
        </BaseField>
        <BaseField label="Password">
          <BaseInput v-model="password" type="password" placeholder="••••••••" />
        </BaseField>

        <p v-if="error" class="text-xs text-red-600 dark:text-red-400">{{ error }}</p>
        <p v-if="notice" class="text-xs text-emerald-600 dark:text-emerald-400">{{ notice }}</p>

        <BaseButton type="submit" class="w-full" :disabled="busy">
          {{ busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account' }}
        </BaseButton>
      </form>

      <button
        class="mt-4 w-full text-center text-sm text-indigo-600 hover:underline dark:text-indigo-400"
        @click="switchMode"
      >
        {{ mode === 'signin' ? "New here? Create an account" : 'Already have an account? Sign in' }}
      </button>
    </div>
  </div>
</template>
