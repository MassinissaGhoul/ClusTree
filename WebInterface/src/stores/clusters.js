// stores/clusters.js - Version adaptée pour le backend réel
import { defineStore } from 'pinia'
import ApiService from '@/services/api'
import { useAuthStore } from './auth'

export const useClustersStore = defineStore('clusters', {
  state: () => ({
    clusters: [],
    currentCluster: null,
    loading: false,
    error: null
  }),

  getters: {
    getClusterById: (state) => (id) => {
      return state.clusters.find(cluster => cluster.id === id)
    },
    
    // Clusters filtrés par propriétaire (pour les professeurs)
    myOwnedClusters: (state) => {
      const authStore = useAuthStore()
      return state.clusters.filter(cluster => cluster.owner_id === authStore.userId)
    },
    
    // Clusters auxquels l'étudiant a accès
    myAccessibleClusters: (state) => {
      return state.clusters
    }
  },

  actions: {
    // === RÉCUPÉRER LES CLUSTERS SELON LE RÔLE ===
    async fetchClusters() {
      this.loading = true
      this.error = null
      
      try {
        const authStore = useAuthStore()
        let clusters = []
        
        if (authStore.isTeacher) {
          console.log('📚 Récupération des clusters (professeur)...')
          clusters = await ApiService.getTeacherClusters()
        } else if (authStore.isStudent) {
          console.log('📚 Récupération des clusters (étudiant)...')
          clusters = await ApiService.getStudentClusters()
        }
        
        this.clusters = clusters || []
        console.log(`✅ ${this.clusters.length} cluster(s) récupéré(s)`)
        
        return { success: true, clusters: this.clusters }
        
      } catch (error) {
        console.error('❌ Erreur lors de la récupération des clusters:', error.message)
        this.error = error.message
        this.clusters = []
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    // === CRÉER UN CLUSTER (PROFESSEUR UNIQUEMENT) ===
    async createCluster(clusterData) {
      const authStore = useAuthStore()
      
      if (!authStore.isTeacher) {
        throw new Error('Seuls les professeurs peuvent créer des clusters')
      }
      
      this.loading = true
      this.error = null
      
      try {
        console.log('🔨 Création d\'un nouveau cluster...', clusterData.name)
        
        const response = await ApiService.createCluster({
          name: clusterData.name,
          maxAffinity: clusterData.maxAffinity || null,
          groupSize: clusterData.groupSize || null
        })
        
        // Ajouter le nouveau cluster à la liste locale
        if (response.cluster) {
          this.clusters.push(response.cluster)
        }
        
        console.log('✅ Cluster créé avec succès:', response.cluster?.name)
        return { success: true, cluster: response.cluster }
        
      } catch (error) {
        console.error('❌ Erreur lors de la création du cluster:', error.message)
        this.error = error.message
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    // === SÉLECTIONNER UN CLUSTER ===
    selectCluster(cluster) {
      console.log('📌 Cluster sélectionné:', cluster.name)
      this.currentCluster = cluster
    },

    // === RÉCUPÉRER LE GRAPHE D'UN CLUSTER ===
    async getClusterGraph(clusterName, ownerEmail) {
      try {
        console.log('📊 Récupération du graphe pour:', clusterName)
        const graph = await ApiService.getClusterGraph(clusterName, ownerEmail)
        return { success: true, graph }
      } catch (error) {
        console.error('❌ Erreur lors de la récupération du graphe:', error.message)
        return { success: false, error: error.message }
      }
    },

    // === TÉLÉCHARGER LE GRAPHE D'UN CLUSTER ===
    getClusterGraphDownloadUrl(clusterName, ownerEmail) {
      return ApiService.downloadClusterGraph(clusterName, ownerEmail)
    },

    // === SOUMETTRE DES PRÉFÉRENCES ÉTUDIANT ===
    async submitStudentPreferences(clusterId, preferences) {
      // Cette fonctionnalité sera implémentée quand votre collègue ajoutera l'endpoint
      console.log('📝 Soumission des préférences:', { clusterId, preferences })
      
      try {
        // TODO: Remplacer par l'endpoint réel quand il sera disponible
        // const response = await ApiService.submitPreferences(clusterId, preferences)
        
        // Pour l'instant, simulation locale
        const cluster = this.clusters.find(c => c.id === clusterId)
        if (cluster) {
          cluster.preferences = cluster.preferences || {}
          cluster.preferences[preferences.studentId] = preferences.choices
        }
        
        return { success: true }
        
      } catch (error) {
        console.error('❌ Erreur lors de la soumission des préférences:', error.message)
        return { success: false, error: error.message }
      }
    },

    // === NETTOYER L'ÉTAT ===
    clearClusters() {
      this.clusters = []
      this.currentCluster = null
      this.error = null
    },

    // === RAFRAÎCHIR UN CLUSTER SPÉCIFIQUE ===
    async refreshCluster(clusterId) {
      try {
        // Cette fonctionnalité nécessiterait un endpoint spécifique
        // Pour l'instant, on rafraîchit tous les clusters
        await this.fetchClusters()
        return { success: true }
      } catch (error) {
        return { success: false, error: error.message }
      }
    }
  }
})