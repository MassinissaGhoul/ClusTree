import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import LoginForm from '@/components/auth/LoginForm.vue'
import { useAuthStore } from '@/stores/auth'

describe('LoginForm Component', () => {
  let wrapper
  let mockRouter

  beforeEach(() => {
    setActivePinia(createPinia())
    
    mockRouter = {
      push: vi.fn()
    }
    
    wrapper = mount(LoginForm, {
      global: {
        mocks: {
          $router: mockRouter
        },
        stubs: ['router-link']
      }
    })
  })

  describe('Component Rendering', () => {
    it('should render login form correctly', () => {
      expect(wrapper.find('h2').text()).toBe('Login')
      expect(wrapper.find('input[type="email"]').exists()).toBe(true)
      expect(wrapper.find('input[type="password"]').exists()).toBe(true)
      expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
    })

    it('should render home button', () => {
      const homeBtn = wrapper.find('.home-btn')
      
      expect(homeBtn.exists()).toBe(true)
      expect(homeBtn.text()).toBe('← Home')
    })

    it('should have correct form inputs with proper attributes', () => {
      const emailInput = wrapper.find('#email')
      const passwordInput = wrapper.find('#password')
      
      expect(emailInput.attributes('type')).toBe('email')
      expect(emailInput.attributes('required')).toBeDefined()
      expect(emailInput.attributes('placeholder')).toBe('your@email.com')
      
      expect(passwordInput.attributes('type')).toBe('password')
      expect(passwordInput.attributes('required')).toBeDefined()
      expect(passwordInput.attributes('placeholder')).toBe('Your password')
    })
  })

  describe('Form Interaction', () => {
    it('should update credentials when typing in inputs', async () => {
      const emailInput = wrapper.find('#email')
      const passwordInput = wrapper.find('#password')
      
      await emailInput.setValue('test@example.com')
      await passwordInput.setValue('password123')
      
      expect(wrapper.vm.credentials.email).toBe('test@example.com')
      expect(wrapper.vm.credentials.password).toBe('password123')
    })

    it('should show loading state during submission', async () => {
      wrapper.vm.loading = true
      await wrapper.vm.$nextTick()
      
      const submitBtn = wrapper.find('.submit-btn')
      
      expect(submitBtn.text()).toBe('Logging in...')
      expect(submitBtn.attributes('disabled')).toBeDefined()
    })

    it('should display error message when present', async () => {
      wrapper.vm.error = 'Invalid credentials'
      await wrapper.vm.$nextTick()
      
      const errorMsg = wrapper.find('.error-message')
      
      expect(errorMsg.exists()).toBe(true)
      expect(errorMsg.text()).toBe('Invalid credentials')
    })
  })

  describe('Form Submission', () => {
    it('should call login store action on form submission', async () => {
      const authStore = useAuthStore()
      vi.spyOn(authStore, 'login').mockResolvedValue({ success: true })
      
      wrapper.vm.credentials = {
        email: 'test@example.com',
        password: 'password123'
      }
      
      await wrapper.vm.handleLogin()
      
      expect(authStore.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
    })

    it('should redirect to teacher dashboard on successful teacher login', async () => {
      const authStore = useAuthStore()
      authStore.isTeacher = true
      vi.spyOn(authStore, 'login').mockResolvedValue({ success: true })
      
      await wrapper.vm.handleLogin()
      
      expect(mockRouter.push).toHaveBeenCalledWith('/teacher-dashboard')
    })

    it('should redirect to student dashboard on successful student login', async () => {
      const authStore = useAuthStore()
      authStore.isTeacher = false
      vi.spyOn(authStore, 'login').mockResolvedValue({ success: true })
      
      await wrapper.vm.handleLogin()
      
      expect(mockRouter.push).toHaveBeenCalledWith('/student-dashboard')
    })

    it('should show error on failed login', async () => {
      const authStore = useAuthStore()
      vi.spyOn(authStore, 'login').mockResolvedValue({ 
        success: false, 
        error: 'Invalid credentials' 
      })
      
      await wrapper.vm.handleLogin()
      
      expect(wrapper.vm.error).toBe('Invalid credentials')
      expect(wrapper.vm.loading).toBe(false)
    })

    it('should handle login exceptions gracefully', async () => {
      const authStore = useAuthStore()
      vi.spyOn(authStore, 'login').mockRejectedValue(new Error('Network error'))
      
      await wrapper.vm.handleLogin()
      
      expect(wrapper.vm.error).toBe('Login error. Please try again.')
      expect(wrapper.vm.loading).toBe(false)
    })
  })

  describe('Navigation', () => {
    it('should navigate to home when home button clicked', async () => {
      const homeBtn = wrapper.find('.home-btn')
      
      await homeBtn.trigger('click')
      
      expect(mockRouter.push).toHaveBeenCalledWith('/')
    })
  })

  describe('Component State Management', () => {
    it('should reset error when starting new login attempt', async () => {
      wrapper.vm.error = 'Previous error'
      
      const authStore = useAuthStore()
      vi.spyOn(authStore, 'login').mockResolvedValue({ success: true })
      
      await wrapper.vm.handleLogin()
      
      expect(wrapper.vm.error).toBeNull()
    })

    it('should manage loading state correctly throughout login process', async () => {
      const authStore = useAuthStore()
      const mockPromise = new Promise(resolve => {
        setTimeout(() => resolve({ success: true }), 50)
      })
      vi.spyOn(authStore, 'login').mockReturnValue(mockPromise)
      
      const loginPromise = wrapper.vm.handleLogin()
      
      expect(wrapper.vm.loading).toBe(true)
      
      await loginPromise
      
      expect(wrapper.vm.loading).toBe(false)
    })
  })
})