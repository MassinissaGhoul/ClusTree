// services/api.js - Service pour communiquer avec le backend réel (Version Vite)
class ApiService {
  constructor() {
    // Dans Vite, utiliser import.meta.env au lieu de process.env
    // Les variables doivent commencer par VITE_
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
  }

  // Méthode générique pour faire des requêtes HTTP
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    }

    // Récupérer le token depuis le localStorage pour les requêtes authentifiées
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    try {
      console.log(`🔵 API Request: ${config.method || 'GET'} ${url}`)
      if (config.body) {
        console.log('📤 Request Body:', JSON.parse(config.body))
      }
      
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.text()
        let errorMessage
        try {
          const parsedError = JSON.parse(errorData)
          errorMessage = parsedError.error || `HTTP ${response.status}`
        } catch {
          errorMessage = errorData || `HTTP ${response.status}`
        }
        throw new Error(errorMessage)
      }
      
      const data = await response.json()
      console.log('📥 API Response:', data)
      return data
    } catch (error) {
      console.error('❌ API Error:', error.message)
      throw error
    }
  }

  // === AUTHENTIFICATION ===
  
  async login(credentials) {
    const response = await this.request('/user/login', {
      method: 'POST',
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password
      })
    })
    
    // Le backend retourne { user: userData, token }
    return response
  }

  async register(userData) {
    const response = await this.request('/user/register', {
      method: 'POST',
      body: JSON.stringify({
        email: userData.email,
        name: userData.firstName,
        family_name: userData.lastName,
        password: userData.password
      })
    })
    
    // Le backend retourne { id: ... }
    return response
  }

  async getMyProfile() {
    return this.request('/user/me')
  }

  async updateProfile(profileData) {
    return this.request('/user/me', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    })
  }

  async deleteAccount() {
    return this.request('/user/me', {
      method: 'DELETE'
    })
  }

  // === CLUSTERS (PROFESSEUR) ===
  
  async createCluster(clusterData) {
    return this.request('/cluster/teacher/create', {
      method: 'POST',
      body: JSON.stringify({
        name: clusterData.name,
        maxAffinity: clusterData.maxAffinity,
        groupSize: clusterData.groupSize
      })
    })
  }

  async getTeacherClusters() {
    return this.request('/cluster/teacher/list')
  }

  // === CLUSTERS (ÉTUDIANT) ===
  
  async getStudentClusters() {
    return this.request('/cluster/student/list')
  }

  // === CLUSTERS (PARTAGÉ) ===
  
  async getClusterGraph(clusterName, ownerEmail) {
    return this.request(`/cluster/${clusterName}/graph/raw?owner=${ownerEmail}`)
  }

  async downloadClusterGraph(clusterName, ownerEmail) {
    // Cette méthode retourne directement l'URL pour le téléchargement
    return `${this.baseURL}/cluster/${clusterName}/graph/file?owner=${ownerEmail}`
  }

  // === UTILITAIRES ===
  
  // Vérifier si le token est encore valide
  async verifyToken() {
    try {
      await this.getMyProfile()
      return true
    } catch (error) {
      return false
    }
  }

  // Nettoyer le token en cas d'expiration
  clearToken() {
    localStorage.removeItem('auth_token')
  }
}

export default new ApiService()