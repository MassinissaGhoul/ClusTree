// stores/clusters.js
import { defineStore } from 'pinia'

export const useClustersStore = defineStore('clusters', {
  state: () => ({
    clusters: [],
    currentCluster: null,
    students: []
  }),

  getters: {
    getClusterById: (state) => (id) => {
      return state.clusters.find(cluster => cluster.id === id)
    },
    
    availableStudentsForCluster: (state) => (clusterId) => {
      const cluster = state.clusters.find(c => c.id === clusterId)
      if (!cluster) return []
      
      return cluster.students.map(email => {
        return {
          id: email,
          name: email.split('@')[0],
          email: email,
          selected: false,
          grade: null
        }
      })
    }
  },

  actions: {
    async createCluster(clusterData) {
      try {
        // TODO: Remplacer par appel API réel
        const newCluster = {
          id: Date.now(),
          name: clusterData.name,
          students: clusterData.studentEmails.filter(email => email.trim()),
          gradingEnabled: clusterData.gradingEnabled,
          minGrade: clusterData.minGrade || 1,
          maxGrade: clusterData.maxGrade || 10,
          createdAt: new Date(),
          preferences: {} // Stockera les préférences des étudiants
        }
        
        this.clusters.push(newCluster)
        return { success: true, cluster: newCluster }
      } catch (error) {
        return { success: false, error: error.message }
      }
    },

    async fetchClusters() {
      try {
        // TODO: Remplacer par appel API réel
        // const response = await api.get('/clusters')
        
        // Données de démonstration
        this.clusters = [
          { id: 1, name: 'Cluster A', students: ['student1@test.com', 'student2@test.com'], gradingEnabled: true, minGrade: 1, maxGrade: 5 },
          { id: 2, name: 'Cluster B', students: ['student3@test.com', 'student4@test.com'], gradingEnabled: false },
          { id: 3, name: 'Cluster C', students: ['student5@test.com', 'student6@test.com'], gradingEnabled: true, minGrade: 0, maxGrade: 10 }
        ]
        
        return { success: true }
      } catch (error) {
        return { success: false, error: error.message }
      }
    },

    selectCluster(cluster) {
      this.currentCluster = cluster
    },

    async submitStudentPreferences(clusterId, preferences) {
      try {
        // TODO: Remplacer par appel API réel
        const cluster = this.clusters.find(c => c.id === clusterId)
        if (cluster) {
          cluster.preferences = cluster.preferences || {}
          cluster.preferences[preferences.studentId] = preferences.choices
        }
        
        return { success: true }
      } catch (error) {
        return { success: false, error: error.message }
      }
    }
  }
})