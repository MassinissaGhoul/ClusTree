<template>
  <div class="teacher-dashboard">
    <div class="header">
      <h1>Dashboard Professeur</h1>
      <p>Bonjour, {{ authStore.userName }}</p>
      <button @click="logout" class="logout-btn">Se déconnecter</button>
    </div>

    <div class="main-content">
      <div class="left-panel">
        <div class="button-group">
          <button @click="showCreateCluster = true" class="action-button">
            Créer un cluster
          </button>
          <button @click="showViewClusters = true" class="action-button">
            Voir les clusters
          </button>
        </div>
        
        <!-- Liste des clusters -->
        <div v-if="showViewClusters" class="clusters-section">
          <h3>Clusters disponibles</h3>
          <div class="cluster-grid">
            <div 
              v-for="cluster in clustersStore.clusters" 
              :key="cluster.id"
              @click="selectCluster(cluster)"
              class="cluster-card"
              :class="{ active: selectedCluster?.id === cluster.id }"
            >
              <h4>{{ cluster.name }}</h4>
              <p>{{ cluster.students.length }} étudiants</p>
              <p v-if="cluster.gradingEnabled">
                Notes: {{ cluster.minGrade }} - {{ cluster.maxGrade }}
              </p>
            </div>
          </div>
        </div>
        
        <!-- Détails du cluster sélectionné -->
        <div v-if="selectedCluster" class="cluster-details">
          <h3>{{ selectedCluster.name }}</h3>
          <div class="students-list">
            <h4>Étudiants participants:</h4>
            <ul>
              <li v-for="student in selectedCluster.students" :key="student">
                {{ student }}
              </li>
            </ul>
          </div>
          
          <div v-if="selectedCluster.preferences" class="preferences-summary">
            <h4>Préférences soumises:</h4>
            <div v-for="(prefs, studentId) in selectedCluster.preferences" :key="studentId">
              <strong>{{ studentId }}:</strong> {{ prefs.length }} choix
            </div>
          </div>
        </div>
      </div>
      
      <!-- Panneau de création de cluster -->
      <div v-if="showCreateCluster" class="right-panel">
        <div class="create-cluster-form">
          <h3>Créer un nouveau cluster</h3>
          
          <!-- Nom du cluster -->
          <div class="form-group">
            <label>Nom du cluster</label>
            <input 
              v-model="newCluster.name" 
              type="text" 
              placeholder="Entrez le nom du cluster"
              class="form-input"
            >
          </div>
          
          <!-- Liste des étudiants -->
          <div class="form-group">
            <label>Liste des étudiants (emails)</label>
            <textarea 
              v-model="studentEmailsText" 
              placeholder="Entrez les emails des étudiants (un par ligne)"
              rows="5"
              class="form-textarea"
            ></textarea>
          </div>
          
          <!-- Option de notation -->
          <div class="form-group">
            <label>Notation</label>
            <div class="toggle-container">
              <span>OFF</span>
              <label class="switch">
                <input type="checkbox" v-model="newCluster.gradingEnabled">
                <span class="slider"></span>
              </label>
              <span>ON</span>
            </div>
          </div>
          
          <!-- Intervalle de notes -->
          <div v-if="newCluster.gradingEnabled" class="grading-interval">
            <label>Intervalle de notation</label>
            <div class="interval-inputs">
              <input 
                type="number" 
                v-model="newCluster.minGrade" 
                placeholder="Min"
                class="interval-input"
              >
              <span> - </span>
              <input 
                type="number" 
                v-model="newCluster.maxGrade" 
                placeholder="Max"
                class="interval-input"
              >
            </div>
          </div>
          
          <div class="form-actions">
            <button @click="createCluster" class="create-button" :disabled="!canCreateCluster">
              Créer le cluster
            </button>
            <button @click="cancelCreateCluster" class="cancel-button">
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'
import { useClustersStore } from '@/stores/clusters'

export default {
  name: 'TeacherDashboard',
  setup() {
    const authStore = useAuthStore()
    const clustersStore = useClustersStore()
    
    return {
      authStore,
      clustersStore
    }
  },
  
  data() {
    return {
      showCreateCluster: false,
      showViewClusters: false,
      selectedCluster: null,
      studentEmailsText: '',
      newCluster: {
        name: '',
        gradingEnabled: false,
        minGrade: 1,
        maxGrade: 10
      }
    }
  },
  
  computed: {
    canCreateCluster() {
      return this.newCluster.name.trim() && 
             this.studentEmailsText.trim() &&
             (!this.newCluster.gradingEnabled || 
              (this.newCluster.minGrade < this.newCluster.maxGrade))
    }
  },
  
  async mounted() {
    await this.clustersStore.fetchClusters()
  },
  
  methods: {
    async createCluster() {
      const studentEmails = this.studentEmailsText
        .split('\n')
        .map(email => email.trim())
        .filter(email => email)
      
      const clusterData = {
        name: this.newCluster.name,
        studentEmails,
        gradingEnabled: this.newCluster.gradingEnabled,
        minGrade: this.newCluster.gradingEnabled ? this.newCluster.minGrade : null,
        maxGrade: this.newCluster.gradingEnabled ? this.newCluster.maxGrade : null
      }
      
      const result = await this.clustersStore.createCluster(clusterData)
      
      if (result.success) {
        this.resetForm()
        this.showCreateCluster = false
        this.showViewClusters = true
      } else {
        alert('Erreur lors de la création du cluster: ' + result.error)
      }
    },
    
    selectCluster(cluster) {
      this.selectedCluster = cluster
      this.clustersStore.selectCluster(cluster)
    },
    
    cancelCreateCluster() {
      this.resetForm()
      this.showCreateCluster = false
    },
    
    resetForm() {
      this.newCluster = {
        name: '',
        gradingEnabled: false,
        minGrade: 1,
        maxGrade: 10
      }
      this.studentEmailsText = ''
    },
    
    logout() {
      this.authStore.logout()
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
.teacher-dashboard {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background-color: white;
  border: 2px solid #333;
}

.logout-btn {
  padding: 10px 20px;
  background-color: #f44336;
  color: white;
  border: 2px solid #333;
  cursor: pointer;
}

.main-content {
  display: flex;
  gap: 20px;
}

.left-panel {
  flex: 1;
  background-color: white;
  border: 2px solid #333;
  padding: 20px;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.action-button {
  padding: 10px 20px;
  background-color: #ffeb3b;
  border: 2px solid #333;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-button:hover {
  background-color: #333;
  color: white;
}

.cluster-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.cluster-card {
  padding: 15px;
  background-color: #fffbeb;
  border: 2px solid #333;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cluster-card:hover,
.cluster-card.active {
  background-color: #ffeb3b;
}

.cluster-details {
  margin-top: 30px;
  padding: 20px;
  background-color: #e3f2fd;
  border: 2px solid #333;
}

.students-list ul {
  list-style-type: none;
  padding: 0;
}

.students-list li {
  padding: 5px 0;
  border-bottom: 1px solid #ddd;
}

.right-panel {
  flex: 1;
  background-color: #fffbeb;
  border: 2px dashed #333;
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 10px;
  border: 2px solid #333;
  background-color: white;
}

.toggle-container {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border: 2px solid #333;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 2px;
  background-color: white;
  transition: .4s;
  border: 1px solid #333;
}

input:checked + .slider {
  background-color: #2196F3;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.grading-interval {
  padding: 15px;
  background-color: #ffeb3b;
  border: 2px solid #333;
  margin-top: 15px;
}

.interval-inputs {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.interval-input {
  width: 80px;
  padding: 8px;
  border: 2px solid #333;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.create-button {
  flex: 1;
  padding: 12px;
  background-color: #2196F3;
  color: white;
  border: 2px solid #333;
  cursor: pointer;
}

.create-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.cancel-button {
  flex: 1;
  padding: 12px;
  background-color: #f44336;
  color: white;
  border: 2px solid #333;
  cursor: pointer;
}
</style>