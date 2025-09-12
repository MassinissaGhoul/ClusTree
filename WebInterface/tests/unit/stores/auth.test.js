import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const store = useAuthStore()
      
      expect(store.user).toBeNull()
      expect(store.isAuthenticated).toBe(false)
      expect(store.token).toBeNull()
    })
  })

  describe('Getters', () => {
    it('should identify teacher role correctly', () => {
      const store = useAuthStore()
      store.user = { role: 'teacher', name: 'John Doe' }
      
      expect(store.isTeacher).toBe(true)
      expect(store.isStudent).toBe(false)
    })

    it('should identify student role correctly', () => {
      const store = useAuthStore()
      store.user = { role: 'student', name: 'Jane Doe' }
      
      expect(store.isStudent).toBe(true)
      expect(store.isTeacher).toBe(false)
    })

    it('should return correct user name', () => {
      const store = useAuthStore()
      store.user = { name: 'John Doe' }
      
      expect(store.userName).toBe('John Doe')
    })

    it('should return empty string when no user', () => {
      const store = useAuthStore()
      
      expect(store.userName).toBe('')
    })
  })

  describe('Login Action', () => {
    it('should login teacher successfully', async () => {
      const store = useAuthStore()
      const credentials = { email: 'teacher@test.com', password: 'password' }
      
      const result = await store.login(credentials)
      
      expect(result.success).toBe(true)
      expect(store.isAuthenticated).toBe(true)
      expect(store.user.role).toBe('teacher')
      expect(store.token).toBe('mock-jwt-token')
    })

    it('should login student successfully', async () => {
      const store = useAuthStore()
      const credentials = { email: 'student@test.com', password: 'password' }
      
      const result = await store.login(credentials)
      
      expect(result.success).toBe(true)
      expect(store.isAuthenticated).toBe(true)
      expect(store.user.role).toBe('student')
    })

    it('should determine role based on email content', async () => {
      const store = useAuthStore()
      
      let result = await store.login({ email: 'prof@university.com', password: 'test' })
      expect(result.user.role).toBe('teacher')
      
      store.logout()
      
      result = await store.login({ email: 'student@university.com', password: 'test' })
      expect(result.user.role).toBe('student')
    })
  })

  describe('Register Action', () => {
    it('should register new user successfully', async () => {
      const store = useAuthStore()
      const userData = {
        name: 'John Doe',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        role: 'student'
      }
      
      const result = await store.register(userData)
      
      expect(result.success).toBe(true)
      expect(store.isAuthenticated).toBe(true)
      expect(store.user.name).toBe('John Doe')
      expect(store.user.role).toBe('student')
    })

    it('should handle registration with teacher role', async () => {
      const store = useAuthStore()
      const userData = {
        name: 'Jane Teacher',
        email: 'jane@teacher.com',
        role: 'teacher'
      }
      
      const result = await store.register(userData)
      
      expect(result.success).toBe(true)
      expect(store.user.role).toBe('teacher')
    })
  })

  describe('Logout Action', () => {
    it('should logout user and clear state', () => {
      const store = useAuthStore()
      
      // Set authenticated state
      store.user = { id: 1, name: 'John' }
      store.isAuthenticated = true
      store.token = 'some-token'
      
      store.logout()
      
      expect(store.user).toBeNull()
      expect(store.isAuthenticated).toBe(false)
      expect(store.token).toBeNull()
    })
  })

  describe('InitAuth Action', () => {
    it('should initialize with logged out state', () => {
      const store = useAuthStore()
      
      // Set some state first
      store.user = { id: 1, name: 'John' }
      store.isAuthenticated = true
      
      store.initAuth()
      
      expect(store.user).toBeNull()
      expect(store.isAuthenticated).toBe(false)
      expect(store.token).toBeNull()
    })
  })
})