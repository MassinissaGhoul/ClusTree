import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import RegisterForm from '@/components/auth/RegisterForm.vue'
import { useAuthStore } from '@/stores/auth'

describe('RegisterForm Component', () => {
  let wrapper
  let mockRouter

  beforeEach(() => {
    setActivePinia(createPinia())
    
    mockRouter = {
      push: vi.fn()
    }
    
    wrapper = mount(RegisterForm, {
      global: {
        mocks: {
          $router: mockRouter
        },
        stubs: ['router-link']
      }
    })
  })

  describe('Component Rendering', () => {
    it('should render register form correctly', () => {
      expect(wrapper.find('h2').text()).toBe('Sign Up')
      expect(wrapper.find('#firstName').exists()).toBe(true)
      expect(wrapper.find('#lastName').exists()).toBe(true)
      expect(wrapper.find('#email').exists()).toBe(true)
      expect(wrapper.find('#password').exists()).toBe(true)
      expect(wrapper.find('#confirmPassword').exists()).toBe(true)
      expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
    })

    it('should render home button with correct text', () => {
      const homeBtn = wrapper.find('.home-btn')
      
      expect(homeBtn.exists()).toBe(true)
      expect(homeBtn.text()).toBe('← Home')
    })

    it('should have all required form fields with proper attributes', () => {
      const fields = [
        { id: '#firstName', placeholder: 'Your first name' },
        { id: '#lastName', placeholder: 'Your last name' },
        { id: '#email', placeholder: 'your@email.com' },
        { id: '#password', placeholder: 'Your password' },
        { id: '#confirmPassword', placeholder: 'Confirm your password' }
      ]

      fields.forEach(field => {
        const input = wrapper.find(field.id)
        expect(input.attributes('required')).toBeDefined()
        expect(input.attributes('placeholder')).toBe(field.placeholder)
      })
    })
  })

  describe('Form Validation', () => {
    it('should enable submit button when all fields are valid', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        password: 'password123',
        confirmPassword: 'password123'
      }

      // Fill all fields
      await wrapper.find('#firstName').setValue(userData.firstName)
      await wrapper.find('#lastName').setValue(userData.lastName)
      await wrapper.find('#email').setValue(userData.email)
      await wrapper.find('#password').setValue(userData.password)
      await wrapper.find('#confirmPassword').setValue(userData.confirmPassword)

      expect(wrapper.vm.canSubmit).toBe(true)
    })

    it('should disable submit button when passwords do not match', async () => {
      await wrapper.find('#firstName').setValue('John')
      await wrapper.find('#lastName').setValue('Doe')
      await wrapper.find('#email').setValue('john@test.com')
      await wrapper.find('#password').setValue('password123')
      await wrapper.find('#confirmPassword').setValue('differentpassword')

      expect(wrapper.vm.canSubmit).toBe(false)
    })

    it('should show error when passwords do not match', async () => {
      await wrapper.find('#password').setValue('password123')
      await wrapper.find('#confirmPassword').setValue('different')

      expect(wrapper.vm.error).toBe('Passwords do not match')
    })

    it('should clear error when passwords match', async () => {
      // First set non-matching passwords
      await wrapper.find('#password').setValue('password123')
      await wrapper.find('#confirmPassword').setValue('different')
      
      expect(wrapper.vm.error).toBe('Passwords do not match')
      
      // Then fix the confirm password
      await wrapper.find('#confirmPassword').setValue('password123')
      
      expect(wrapper.vm.error).toBeNull()
    })
  })

  describe('Role Assignment Logic', () => {
    it('should assign teacher role for emails containing "teacher"', async () => {
      const authStore = useAuthStore()
      vi.spyOn(authStore, 'register').mockResolvedValue({ success: true })
      
      wrapper.vm.userData = {
        firstName: 'John',
        lastName: 'Teacher',
        email: 'john.teacher@school.com',
        password: 'password123',
        confirmPassword: 'password123'
      }
      
      await wrapper.vm.handleRegister()
      
      expect(authStore.register).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'teacher' })
      )
    })

    it('should assign teacher role for emails containing "prof"', async () => {
      const authStore = useAuthStore()
      vi.spyOn(authStore, 'register').mockResolvedValue({ success: true })
      
      wrapper.vm.userData = {
        firstName: 'Jane',
        lastName: 'Professor',
        email: 'jane.prof@university.com',
        password: 'password123',
        confirmPassword: 'password123'
      }
      
      await wrapper.vm.handleRegister()
      
      expect(authStore.register).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'teacher' })
      )
    })

    it('should assign student role by default', async () => {
      const authStore = useAuthStore()
      vi.spyOn(authStore, 'register').mockResolvedValue({ success: true })
      
      wrapper.vm.userData = {
        firstName: 'Bob',
        lastName: 'Student',
        email: 'bob.student@school.com',
        password: 'password123',
        confirmPassword: 'password123'
      }
      
      await wrapper.vm.handleRegister()
      
      expect(authStore.register).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'student' })
      )
    })
  })

  describe('Form Submission', () => {
    it('should call register store action with correct data', async () => {
      const authStore = useAuthStore()
      vi.spyOn(authStore, 'register').mockResolvedValue({ success: true })
      
      wrapper.vm.userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        password: 'password123',
        confirmPassword: 'password123'
      }
      
      await wrapper.vm.handleRegister()
      
      expect(authStore.register).toHaveBeenCalledWith({
        name: 'John Doe',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        password: 'password123',
        role: 'student'
      })
    })

    it('should redirect to appropriate dashboard after successful registration', async () => {
      const authStore = useAuthStore()
      authStore.isTeacher = true
      vi.spyOn(authStore, 'register').mockResolvedValue({ success: true })
      
      await wrapper.vm.handleRegister()
      
      expect(mockRouter.push).toHaveBeenCalledWith('/teacher-dashboard')
    })

    it('should show error on failed registration', async () => {
      const authStore = useAuthStore()
      vi.spyOn(authStore, 'register').mockResolvedValue({ 
        success: false, 
        error: 'Email already exists' 
      })
      
      await wrapper.vm.handleRegister()
      
      expect(wrapper.vm.error).toBe('Email already exists')
      expect(wrapper.vm.loading).toBe(false)
    })

    it('should handle registration exceptions', async () => {
      const authStore = useAuthStore()
      vi.spyOn(authStore, 'register').mockRejectedValue(new Error('Network error'))
      
      await wrapper.vm.handleRegister()
      
      expect(wrapper.vm.error).toBe('Registration error. Please try again.')
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

  describe('Loading State', () => {
    it('should show loading state during registration', async () => {
      wrapper.vm.loading = true
      await wrapper.vm.$nextTick()
      
      const submitBtn = wrapper.find('.submit-btn')
      
      expect(submitBtn.text()).toBe('Signing up...')
      expect(submitBtn.attributes('disabled')).toBeDefined()
    })

    it('should manage loading state correctly throughout registration process', async () => {
      const authStore = useAuthStore()
      const mockPromise = new Promise(resolve => {
        setTimeout(() => resolve({ success: true }), 50)
      })
      vi.spyOn(authStore, 'register').mockReturnValue(mockPromise)
      
      const registerPromise = wrapper.vm.handleRegister()
      
      expect(wrapper.vm.loading).toBe(true)
      
      await registerPromise
      
      expect(wrapper.vm.loading).toBe(false)
    })
  })
})