import { createRouter, createWebHistory } from 'vue-router'

const MapView = () => import('@/features/map/components/MapView.vue')

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'map',
      component: MapView,
      // deep link: /?member=<id> selects & centers that member (handled in MapView)
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})
