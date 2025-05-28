<template>
  <div class="teacher-dashboard-form">
    <div class="header">
      <h1>Teacher Dashboard</h1>
      <p>Hello, {{ authStore.userName }}</p>
      <button @click="logout" class="logout-btn">Logout</button>
    </div>

    <div class="main-content">
      <div class="left-panel">
        <div class="button-group">
          <button @click="showCreateCluster = true" class="action-button">
            Create Cluster
          </button>
          <button @click="showViewClusters = true" class="action-button">
            View Clusters
          </button>
        </div>
        
        <!-- Clusters List -->
        <div v-if="showViewClusters" class="clusters-section">
          <h3>Available Clusters</h3>
          <div class="cluster-grid">
            <div 
              v-for="cluster in clustersStore.clusters" 
              :key="cluster.id"
              @click="selectCluster(cluster)"
              class="cluster-card"
              :class="{ active: selectedCluster?.id === cluster.id }"
            >
              <h4>{{ cluster.name }}</h4>
              <p>{{ cluster.students?.length || 0 }} students</p>
              <p v-if="cluster.gradingEnabled">
                Grades: {{ cluster.minGrade }} - {{ cluster.maxGrade }}
              </p>
            </div>
          </div>
        </div>
        
        <!-- Selected Cluster Details -->
        <div v-if="selectedCluster" class="cluster-details">
          <h3>{{ selectedCluster.name }}</h3>
          <div class="students-list">
            <h4>Participating Students:</h4>
            <ul>
              <li v-for="student in selectedCluster.students" :key="student">
                {{ student }}
              </li>
            </ul>
          </div>
          
          <div v-if="selectedCluster.preferences" class="preferences-summary">
            <h4>Submitted Preferences:</h4>
            <div v-for="(prefs, studentId) in selectedCluster.preferences" :key="studentId">
              <strong>{{ studentId }}:</strong> {{ prefs.length }} choices
            </div>
          </div>
        </div>
      </div>
      
      <!-- Cluster Creation Panel -->
      <div v-if="showCreateCluster" class="right-panel">
        <div class="create-cluster-form">
          <h3>Create New Cluster</h3>
          
          <!-- Cluster Name -->
          <div class="form-group">
            <label>Cluster Name</label>
            <input 
              v-model="newCluster.name" 
              type="text" 
              placeholder="Enter cluster name"
              class="form-input"
            >
          </div>
          
          <!-- CSV Upload for Students -->
          <div class="form-group">
            <label>Students List (CSV file)</label>
            <div class="csv-upload-container">
              <input 
                ref="csvFileInput"
                type="file" 
                accept=".csv"
                @change="handleCsvUpload"
                class="csv-input"
                id="csv-upload"
              >
              <label for="csv-upload" class="csv-upload-btn">
                📁 Choose CSV File
              </label>
              <div v-if="csvFileName" class="csv-file-info">
                📄 {{ csvFileName }} ({{ studentEmails.length }} students)
              </div>
            </div>
            
            <!-- Expected Format -->
            <div class="csv-format-info">
              <p><strong>Expected format:</strong></p>
              <code>
                email<br>
                student1@example.com<br>
                student2@example.com<br>
                student3@example.com
              </code>
              <p>Or simply a list of emails, one per line.</p>
            </div>
            
            <!-- Students Preview -->
            <div v-if="studentEmails.length > 0" class="students-preview">
              <h4>Detected Students ({{ studentEmails.length }}):</h4>
              <div class="students-preview-list">
                <span 
                  v-for="(email, index) in studentEmails.slice(0, 5)" 
                  :key="index"
                  class="student-tag"
                >
                  {{ email }}
                </span>
                <span v-if="studentEmails.length > 5" class="more-students">
                  ... and {{ studentEmails.length - 5 }} more
                </span>
              </div>
              <button @click="clearStudentsList" class="clear-btn">
                ❌ Clear List
              </button>
            </div>
          </div>
          
          <!-- Grading Option -->
          <div class="form-group">
            <label>Grading</label>
            <div class="toggle-container">
              <span>OFF</span>
              <label class="switch">
                <input type="checkbox" v-model="newCluster.gradingEnabled">
                <span class="slider"></span>
              </label>
              <span>ON</span>
            </div>
          </div>
          
          <!-- Grade Range -->
          <div v-if="newCluster.gradingEnabled" class="grading-interval">
            <label>Grade Range</label>
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
              Create Cluster
            </button>
            <button @click="cancelCreateCluster" class="cancel-button">
              Cancel
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
  name: 'TeacherDashboardForm',
  emits: ['logout'],
  
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
      csvFileName: '',
      studentEmails: [],
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
             this.studentEmails.length > 0 &&
             (!this.newCluster.gradingEnabled || 
              (this.newCluster.minGrade < this.newCluster.maxGrade))
    }
  },
  
  async mounted() {
    await this.clustersStore.fetchClusters()
  },
  
  methods: {
    // === CSV FILE HANDLING ===
    async handleCsvUpload(event) {
      const file = event.target.files[0]
      if (!file) return
      
      this.csvFileName = file.name
      
      try {
        const text = await this.readFileAsText(file)
        const emails = this.parseCsvEmails(text)
        
        if (emails.length === 0) {
          alert('No valid emails found in the CSV file')
          return
        }
        
        this.studentEmails = emails
        console.log(`✅ ${emails.length} emails imported from ${file.name}`)
        
      } catch (error) {
        console.error('❌ Error reading CSV:', error)
        alert('Error reading CSV file')
      }
    },
    
    readFileAsText(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target.result)
        reader.onerror = (e) => reject(e)
        reader.readAsText(file)
      })
    },
    
    parseCsvEmails(csvText) {
      const lines = csvText.split('\n')
      const emails = []
      
      const firstLine = lines[0]?.trim().toLowerCase()
      const hasHeader = firstLine === 'email' || firstLine === 'emails' || firstLine.includes('email')
      
      const startIndex = hasHeader ? 1 : 0
      
      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue
        
        const email = line.includes(',') ? line.split(',')[0].trim() : line
        
        if (this.isValidEmail(email)) {
          emails.push(email)
        }
      }
      
      return [...new Set(emails)]
    },
    
    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email)
    },
    
    clearStudentsList() {
      this.studentEmails = []
      this.csvFileName = ''
      if (this.$refs.csvFileInput) {
        this.$refs.csvFileInput.value = ''
      }
    },
    
    // === CLUSTER CREATION ===
    async createCluster() {
      const clusterData = {
        name: this.newCluster.name,
        studentEmails: this.studentEmails,
        gradingEnabled: this.newCluster.gradingEnabled,
        minGrade: this.newCluster.gradingEnabled ? this.newCluster.minGrade : null,
        maxGrade: this.newCluster.gradingEnabled ? this.newCluster.maxGrade : null
      }
      
      const result = await this.clustersStore.createCluster(clusterData)
      
      if (result.success) {
        const message = result.simulated 
          ? `Cluster "${result.cluster.name}" created in simulation mode ⚠️`
          : `Cluster "${result.cluster.name}" created successfully ✅`
        
        alert(message)
        this.resetForm()
        this.showCreateCluster = false
        this.showViewClusters = true
      } else {
        alert('Error creating cluster: ' + result.error)
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
      this.clearStudentsList()
    },
    
    logout() {
      this.$emit('logout')
    }
  }
}
</script>

<style scoped>
.teacher-dashboard-form {
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

.form-input {
  width: 100%;
  padding: 10px;
  border: 2px solid #333;
  background-color: white;
}

/* === CSV UPLOAD STYLES === */
.csv-upload-container {
  position: relative;
  margin-bottom: 15px;
}

.csv-input {
  display: none;
}

.csv-upload-btn {
  display: inline-block;
  padding: 12px 20px;
  background-color: #2196F3;
  color: white;
  border: 2px solid #333;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;
}

.csv-upload-btn:hover {
  background-color: #1976D2;
}

.csv-file-info {
  margin-top: 10px;
  padding: 10px;
  background-color: #e8f5e8;
  border: 2px solid #4CAF50;
  color: #2e7d32;
  font-weight: bold;
}

.csv-format-info {
  background-color: #f0f0f0;
  border: 2px dashed #666;
  padding: 15px;
  margin-bottom: 15px;
}

.csv-format-info code {
  display: block;
  background-color: #333;
  color: #ffeb3b;
  padding: 10px;
  margin: 10px 0;
  font-family: monospace;
  border: 1px solid #666;
}

.students-preview {
  background-color: #fff3e0;
  border: 2px solid #ff9800;
  padding: 15px;
  margin-top: 15px;
}

.students-preview h4 {
  margin: 0 0 10px 0;
  color: #e65100;
}

.students-preview-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.student-tag {
  display: inline-block;
  background-color: #ffeb3b;
  border: 1px solid #333;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: bold;
}

.more-students {
  font-style: italic;
  color: #666;
  align-self: center;
}

.clear-btn {
  background-color: #f44336;
  color: white;
  border: 2px solid #333;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 12px;
}

.clear-btn:hover {
  background-color: #d32f2f;
}

/* === REST OF STYLES === */
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