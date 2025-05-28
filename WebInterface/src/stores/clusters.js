// stores/clusters.js - Updated to match backend expectations
import { defineStore } from 'pinia'
import ApiService from '@/services/api'

export const useClustersStore = defineStore('clusters', {
  state: () => ({
    clusters: [],
    currentCluster: null,
    loading: false,
    error: null,
    importedStudents: [] // New state to store imported students
  }),

  getters: {
    getClusterById: (state) => (id) => {
      return state.clusters.find(cluster => cluster.id === id)
    },
    
    hasImportedStudents: (state) => {
      return state.importedStudents && state.importedStudents.length > 0
    }
  },

  actions: {
    // === FETCH CLUSTERS BASED ON ROLE ===
    async fetchClusters() {
      this.loading = true
      this.error = null
      
      try {
        // Dynamic import to avoid circular dependency
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
    },

    // === CREATE CLUSTER (TEACHER ONLY) ===
    async createCluster(clusterData) {
      // Dynamic import to avoid circular dependency
      const { useAuthStore } = await import('./auth')
      const authStore = useAuthStore()
      
      if (!authStore.isTeacher) {
        throw new Error('Only teachers can create clusters')
      }
      
      // Check if the user is authenticated
      if (!(await ApiService.verifyToken())) {
        console.error('❌ Authentication required to create a cluster')
        this.error = 'Authentication required. Please log in again.'
        return { success: false, error: this.error }
      }
      
      this.loading = true
      this.error = null
      
      try {
        console.log('🔨 Creating a new cluster...', clusterData.name)
        
        // Prepare data with default values to match backend expectations
        const clusterPayload = {
          name: clusterData.name,               // This will be used as clusterName in API
          maxAffinity: clusterData.maxAffinity || 3,
          minAffinity: clusterData.minAffinity || 0, // Add minAffinity
          groupSize: clusterData.groupSize || 2,
          clusterType: clusterData.clusterType || '1' // Add clusterType (default to 1)
        }
        
        // Add imported students if they exist
        if (this.importedStudents.length > 0) {
          clusterPayload.students = this.importedStudents
        }
        
        console.log('📤 Payload for cluster creation:', clusterPayload)
        
        const response = await ApiService.createCluster(clusterPayload)
        
        // Add the new cluster to the local list
        if (response.cluster) {
          this.clusters.push(response.cluster)
        }
        
        console.log('✅ Cluster created successfully:', response.cluster?.name)
        return { success: true, cluster: response.cluster }
        
      } catch (error) {
        console.error('❌ Error creating cluster:', error.message)
        this.error = error.message
        
        // Special handling for authentication errors
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
        // Local simulation for now
        const cluster = this.clusters.find(c => c.id === clusterId)
        if (cluster) {
          cluster.preferences = cluster.preferences || {}
          cluster.preferences[preferences.studentId] = preferences.choices
        }
        
        return { success: true }
        
      } catch (error) {
        console.error('❌ Error submitting preferences:', error.message)
        return { success: false, error: error.message }
      }
    },

    // === CLEAR STATE ===
    clearClusters() {
      this.clusters = []
      this.currentCluster = null
      this.importedStudents = []
      this.error = null
    }
  }
})