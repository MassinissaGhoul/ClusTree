// stores/clusters.js - Updated with better error handling for missing endpoints
import { defineStore } from 'pinia'
import ApiService from '@/services/api'

export const useClustersStore = defineStore('clusters', {
  state: () => ({
    clusters: [],
    currentCluster: null,
    loading: false,
    error: null,
    importedStudents: [],
    // Track local preferences when backend is not available
    localPreferences: {}
  }),

  getters: {
    getClusterById: (state) => (id) => {
      return state.clusters.find(cluster => cluster.id === id)
    },
    
    hasImportedStudents: (state) => {
      return state.importedStudents && state.importedStudents.length > 0
    },
    
    getLocalPreferences: (state) => (clusterId, studentId) => {
      const key = `${clusterId}_${studentId}`
      return state.localPreferences[key] || null
    }
  },

  actions: {
    // === FETCH CLUSTERS BASED ON ROLE ===
    async fetchClusters() {
      this.loading = true
      this.error = null
      
      try {
        const { useAuthStore } = await import('./auth')
        const authStore = useAuthStore()
        
        let clusters = []
        
        if (authStore.isTeacher) {
          console.log('📚 Fetching teacher clusters...')
          clusters = await ApiService.getTeacherClusters()
        } else if (authStore.isStudent) {
          console.log('📚 Fetching student clusters...')
          clusters = await ApiService.getStudentClusters()
        }
        
        this.clusters = clusters || []
        console.log(`✅ ${this.clusters.length} cluster(s) retrieved`)
        
        return { success: true, clusters: this.clusters }
        
      } catch (error) {
        console.error('❌ Error fetching clusters:', error.message)
        this.error = error.message
        this.clusters = []
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    // === STORE IMPORTED STUDENTS ===
    setImportedStudents(students) {
      console.log(`📝 ${students.length} student(s) imported`)
      this.importedStudents = students
      return Promise.resolve()
    },

    // === CREATE CLUSTER (TEACHER ONLY) ===
    async createCluster(clusterData) {
      const { useAuthStore } = await import('./auth')
      const authStore = useAuthStore()
      
      if (!authStore.isTeacher) {
        throw new Error('Only teachers can create clusters')
      }
      
      if (!(await ApiService.verifyToken())) {
        console.error('❌ Authentication required to create a cluster')
        this.error = 'Authentication required. Please log in again.'
        return { success: false, error: this.error }
      }
      
      this.loading = true
      this.error = null
      
      try {
        console.log('🔨 Creating a new cluster...', clusterData.name)
        
        if (!clusterData.name) {
          throw new Error('Cluster name is required')
        }
        
        const clusterPayload = {
          name: clusterData.name,
          clusterType: clusterData.clusterType || '1',
          groupSize: clusterData.groupSize || 2,
          minAffinity: clusterData.minAffinity || 0,
          maxAffinity: clusterData.maxAffinity || 3
        }
        
        if (this.importedStudents.length > 0) {
          clusterPayload.students = this.importedStudents
        } else {
          throw new Error('No students have been imported')
        }
        
        console.log('📤 Payload for cluster creation:', clusterPayload)
        
        const response = await ApiService.createCluster(clusterPayload)
        
        if (response.cluster) {
          this.clusters.push(response.cluster)
          this.importedStudents = []
        }
        
        console.log('✅ Cluster created successfully:', response.cluster?.name)
        return { success: true, cluster: response.cluster }
        
      } catch (error) {
        console.error('❌ Error creating cluster:', error.message)
        this.error = error.message
        
        if (error.message.includes('token') || error.message.includes('auth') ||
            error.message.includes('401') || error.message.includes('403')) {
          return { success: false, error: 'Authentication error. Please log in again.', authError: true }
        }
        
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    // === SELECT A CLUSTER ===
    selectCluster(cluster) {
      console.log('📌 Cluster selected:', cluster.name)
      this.currentCluster = cluster
    },

    // === GET CLUSTER GRAPH ===
    async getClusterGraph(clusterName, ownerEmail) {
      try {
        console.log('📊 Retrieving graph for:', clusterName)
        const graph = await ApiService.getClusterGraph(clusterName, ownerEmail)
        return { success: true, graph }
      } catch (error) {
        console.error('❌ Error retrieving graph:', error.message)
        return { success: false, error: error.message }
      }
    },

    // === DOWNLOAD CLUSTER GRAPH ===
    getClusterGraphDownloadUrl(clusterName, ownerEmail) {
      return ApiService.downloadClusterGraph(clusterName, ownerEmail)
    },

    // === SUBMIT STUDENT PREFERENCES ===
    async submitStudentPreferences(clusterId, preferences) {
      console.log('📝 Submitting preferences:', { clusterId, preferences })
      
      try {
        const response = await ApiService.submitStudentPreferences(clusterId, preferences)
        
        // Update local state if successful
        const cluster = this.clusters.find(c => c.id === clusterId)
        if (cluster) {
          cluster.preferences = cluster.preferences || {}
          cluster.preferences[preferences.studentId] = preferences.choices
        }
        
        console.log('✅ Preferences submitted successfully to backend')
        return { success: true, data: response }
        
      } catch (error) {
        console.error('❌ Error submitting preferences to API:', error.message)
        
        // Check if it's a missing endpoint error
        if (error.message === 'ENDPOINT_NOT_FOUND') {
          console.log('🔄 Backend endpoint not available, using local simulation')
          
          // Store preferences locally
          const key = `${clusterId}_${preferences.studentId}`
          this.localPreferences[key] = preferences
          
          // Also update cluster if it exists
          const cluster = this.clusters.find(c => c.id === clusterId)
          if (cluster) {
            cluster.preferences = cluster.preferences || {}
            cluster.preferences[preferences.studentId] = preferences.choices
          }
          
          console.log('💾 Preferences stored locally')
          return { success: true, simulated: true, message: 'Preferences saved locally (backend endpoint not available)' }
        }
        
        // For other errors, return failure
        return { success: false, error: error.message }
      }
    },

    // === GET STUDENT PREFERENCES ===
    async getStudentPreferences(clusterId, studentId) {
      try {
        console.log('📖 Retrieving preferences for:', { clusterId, studentId })
        const preferences = await ApiService.getStudentPreferences(clusterId, studentId)
        return { success: true, preferences }
      } catch (error) {
        console.error('❌ Error retrieving preferences:', error.message)
        
        // Check if it's a missing endpoint error
        if (error.message === 'ENDPOINT_NOT_FOUND') {
          console.log('🔄 Backend endpoint not available, checking local storage')
          
          // Try to get from local storage
          const localPrefs = this.getLocalPreferences(clusterId, studentId)
          if (localPrefs) {
            return { success: true, preferences: localPrefs, local: true }
          }
          
          // Also check cluster data
          const cluster = this.clusters.find(c => c.id === clusterId)
          if (cluster && cluster.preferences && cluster.preferences[studentId]) {
            return { success: true, preferences: cluster.preferences[studentId], local: true }
          }
        }
        
        return { success: false, error: error.message }
      }
    },

    // === RUN CLUSTER SCRIPT ===
    async runClusterScript(clusterName, scriptName) {
      try {
        console.log('🚀 Running script:', { clusterName, scriptName })
        const response = await ApiService.runClusterScript(clusterName, scriptName)
        return { success: true, output: response.output || response.message }
      } catch (error) {
        console.error('❌ Error running script:', error.message)
        return { success: false, error: error.message }
      }
    },

    // === CLEAR STATE ===
    clearClusters() {
      this.clusters = []
      this.currentCluster = null
      this.importedStudents = []
      this.localPreferences = {}
      this.error = null
    },

    // === LOCAL PREFERENCES MANAGEMENT ===
    clearLocalPreferences(clusterId = null) {
      if (clusterId) {
        // Clear preferences for specific cluster
        Object.keys(this.localPreferences).forEach(key => {
          if (key.startsWith(`${clusterId}_`)) {
            delete this.localPreferences[key]
          }
        })
      } else {
        // Clear all local preferences
        this.localPreferences = {}
      }
    }
  }
})