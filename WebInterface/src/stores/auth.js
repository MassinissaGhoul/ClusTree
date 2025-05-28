// stores/auth.js - Version adaptée pour le backend réel
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
    // Adaptation aux rôles du backend (ID -> string)
    isTeacher: (state) => {
      if (!state.user) return false
      // Si le rôle est un ID (3 = teacher selon votre .env)
      if (typeof state.user.role === 'number') {
        return state.user.role === 2 // Assumant que 2 = teacher, 3 = student
      }
      // Si le rôle est une chaîne
      return state.user.role === 'teacher'
    },
    
    isStudent: (state) => {
      if (!state.user) return false
      // Si le rôle est un ID (3 = student selon votre .env)
      if (typeof state.user.role === 'number') {
        return state.user.role === 3 // Selon votre DEFAULT_ROLE_ID=3
      }
      // Si le rôle est une chaîne
      return state.user.role === 'student'
    },
    
    userName: (state) => {
      if (!state.user) return ''
      return `${state.user.name || ''} ${state.user.family_name || ''}`.trim()
    },
    
    userEmail: (state) => state.user?.email || '',
    userId: (state) => state.user?.id || null,
    
    // Getter pour obtenir le rôle en tant que chaîne
    userRoleString: (state) => {
      if (!state.user) return 'student'
      if (typeof state.user.role === 'number') {
        return state.user.role === 2 ? 'teacher' : 'student'
      }
      return state.user.role || 'student'
    }
  },

  actions: {
    // === CONNEXION ===
    async login(credentials) {
      this.loading = true
      this.error = null
      
      try {
        console.log('🔐 Tentative de connexion...', credentials.email)
        
        // Appel API réel
        const response = await ApiService.login(credentials)
        
        // Le backend retourne { user: userData, token }
        this.user = response.user
        this.token = response.token
        this.isAuthenticated = true
        
        // Sauvegarder le token pour les futures requêtes
        localStorage.setItem('auth_token', this.token)
        
        console.log('✅ Connexion réussie:', this.userRoleString)
        return { success: true, user: this.user }
        
      } catch (error) {
        console.error('❌ Erreur de connexion:', error.message)
        this.error = error.message
        this.logout() // Nettoyer l'état en cas d'erreur
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    // === INSCRIPTION ===
    async register(userData) {
      this.loading = true
      this.error = null
      
      try {
        console.log('📝 Tentative d\'inscription...', userData.email)
        
        // Appel API d'inscription
        await ApiService.register(userData)
        
        console.log('✅ Inscription réussie, connexion automatique...')
        
        // Après inscription réussie, connecter automatiquement l'utilisateur
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

    // === DÉCONNEXION ===
    logout() {
      console.log('👋 Déconnexion...')
      this.user = null
      this.isAuthenticated = false
      this.token = null
      this.error = null
      
      // Nettoyer le localStorage
      localStorage.removeItem('auth_token')
      ApiService.clearToken()
    },

    // === INITIALISATION AU DÉMARRAGE ===
    async initAuth() {
      const savedToken = localStorage.getItem('auth_token')
      
      if (!savedToken) {
        console.log('🔍 Aucun token sauvegardé')
        this.logout()
        return
      }
      
      console.log('🔍 Token trouvé, vérification...')
      
      try {
        // Vérifier si le token est encore valide en récupérant le profil
        const userProfile = await ApiService.getMyProfile()
        
        // Si on arrive ici, le token est valide
        this.token = savedToken
        this.user = userProfile // Le backend devrait retourner toutes les infos user y compris le role_id
        this.isAuthenticated = true
        
        console.log('✅ Reconnexion automatique réussie:', this.userRoleString)
        
      } catch (error) {
        console.log('❌ Token invalide, déconnexion automatique')
        this.logout()
      }
    },

    // === MISE À JOUR DU PROFIL ===
    async updateProfile(profileData) {
      this.loading = true
      this.error = null
      
      try {
        await ApiService.updateProfile(profileData)
        
        // Rafraîchir les données utilisateur
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

    // === SUPPRESSION DU COMPTE ===
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

    // === VÉRIFICATION DU TOKEN ===
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