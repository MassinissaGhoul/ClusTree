import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      // CORRECTION : Chemin adapté à votre structure
      component: () => import('../views/user/HomeView.vue')
    },
    // Routes pour les autres vues existantes
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/user/DashboardView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/user/LoginView.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/user/RegisterView.vue')
    }
  ]
})

export default router