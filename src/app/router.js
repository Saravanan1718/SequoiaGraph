import { createRouter, createWebHistory } from 'vue-router'
import { isSupabaseConfigured } from '@/core/config'
import { useAuthStore } from '@/features/auth/store/authStore'

const TreeListView = () => import('@/features/trees/components/TreeListView.vue')
const MapView = () => import('@/features/map/components/MapView.vue')
const LoginView = () => import('@/features/auth/components/LoginView.vue')

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'trees', component: TreeListView },
    {
      path: '/tree/:treeId',
      name: 'map',
      component: MapView,
      props: true,
      // deep link: ?member=<id> selects & centers that member (handled in MapView)
    },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

// Auth guard — inert in local mode (no Supabase configured).
router.beforeEach(async (to) => {
  if (!isSupabaseConfigured) {
    return to.name === 'login' ? { name: 'trees' } : true
  }
  const auth = useAuthStore()
  await auth.init() // resolves once the initial session is known
  if (!auth.isAuthenticated && to.name !== 'login') return { name: 'login' }
  if (auth.isAuthenticated && to.name === 'login') return { name: 'trees' }
  return true
})
