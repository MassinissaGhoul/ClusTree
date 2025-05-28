<template>
  <div class="student-dashboard-form">
    <div class="header">
      <h1>Student Dashboard</h1>
      <p>Hello, {{ authStore.userName }}</p>
      <button @click="logout" class="logout-btn">Logout</button>
    </div>

    <div class="main-content">
      <!-- Cluster Selection -->
      <div v-if="!selectedCluster" class="cluster-selection">
        <h2>Select a Cluster</h2>
        <div class="clusters-grid">
          <div 
            v-for="cluster in availableClusters" 
            :key="cluster.id"
            @click="selectCluster(cluster)"
            class="cluster-card"
          >
            <h3>{{ cluster.name }}</h3>
            <p>{{ cluster.students?.length || 0 }} participants</p>
            <p v-if="cluster.gradingEnabled" class="grading-info">
              Grading enabled ({{ cluster.minGrade }} - {{ cluster.maxGrade }})
            </p>
          </div>
        </div>
      </div>

      <!-- Preferences Interface -->
      <div v-else class="preferences-section">
        <div class="cluster-header">
          <h2>{{ selectedCluster.name }}</h2>
          <button @click="backToSelection" class="back-btn">← Back</button>
        </div>

        <div class="info-box">
          <h3>INFORMATION</h3>
          <p>
            Select your preferences by enabling/disabling students. 
            Once a student is selected, they become unavailable for subsequent choices.
          </p>
          <p v-if="selectedCluster.gradingEnabled">
            <strong>Grading enabled:</strong> 
            You must assign a grade between {{ selectedCluster.minGrade }} and {{ selectedCluster.maxGrade }} 
            to each selected student.
          </p>
        </div>

        <div class="preferences-form">
          <h3>Select Your Preferences</h3>
          
          <div class="students-list">
            <div 
              v-for="student in availableStudentsForSelection" 
              :key="student.id"
              class="student-item"
              :class="{ selected: student.selected, unavailable: student.unavailable }"
            >
              <div class="student-info">
                <span class="student-name">{{ student.name }}</span>
                <label class="toggle-switch" v-if="!student.unavailable">
                  <input 
                    type="checkbox" 
                    v-model="student.selected"
                    @change="toggleStudent(student)"
                  >
                  <span class="toggle-slider"></span>
                </label>
                <span v-else class="unavailable-text">Unavailable</span>
              </div>
              
              <!-- Grade input if grading is enabled and student is selected -->
              <div v-if="selectedCluster.gradingEnabled && student.selected" class="grade-input">
                <label>Grade:</label>
                <input 
                  type="number" 
                  v-model="student.grade"
                  :min="selectedCluster.minGrade"
                  :max="selectedCluster.maxGrade"
                  class="grade-field"
                >
              </div>
            </div>
          </div>

          <div class="selected-summary" v-if="selectedStudents.length > 0">
            <h4>Your Selections ({{ selectedStudents.length }}):</h4>
            <ol>
              <li v-for="student in selectedStudents" :key="student.id">
                {{ student.name }}
                <span v-if="selectedCluster.gradingEnabled && student.grade">
                  - Grade: {{ student.grade }}
                </span>
              </li>
            </ol>
          </div>

          <button 
            @click="submitPreferences" 
            class="submit-btn"
            :disabled="!canSubmit"
          >
            Submit Preferences
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'
import { useClustersStore } from '@/stores/clusters'

export default {
  name: 'StudentDashboardForm',
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
      selectedCluster: null,
      studentPreferences: []
    }
  },
  
  computed: {
    availableClusters() {
      // Filter clusters where the current student is enrolled
      const userEmail = this.authStore.user?.email
      return this.clustersStore.clusters.filter(cluster => 
        cluster.students?.includes(userEmail)
      )
    },
    
    availableStudentsForSelection() {
      if (!this.selectedCluster) return []
      
      return this.selectedCluster.students.map(email => {
        const isCurrentUser = email === this.authStore.user?.email
        const existingPreference = this.studentPreferences.find(p => p.email === email)
        
        return {
          id: email,
          name: email.split('@')[0],
          email: email,
          selected: existingPreference?.selected || false,
          grade: existingPreference?.grade || '',
          unavailable: isCurrentUser // Student cannot select themselves
        }
      })
    },
    
    selectedStudents() {
      return this.availableStudentsForSelection.filter(student => student.selected)
    },
    
    canSubmit() {
      if (this.selectedStudents.length === 0) return false
      
      // If grading is enabled, verify that all grades are entered
      if (this.selectedCluster.gradingEnabled) {
        return this.selectedStudents.every(student => 
          student.grade && 
          student.grade >= this.selectedCluster.minGrade && 
          student.grade <= this.selectedCluster.maxGrade
        )
      }
      
      return true
    }
  },
  
  async mounted() {
    await this.clustersStore.fetchClusters()
  },
  
  methods: {
    selectCluster(cluster) {
      this.selectedCluster = cluster
      this.clustersStore.selectCluster(cluster)
      this.initializePreferences()
    },
    
    backToSelection() {
      this.selectedCluster = null
      this.studentPreferences = []
    },
    
    initializePreferences() {
      // Initialize preferences for this cluster
      this.studentPreferences = this.selectedCluster.students
        .filter(email => email !== this.authStore.user?.email)
        .map(email => ({
          email,
          selected: false,
          grade: ''
        }))
    },
    
    toggleStudent(student) {
      const preference = this.studentPreferences.find(p => p.email === student.email)
      if (preference) {
        preference.selected = student.selected
        if (!student.selected) {
          preference.grade = '' // Reset grade if deselected
        }
      }
    },
    
    async submitPreferences() {
      const preferences = {
        studentId: this.authStore.user.email,
        clusterId: this.selectedCluster.id,
        choices: this.selectedStudents.map(student => ({
          email: student.email,
          name: student.name,
          grade: this.selectedCluster.gradingEnabled ? student.grade : null
        }))
      }
      
      const result = await this.clustersStore.submitStudentPreferences(
        this.selectedCluster.id, 
        preferences
      )
      
      if (result.success) {
        alert('Preferences submitted successfully!')
        this.backToSelection()
      } else {
        alert('Error submitting preferences: ' + result.error)
      }
    },
    
    logout() {
      this.$emit('logout')
    }
  }
}
</script>

<style scoped>
.student-dashboard-form {
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
  max-width: 800px;
  margin: 0 auto;
}

.clusters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.cluster-card {
  padding: 20px;
  background-color: white;
  border: 2px solid #333;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cluster-card:hover {
  background-color: #ffeb3b;
}

.grading-info {
  color: #2196F3;
  font-weight: bold;
}

.cluster-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.back-btn {
  padding: 8px 16px;
  background-color: #666;
  color: white;
  border: 2px solid #333;
  cursor: pointer;
}

.info-box {
  background-color: #e3f2fd;
  border: 2px dashed #2196F3;
  padding: 20px;
  margin-bottom: 30px;
}

.info-box h3 {
  color: #2196F3;
  margin-bottom: 10px;
}

.preferences-form {
  background-color: white;
  border: 2px solid #333;
  padding: 20px;
}

.students-list {
  margin: 20px 0;
}

.student-item {
  background-color: #ffeb3b;
  border: 2px solid #333;
  padding: 15px;
  margin-bottom: 10px;
  transition: all 0.3s ease;
}

.student-item.selected {
  background-color: #4CAF50;
  color: white;
}

.student-item.unavailable {
  background-color: #ccc;
  opacity: 0.6;
}

.student-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.student-name {
  font-weight: bold;
}

.unavailable-text {
  color: #666;
  font-style: italic;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 28px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
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

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 4px;
  bottom: 2px;
  background-color: white;
  transition: .4s;
}

input:checked + .toggle-slider {
  background-color: #2196F3;
}

input:checked + .toggle-slider:before {
  transform: translateX(22px);
}

.grade-input {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.grade-field {
  width: 80px;
  padding: 5px;
  border: 2px solid #333;
  background-color: white;
}

.selected-summary {
  background-color: #e8f5e8;
  border: 2px solid #4CAF50;
  padding: 15px;
  margin: 20px 0;
}

.selected-summary ol {
  margin-top: 10px;
}

.submit-btn {
  width: 100%;
  padding: 15px;
  background-color: #2196F3;
  color: white;
  border: 2px solid #333;
  cursor: pointer;
  font-size: 1.1rem;
  margin-top: 20px;
}

.submit-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.submit-btn:hover:not(:disabled) {
  background-color: #1976D2;
}
</style>
