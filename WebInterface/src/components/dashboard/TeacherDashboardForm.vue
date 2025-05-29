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
              <p class="cluster-info">Type: {{ getClusterTypeLabel(cluster.cluster_type) }}</p>
              <p class="cluster-info">Group Size: {{ cluster.group_size || 2 }}</p>
              <p class="cluster-info">Affinity: {{ cluster.min_affinity || 0 }} - {{ cluster.max_affinity || 3 }}</p>
              <p v-if="cluster.gradingEnabled">
                Grades: {{ cluster.minGrade }} - {{ cluster.maxGrade }}
              </p>
            </div>
          </div>
        </div>
        
        <!-- Selected Cluster Details -->
        <div v-if="selectedCluster" class="cluster-details">
          <h3>{{ selectedCluster.name }}</h3>
          <div class="cluster-metadata">
            <p><strong>Type:</strong> {{ getClusterTypeLabel(selectedCluster.cluster_type) }}</p>
            <p><strong>Group Size:</strong> {{ selectedCluster.group_size || 2 }}</p>
            <p><strong>Affinity Range:</strong> {{ selectedCluster.min_affinity || 0 }} - {{ selectedCluster.max_affinity || 3 }}</p>
          </div>
          
          <div class="students-list">
            <h4>Participating Students:</h4>
            <ul>
              <li v-for="student in selectedCluster.students" :key="student">
                {{ student }}
              </li>
            </ul>
          </div>
          
          <!-- Script Execution Section -->
          <div class="script-execution">
            <h4>Run Analysis Script</h4>
            <div class="script-controls">
              <div class="script-input-group">
                <label>Script Name:</label>
                <input 
                  v-model="scriptName" 
                  type="text" 
                  placeholder="app.exe"
                  class="script-input"
                >
              </div>
              <button 
                @click="runScript" 
                class="run-script-btn"
                :disabled="!scriptName.trim()"
              >
                🚀 Run Script
              </button>
            </div>
            <div v-if="scriptOutput" class="script-output">
              <h5>Script Output:</h5>
              <pre>{{ scriptOutput }}</pre>
            </div>
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
          
          <!-- Cluster Type -->
          <div class="form-group">
            <label>Cluster Type</label>
            <select v-model="newCluster.clusterType" class="form-input">
              <option value="1">Points Fixes</option>
              <option value="2">Random</option>
              <option value="3">Custom</option>
            </select>
          </div>
          
          <!-- Group Size -->
          <div class="form-group">
            <label>Group Size</label>
            <input 
              v-model.number="newCluster.groupSize" 
              type="number" 
              min="2"
              max="10"
              placeholder="Group size (default: 2)"
              class="form-input"
            >
          </div>
          
          <!-- Affinity Range -->
          <div class="form-group">
            <label>Affinity Range</label>
            <div class="affinity-inputs">
              <div class="affinity-field">
                <label class="sub-label">Min Affinity</label>
                <input 
                  v-model.number="newCluster.minAffinity" 
                  type="number" 
                  min="0"
                  placeholder="Min (default: 0)"
                  class="form-input"
                >
              </div>
              <div class="affinity-field">
                <label class="sub-label">Max Affinity</label>
                <input 
                  v-model.number="newCluster.maxAffinity" 
                  type="number" 
                  min="1"
                  placeholder="Max (default: 3)"
                  class="form-input"
                >
              </div>
            </div>
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
      scriptName: 'app.exe', // Script par défaut
      scriptOutput: '', // Sortie du script
      newCluster: {
        name: '',
        clusterType: '1',
        groupSize: 2,
        minAffinity: 0,
        maxAffinity: 3,
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
             this.newCluster.minAffinity < this.newCluster.maxAffinity &&
             this.newCluster.groupSize >= 2 &&
             (!this.newCluster.gradingEnabled || 
              (this.newCluster.minGrade < this.newCluster.maxGrade))
    }
  },
  
  async mounted() {
    await this.clustersStore.fetchClusters()
  },
  
  methods: {
    getClusterTypeLabel(type) {
      const types = {
        '1': 'Points Fixes',
        '2': 'Random',
        '3': 'Custom'
      }
      return types[type] || 'Unknown'
    },
    
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
      // First, store the students in the clusters store
      await this.clustersStore.setImportedStudents(this.studentEmails)
      
      const clusterData = {
        name: this.newCluster.name,
        clusterType: this.newCluster.clusterType,
        groupSize: this.newCluster.groupSize,
        minAffinity: this.newCluster.minAffinity,
        maxAffinity: this.newCluster.maxAffinity,
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
        clusterType: '1',
        groupSize: 2,
        minAffinity: 0,
        maxAffinity: 3,
        gradingEnabled: false,
        minGrade: 1,
        maxGrade: 10
      }
      this.clearStudentsList()
    },
    
    // === SCRIPT EXECUTION ===
    async runScript() {
      if (!this.selectedCluster || !this.scriptName.trim()) return
      
      this.scriptLoading = true
      this.scriptOutput = ''
      
      try {
        const result = await this.clustersStore.runClusterScript(
          this.selectedCluster.name,
          this.scriptName
        )
        
        if (result.success) {
          this.scriptOutput = result.output || 'Script executed successfully!'
        } else {
          this.scriptOutput = `Error: ${result.error}`
        }
      } catch (error) {
        console.error('❌ Error running script:', error)
        this.scriptOutput = `Error: ${error.message}`
      } finally {
        this.scriptLoading = false
      }
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

.cluster-info {
  color: #666;
  font-size: 0.9rem;
  margin: 3px 0;
}

.cluster-details {
  margin-top: 30px;
  padding: 20px;
  background-color: #e3f2fd;
  border: 2px solid #333;
}

.cluster-metadata {
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
}

.cluster-metadata p {
  margin: 5px 0;
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

/* === NEW STYLES FOR ADDITIONAL FIELDS === */
.affinity-inputs {
  display: flex;
  gap: 15px;
  margin-top: 10px;
}

.affinity-field {
  flex: 1;
}

.sub-label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 5px !important;
  font-weight: normal;
}

.form-input select {
  background-color: white;
  cursor: pointer;
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

/* === SCRIPT EXECUTION STYLES === */
.script-execution {
  margin: 20px 0;
  padding: 15px;
  background-color: #f0f8ff;
  border: 2px solid #2196F3;
  border-radius: 5px;
}

.script-execution h4 {
  margin: 0 0 15px 0;
  color: #2196F3;
}

.script-controls {
  display: flex;
  gap: 10px;
  align-items: end;
  margin-bottom: 15px;
}

.script-input-group {
  flex: 1;
}

.script-input-group label {
  display: block;
  margin-bottom: 5px;
  font-size: 0.9rem;
  font-weight: bold;
}

.script-input {
  width: 100%;
  padding: 8px;
  border: 2px solid #333;
  background-color: white;
}

.run-script-btn {
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: 2px solid #333;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.run-script-btn:hover:not(:disabled) {
  background-color: #45a049;
}

.run-script-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.script-output {
  background-color: #1e1e1e;
  color: #00ff00;
  padding: 15px;
  border: 2px solid #333;
  font-family: 'Courier New', monospace;
  max-height: 200px;
  overflow-y: auto;
}

.script-output h5 {
  margin: 0 0 10px 0;
  color: #ffeb3b;
}

.script-output pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
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


