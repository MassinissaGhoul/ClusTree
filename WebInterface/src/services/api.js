// services/api.js - Service for communicating with the backend (Vite Version)
class ApiService {
  constructor() {
    // In Vite, use import.meta.env instead of process.env
    // Variables must start with VITE_
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
  }

  // Generic method for HTTP requests
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    
    const config = {
      headers: {
        ...options.headers
      },
      ...options
    }

    // Add Content-Type only if not FormData
    if (!(options.body instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json'
    }

    // Check both sessionStorage and localStorage for token
    // Try sessionStorage first (more secure)
    let token = sessionStorage.getItem('auth_token')
    
    // If not found, check localStorage (for backward compatibility)
    if (!token) {
      token = localStorage.getItem('auth_token')
      // If found in localStorage, migrate it to sessionStorage
      if (token) {
        sessionStorage.setItem('auth_token', token)
      }
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    } else {
      console.warn('⚠️ No authentication token found')
    }

    try {
      console.log(`🔵 API Request: ${config.method || 'GET'} ${url}`)
      if (config.body) {
        if (config.body instanceof FormData) {
          console.log('📤 Request Body: [FormData]')
          // Optional: Log FormData content for debugging
          // for (let pair of config.body.entries()) {
          //   console.log(pair[0] + ': ' + (pair[1] instanceof File ? pair[1].name : pair[1]))
          // }
        } else {
          console.log('📤 Request Body:', JSON.parse(config.body))
        }
      }
      
      const response = await fetch(url, config)
      
      // Enhanced error handling
      if (!response.ok) {
        const errorData = await response.text()
        let errorMessage
        try {
          const parsedError = JSON.parse(errorData)
          errorMessage = parsedError.error || parsedError.message || `HTTP ${response.status}`
        } catch {
          errorMessage = errorData || `HTTP ${response.status}`
        }
        
        // Handle authentication errors specifically
        if (response.status === 401 || response.status === 403) {
          console.error('🔐 Authentication error:', errorMessage)
          this.clearToken()
        }
        
        throw new Error(errorMessage)
      }
      
      // Handle empty or non-JSON responses
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json()
        console.log('📥 API Response:', data)
        return data
      } else {
        const text = await response.text()
        console.log('📥 API Response (non-JSON):', text.substring(0, 100))
        return { success: true, message: text }
      }
    } catch (error) {
      console.error('❌ API Error:', error.message)
      throw error
    }
  }

  // === AUTHENTICATION ===
  
  async login(credentials) {
    const response = await this.request('/user/login', {
      method: 'POST',
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password
      })
    })
    
    // Store the token immediately if received
    if (response.token) {
      this.setToken(response.token)
    }
    
    // Backend returns { user: userData, token }
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
    
    // Backend returns { id: ... }
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

  // === CLUSTERS (TEACHER) ===
  
  async createCluster(clusterData) {
    // Create FormData object to match backend expectations
    const formData = new FormData()
    
    // Use clusterName instead of name to match backend expectation
    formData.append('clusterName', clusterData.name)
    
    // Add other parameters
    if (clusterData.maxAffinity) {
      formData.append('maxAffinity', clusterData.maxAffinity)
    }
    
    if (clusterData.minAffinity) {
      formData.append('minAffinity', clusterData.minAffinity)
    }
    
    if (clusterData.groupSize) {
      formData.append('groupSize', clusterData.groupSize)
    }
    
    // Default cluster type to 1 if not provided
    formData.append('clusterType', clusterData.clusterType || '1')
    
    // Convert students array to a file and append it
    if (clusterData.students && Array.isArray(clusterData.students)) {
      const jsonContent = JSON.stringify(clusterData.students)
      const blob = new Blob([jsonContent], { type: 'application/json' })
      formData.append('studentsFile', blob, 'students.json')
    }
    
    return this.request('/cluster/teacher/create', {
      method: 'POST',
      body: formData
    })
  }

  async getTeacherClusters() {
    return this.request('/cluster/teacher/list')
  }

  // === CLUSTERS (STUDENT) ===
  
  async getStudentClusters() {
    return this.request('/cluster/student/list')
  }

  // === CLUSTERS (SHARED) ===
  
  async getClusterGraph(clusterName, ownerEmail) {
    return this.request(`/cluster/${clusterName}/graph/raw?owner=${encodeURIComponent(ownerEmail)}`)
  }

  async downloadClusterGraph(clusterName, ownerEmail) {
    // This method directly returns the URL for download
    return `${this.baseURL}/cluster/${clusterName}/graph/file?owner=${encodeURIComponent(ownerEmail)}`
  }

  // === UTILITIES ===
  
  // Check if token is still valid
  async verifyToken() {
    try {
      await this.getMyProfile()
      return true
    } catch (error) {
      // If error is 401 or 403, token is invalid
      if (error.message.includes('401') || error.message.includes('403')) {
        this.clearToken()
      }
      return false
    }
  }

  // Clear token on expiration
  clearToken() {
    console.log('🔄 Clearing authentication tokens')
    sessionStorage.removeItem('auth_token')
    localStorage.removeItem('auth_token') // For compatibility with old code
  }
  
  // Store token (dedicated method for uniformity)
  setToken(token) {
    console.log('🔑 Setting authentication token')
    sessionStorage.setItem('auth_token', token)
    // Also set in localStorage for backward compatibility if needed
    // localStorage.setItem('auth_token', token)
  }
}

export default new ApiService()