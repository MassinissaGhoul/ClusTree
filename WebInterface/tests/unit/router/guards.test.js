import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'

// Mock route helper functions
const createMockRoute = (path, meta = {}, name = null) => ({
  path,
  name: name || path.slice(1) || 'Home',
  meta
})

const createMockNext = () => vi.fn()

// Simulate the router guard logic from router/index.js
const simulateRouterGuard = (to, from, next) => {
  const authStore = useAuthStore()
  
  // Check if route requires authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }
  
  // Check role if specified
  if (to.meta.role && authStore.user?.role !== to.meta.role) {
    // Redirect to appropriate dashboard
    if (authStore.isTeacher) {
      next('/teacher-dashboard')
    } else if (authStore.isStudent) {
      next('/student-dashboard')
    } else {
      next('/login')
    }
    return
  }
  
  // Redirect authenticated users from login/register to dashboard
  if ((to.name === 'Login' || to.name === 'Register') && authStore.isAuthenticated) {
    if (authStore.isTeacher) {
      next('/teacher-dashboard')
    } else {
      next('/student-dashboard')
    }
    return
  }
  
  next()
}

describe('Router Guards', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Public Route Access', () => {
    it('should allow access to home page without authentication', () => {
      const authStore = useAuthStore()
      authStore.isAuthenticated = false
      
      const to = createMockRoute('/')
      const from = createMockRoute('/login')
      const next = createMockNext()
      
      simulateRouterGuard(to, from, next)
      
      expect(next).toHaveBeenCalledWith()
    })

    it('should allow access to public routes when authenticated', () => {
      const authStore = useAuthStore()
      authStore.isAuthenticated = true
      authStore.user = { role: 'student' }
      
      const to = createMockRoute('/')
      const from = createMockRoute('/student-dashboard')
      const next = createMockNext()
      
      simulateRouterGuard(to, from, next)
      
      expect(next).toHaveBeenCalledWith()
    })
  })

  describe('Authentication Required Routes', () => {
    it('should redirect to login for protected routes when not authenticated', () => {
      const authStore = useAuthStore()
      authStore.isAuthenticated = false
      
      const to = createMockRoute('/teacher-dashboard', { requiresAuth: true })
      const from = createMockRoute('/')
      const next = createMockNext()
      
      simulateRouterGuard(to, from, next)
      
      expect(next).toHaveBeenCalledWith('/login')
    })

    it('should allow access to protected routes when properly authenticated', () => {
      const authStore = useAuthStore()
      authStore.isAuthenticated = true
      authStore.user = { role: 'teacher' }
      
      const to = createMockRoute('/teacher-dashboard', { 
        requiresAuth: true, 
        role: 'teacher' 
      })
      const from = createMockRoute('/')
      const next = createMockNext()
      
      simulateRouterGuard(to, from, next)
      
      expect(next).toHaveBeenCalledWith()
    })
  })

  describe('Role-based Access Control', () => {
    it('should redirect teacher trying to access student dashboard', () => {
      const authStore = useAuthStore()
      authStore.isAuthenticated = true
      authStore.user = { role: 'teacher' }
      
      const to = createMockRoute('/student-dashboard', { 
        requiresAuth: true, 
        role: 'student' 
      })
      const from = createMockRoute('/')
      const next = createMockNext()
      
      simulateRouterGuard(to, from, next)
      
      expect(next).toHaveBeenCalledWith('/teacher-dashboard')
    })

    it('should redirect student trying to access teacher dashboard', () => {
      const authStore = useAuthStore()
      authStore.isAuthenticated = true
      authStore.user = { role: 'student' }
      
      const to = createMockRoute('/teacher-dashboard', { 
        requiresAuth: true, 
        role: 'teacher' 
      })
      const from = createMockRoute('/')
      const next = createMockNext()
      
      simulateRouterGuard(to, from, next)
      
      expect(next).toHaveBeenCalledWith('/student-dashboard')
    })

    it('should redirect to login when user has no role', () => {
      const authStore = useAuthStore()
      authStore.isAuthenticated = true
      authStore.user = {} // No role property
      
      const to = createMockRoute('/teacher-dashboard', { 
        requiresAuth: true, 
        role: 'teacher' 
      })
      const from = createMockRoute('/')
      const next = createMockNext()
      
      simulateRouterGuard(to, from, next)
      
      expect(next).toHaveBeenCalledWith('/login')
    })
  })

  describe('Auth Pages Redirect Logic', () => {
    it('should redirect authenticated teacher from login page to teacher dashboard', () => {
      const authStore = useAuthStore()
      authStore.isAuthenticated = true
      authStore.user = { role: 'teacher' }
      
      const to = createMockRoute('/login', {}, 'Login')
      const from = createMockRoute('/')
      const next = createMockNext()
      
      simulateRouterGuard(to, from, next)
      
      expect(next).toHaveBeenCalledWith('/teacher-dashboard')
    })

    it('should redirect authenticated student from register page to student dashboard', () => {
      const authStore = useAuthStore()
      authStore.isAuthenticated = true
      authStore.user = { role: 'student' }
      
      const to = createMockRoute('/register', {}, 'Register')
      const from = createMockRoute('/')
      const next = createMockNext()
      
      simulateRouterGuard(to, from, next)
      
      expect(next).toHaveBeenCalledWith('/student-dashboard')
    })

    it('should allow unauthenticated users to access login page', () => {
      const authStore = useAuthStore()
      authStore.isAuthenticated = false
      
      const to = createMockRoute('/login', {}, 'Login')
      const from = createMockRoute('/')
      const next = createMockNext()
      
      simulateRouterGuard(to, from, next)
      
      expect(next).toHaveBeenCalledWith()
    })

    it('should allow unauthenticated users to access register page', () => {
      const authStore = useAuthStore()
      authStore.isAuthenticated = false
      
      const to = createMockRoute('/register', {}, 'Register')
      const from = createMockRoute('/')
      const next = createMockNext()
      
      simulateRouterGuard(to, from, next)
      
      expect(next).toHaveBeenCalledWith()
    })
  })

  describe('Edge Cases and Complex Scenarios', () => {
    it('should handle missing user object gracefully', () => {
      const authStore = useAuthStore()
      authStore.isAuthenticated = true
      authStore.user = null
      
      const to = createMockRoute('/teacher-dashboard', { 
        requiresAuth: true, 
        role: 'teacher' 
      })
      const next = createMockNext()
      
      simulateRouterGuard(to, null, next)
      
      expect(next).toHaveBeenCalledWith('/login')
    })

    it('should properly handle routes without role requirements', () => {
      const authStore = useAuthStore()
      authStore.isAuthenticated = true
      authStore.user = { role: 'student' }
      
      const to = createMockRoute('/some-protected-route', { requiresAuth: true })
      const next = createMockNext()
      
      simulateRouterGuard(to, null, next)
      
      expect(next).toHaveBeenCalledWith()
    })

    it('should handle sequential route changes correctly', () => {
      const authStore = useAuthStore()
      authStore.isAuthenticated = true
      authStore.user = { role: 'teacher' }
      
      // First navigation: teacher dashboard (should work)
      let to = createMockRoute('/teacher-dashboard', { requiresAuth: true, role: 'teacher' })
      let next = createMockNext()
      
      simulateRouterGuard(to, null, next)
      expect(next).toHaveBeenCalledWith()
      
      // Second navigation: try to access student dashboard (should redirect)
      to = createMockRoute('/student-dashboard', { requiresAuth: true, role: 'student' })
      next = createMockNext()
      
      simulateRouterGuard(to, null, next)
      expect(next).toHaveBeenCalledWith('/teacher-dashboard')
    })
  })

  describe('Auth Store Integration', () => {
    it('should work correctly with auth store getters', () => {
      const authStore = useAuthStore()
      authStore.user = { role: 'teacher', name: 'John Teacher' }
      authStore.isAuthenticated = true
      
      expect(authStore.isTeacher).toBe(true)
      expect(authStore.isStudent).toBe(false)
      
      const to = createMockRoute('/teacher-dashboard', { 
        requiresAuth: true, 
        role: 'teacher' 
      })
      const next = createMockNext()
      
      simulateRouterGuard(to, null, next)
      
      expect(next).toHaveBeenCalledWith()
    })
  })
})