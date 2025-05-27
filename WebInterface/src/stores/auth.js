// stores/auth.js
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    token: null
  }),

  getters: {
    isTeacher: (state) => state.user?.role === 'teacher',
    isStudent: (state) => state.user?.role === 'student',
    userName: (state) => state.user?.name || ''
  },

  actions: {
    async login(credentials) {
      try {
        // TODO: Remplacer par appel API réel
        // const response = await api.post('/auth/login', credentials)
        
        // Simulation temporaire
        const mockUser = {
          id: 1,
          name: credentials.email.split('@')[0],
          email: credentials.email,
          role: credentials.email.includes('teacher') ? 'teacher' : 'student'
        }
        
        this.user = mockUser
        this.isAuthenticated = true
        this.token = 'mock-jwt-token'
        
        return { success: true, user: mockUser }
      } catch (error) {
        return { success: false, error: error.message }
      }
    },

    async register(userData) {
      try {
        // TODO: Remplacer par appel API réel
        // const response = await api.post('/auth/register', userData)
        
        // Simulation temporaire
        const newUser = {
          id: Date.now(),
          name: userData.name,
          firstName: userData.firstName || userData.name.split(' ')[0],
          lastName: userData.lastName || userData.name.split(' ')[1] || '',
          email: userData.email,
          role: userData.role
        }
        
        this.user = newUser
        this.isAuthenticated = true
        this.token = 'mock-jwt-token'
        
        return { success: true, user: newUser }
      } catch (error) {
        return { success: false, error: error.message }
      }
    },

    logout() {
      this.user = null
      this.isAuthenticated = false
      this.token = null
    },

    // Vérifier si l'utilisateur est connecté au démarrage
    initAuth() {
      // TODO: Vérifier le token stocké ou la session
      // Pour l'instant, on part du principe que l'utilisateur n'est pas connecté
      this.logout()
    }
  }
})