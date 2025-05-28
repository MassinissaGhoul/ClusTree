// stores/auth.js - Version finale sans conflits
import { defineStore } from 'pinia'
import ApiService from '@/services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    token: null,
    loading: false,
    error: null
  }),

  getters: {
    isTeacher: (state) => {
      if (!state.user) return false
      if (typeof state.user.role === 'number') {
        return state.user.role === 2 // 2 = teacher
      }
      return state.user.role === 'teacher'
    },
    
    isStudent: (state) => {
      if (!state.user) return false
      if (typeof state.user.role === 'number') {
        return state.user.role === 3 // 3 = student
      }
      return state.user.role === 'student'
    },
    
    userName: (state) => {
      if (!state.user) return ''
      return `${state.user.name || ''} ${state.user.family_name || ''}`.trim()
    },
    
    userEmail: (state) => state.user?.email || '',
    userId: (state) => state.user?.id || null,
    
    userRoleString: (state) => {
      if (!state.user) return 'student'
      if (typeof state.user.role === 'number') {
        return state.user.role === 2 ? 'teacher' : 'student'
      }
      return state.user.role || 'student'
    }
  },

  actions: {
    async login(credentials) {
      this.loading = true
      this.error = null
      
      try {
        console.log('🔐 Tentative de connexion...', credentials.email)
        
        const response = await ApiService.login(credentials)
        
        this.user = response.user
        this.token = response.token
        this.isAuthenticated = true
        
        localStorage.setItem('auth_token', this.token)
        
        console.log('✅ Connexion réussie:', this.userRoleString)
        return { success: true, user: this.user }
        
      } catch (error) {
        console.error('❌ Erreur de connexion:', error.message)
        this.error = error.message
        this.logout()
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    async register(userData) {
      this.loading = true
      this.error = null
      
      try {
        console.log('📝 Tentative d\'inscription...', userData.email)
        
        await ApiService.register(userData)
        
        console.log('✅ Inscription réussie, connexion automatique...')
        
        return await this.login({
          email: userData.email,
          password: userData.password
        })
        
      } catch (error) {
        console.error('❌ Erreur d\'inscription:', error.message)
        this.error = error.message
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    logout() {
      console.log('👋 Déconnexion...')
      this.user = null
      this.isAuthenticated = false
      this.token = null
      this.error = null
      
      localStorage.removeItem('auth_token')
      ApiService.clearToken()
    },

    async initAuth() {
      const savedToken = localStorage.getItem('auth_token')
      
      if (!savedToken) {
        console.log('🔍 Aucun token sauvegardé')
        this.logout()
        return
      }
      
      console.log('🔍 Token trouvé, vérification...')
      
      try {
        const userProfile = await ApiService.getMyProfile()
        
        this.token = savedToken
        this.user = userProfile
        this.isAuthenticated = true
        
        console.log('✅ Reconnexion automatique réussie:', this.userRoleString)
        
      } catch (error) {
        console.log('❌ Token invalide, déconnexion automatique')
        this.logout()
      }
    },

    async updateProfile(profileData) {
      this.loading = true
      this.error = null
      
      try {
        await ApiService.updateProfile(profileData)
        
        const updatedProfile = await ApiService.getMyProfile()
        this.user = {
          ...this.user,
          ...updatedProfile
        }
        
        return { success: true }
        
      } catch (error) {
        this.error = error.message
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    async deleteAccount() {
      this.loading = true
      this.error = null
      
      try {
        await ApiService.deleteAccount()
        this.logout()
        return { success: true }
        
      } catch (error) {
        this.error = error.message
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    async checkTokenValidity() {
      if (!this.token) return false
      
      try {
        const isValid = await ApiService.verifyToken()
        if (!isValid) {
          this.logout()
        }
        return isValid
      } catch {
        this.logout()
        return false
      }
    }
  }
})