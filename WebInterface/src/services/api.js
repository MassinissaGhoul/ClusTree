// services/api.js - Updated with better error handling for missing endpoints
class ApiService {
  constructor() {
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

    if (!(options.body instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json'
    }

    let token = sessionStorage.getItem('auth_token')
    
    if (!token) {
      token = localStorage.getItem('auth_token')
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
          for (let pair of config.body.entries()) {
            console.log(`${pair[0]}: ${pair[1] instanceof File ? pair[1].name : pair[1]}`)
          }
        } else {
          console.log('📤 Request Body:', JSON.parse(config.body))
        }
      }
      
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.text()
        let errorMessage
        
        try {
          const parsedError = JSON.parse(errorData)
          errorMessage = parsedError.error || parsedError.message || `HTTP ${response.status}`
        } catch {
          // Handle HTML error pages (like 404)
          if (errorData.includes('<!DOCTYPE html>')) {
            if (response.status === 404) {
              errorMessage = `Endpoint not found: ${endpoint}`
            } else {
              errorMessage = `Server error: HTTP ${response.status}`
            }
          } else {
            errorMessage = errorData || `HTTP ${response.status}`
          }
        }
        
        if (response.status === 401 || response.status === 403) {
          console.error('🔐 Authentication error:', errorMessage)
          this.clearToken()
        }
        
        throw new Error(errorMessage)
      }
      
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
    
    if (response.token) {
      this.setToken(response.token)
    }
    
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
    console.log('🔧 Creating cluster with EXACT backend field names...')
    
    const formData = new FormData()
    
    formData.append('clusterName', clusterData.name || '')
    formData.append('maxAffinity', String(clusterData.maxAffinity ?? 3))
    formData.append('minAffinity', String(clusterData.minAffinity ?? 0))
    formData.append('groupSize', String(clusterData.groupSize ?? 2))
    formData.append('clusterType', clusterData.clusterType || '1')

    if (Array.isArray(clusterData.students) && clusterData.students.length > 0) {
      const blob = new Blob(
        [JSON.stringify(clusterData.students)], 
        { type: 'application/json' }
      )
      formData.append('studentsFile', blob, 'students.json')
      console.log(`📁 Adding ${clusterData.students.length} students as studentsFile`)
    } else {
      console.warn('⚠️ Aucun étudiant importé')
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
    return `${this.baseURL}/cluster/${clusterName}/graph/file?owner=${encodeURIComponent(ownerEmail)}`
  }

  // === STUDENT PREFERENCES ===
  
  async submitStudentPreferences(clusterId, preferences) {
    console.log('📝 Attempting to submit preferences to backend...')
    
    try {
      return await this.request(`/cluster/${clusterId}/preferences`, {
        method: 'POST',
        body: JSON.stringify(preferences)
      })
    } catch (error) {
      // Enhanced error handling for missing endpoints
      if (error.message.includes('Endpoint not found') || error.message.includes('404')) {
        console.warn('⚠️ Preferences endpoint not implemented on backend, using local simulation')
        throw new Error('ENDPOINT_NOT_FOUND')
      }
      throw error
    }
  }

  async getStudentPreferences(clusterId, studentId) {
    try {
      return await this.request(`/cluster/${clusterId}/preferences/${encodeURIComponent(studentId)}`)
    } catch (error) {
      if (error.message.includes('Endpoint not found') || error.message.includes('404')) {
        console.warn('⚠️ Get preferences endpoint not implemented on backend')
        throw new Error('ENDPOINT_NOT_FOUND')
      }
      throw error
    }
  }

  // === SCRIPT EXECUTION ===
  
  async runClusterScript(clusterName, scriptName) {
    return this.request('/cluster/teacher/launch-script', {
      method: 'POST',
      body: JSON.stringify({
        clusterName: clusterName,
        scriptName: scriptName
      })
    })
  }

  // === UTILITIES ===
  
  async verifyToken() {
    try {
      await this.getMyProfile()
      return true
    } catch (error) {
      if (error.message.includes('401') || error.message.includes('403')) {
        this.clearToken()
      }
      return false
    }
  }

  clearToken() {
    console.log('🔄 Clearing authentication tokens')
    sessionStorage.removeItem('auth_token')
    localStorage.removeItem('auth_token')
  }
  
  setToken(token) {
    console.log('🔑 Setting authentication token')
    sessionStorage.setItem('auth_token', token)
  }
}

export default new ApiService()