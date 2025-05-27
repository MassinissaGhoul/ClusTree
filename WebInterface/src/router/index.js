// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Import des vues
import HomeView from '@/views/user/HomeView.vue'
import LoginView from '@/views/user/LoginView.vue'
import RegisterView from '@/views/user/RegisterView.vue'
import TeacherDashboard from '@/views/user/TeacherDashboard.vue'
import StudentDashboard from '@/views/user/StudentDashboard.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView
  },
  {
    path: '/teacher-dashboard',
    name: 'TeacherDashboard',
    component: TeacherDashboard,
    meta: { requiresAuth: true, role: 'teacher' }
  },
  {
    path: '/student-dashboard',
    name: 'StudentDashboard',
    component: StudentDashboard,
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guard de navigation pour vérifier l'authentification
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Vérifier si la route nécessite une authentification
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }
  
  // Vérifier le rôle si spécifié
  if (to.meta.role && authStore.user?.role !== to.meta.role) {
    // Rediriger vers le dashboard approprié
    if (authStore.isTeacher) {
      next('/teacher-dashboard')
    } else if (authStore.isStudent) {
      next('/student-dashboard')
    } else {
      next('/login')
    }
    return
  }
  
  // Rediriger les utilisateurs connectés depuis login/register vers leur dashboard
  if ((to.name === 'Login' || to.name === 'Register') && authStore.isAuthenticated) {
    if (authStore.isTeacher) {
      next('/teacher-dashboard')
    } else {
      next('/student-dashboard')
    }
    return
  }
  
  next()
})

export default router