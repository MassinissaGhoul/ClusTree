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
            <p class="cluster-info">
              Type: {{ getClusterTypeLabel(cluster.cluster_type) }}
            </p>
            <p class="cluster-info">
              Group Size: {{ cluster.group_size || 2 }}
            </p>
            <p class="cluster-info">
              Affinity: {{ cluster.min_affinity || 0 }} - {{ cluster.max_affinity || 3 }}
            </p>
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
            Distribute your preference points among the available students. 
            You have <strong>{{ totalPointsAvailable }}</strong> points to distribute.
          </p>
          <p v-if="selectedCluster.gradingEnabled">
            <strong>Grading enabled:</strong> 
            You must assign a grade between {{ selectedCluster.minGrade }} and {{ selectedCluster.maxGrade }} 
            to each student you give points to.
          </p>
          <div class="points-summary">
            <span class="points-used">Points used: {{ totalPointsUsed }}</span>
            <span class="points-remaining" :class="{ 'points-exceeded': totalPointsUsed > totalPointsAvailable }">
              Remaining: {{ totalPointsAvailable - totalPointsUsed }}
            </span>
          </div>
        </div>

        <div class="preferences-form">
          <h3>Distribute Your Points</h3>
          
          <div class="students-list">
            <div 
              v-for="student in availableStudentsForSelection" 
              :key="student.id"
              class="student-item"
              :class="{ 
                'has-points': student.points > 0, 
                'unavailable': student.unavailable 
              }"
            >
              <div class="student-info">
                <span class="student-name">{{ student.name }}</span>
                <span v-if="student.unavailable" class="unavailable-text">You cannot select yourself</span>
              </div>
              
              <div v-if="!student.unavailable" class="point-controls">
                <div class="point-input-group">
                  <label>Points:</label>
                  <div class="point-input-wrapper">
                    <button 
                      @click="decrementPoints(student)" 
                      class="point-btn minus"
                      :disabled="student.points <= 0"
                    >
                      -
                    </button>
                    <input 
                      type="number" 
                      v-model.number="student.points"
                      @input="validatePoints(student)"
                      min="0"
                      :max="totalPointsAvailable"
                      class="point-input"
                    >
                    <button 
                      @click="incrementPoints(student)" 
                      class="point-btn plus"
                      :disabled="totalPointsUsed >= totalPointsAvailable"
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <!-- Quick selection buttons -->
                <div class="quick-select">
                  <button 
                    v-for="quickValue in quickSelectValues" 
                    :key="quickValue"
                    @click="setStudentPoints(student, quickValue)"
                    class="quick-btn"
                    :disabled="(totalPointsUsed - student.points + quickValue) > totalPointsAvailable"
                  >
                    {{ quickValue }}
                  </button>
                </div>
              </div>
              
              <!-- Grade input if grading is enabled and student has points -->
              <div v-if="selectedCluster.gradingEnabled && student.points > 0" class="grade-input">
                <label>Grade:</label>
                <input 
                  type="number" 
                  v-model="student.grade"
                  :min="selectedCluster.minGrade"
                  :max="selectedCluster.maxGrade"
                  class="grade-field"
                  placeholder="Enter grade"
                >
              </div>
            </div>
          </div>

          <!-- Selection Summary -->
          <div class="selected-summary" v-if="studentsWithPoints.length > 0">
            <h4>Your Point Distribution:</h4>
            <div class="distribution-list">
              <div 
                v-for="student in studentsWithPoints" 
                :key="student.id"
                class="distribution-item"
              >
                <span class="student-name">{{ student.name }}</span>
                <span class="points-badge">{{ student.points }} points</span>
                <span v-if="selectedCluster.gradingEnabled && student.grade" class="grade-badge">
                  Grade: {{ student.grade }}
                </span>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="action-buttons">
            <button 
              @click="resetAllPoints" 
              class="reset-btn"
              :disabled="totalPointsUsed === 0"
            >
              Reset All Points
            </button>
            
            <button 
              @click="submitPreferences" 
              class="submit-btn"
              :disabled="!canSubmit"
            >
              Submit Preferences
            </button>
          </div>
          
          <!-- Validation Messages -->
          <div v-if="validationErrors.length > 0" class="validation-errors">
            <h4>⚠️ Please fix the following issues:</h4>
            <ul>
              <li v-for="error in validationErrors" :key="error">{{ error }}</li>
            </ul>
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
      studentPreferences: [],
      totalPointsAvailable: 100, // Configurable total points
      quickSelectValues: [1, 5, 10, 20] // Quick selection buttons
    }
  },
  
  computed: {
    availableClusters() {
      console.log('🔍 Clusters disponibles:', this.clustersStore.clusters)
      console.log('👤 Email utilisateur:', this.authStore.user?.email)
      
      return this.clustersStore.clusters
    },
    
    availableStudentsForSelection() {
      if (!this.selectedCluster) return []
      
      const mockStudents = [
        'student0@mail.com',
        'student1@mail.com', 
        'student2@mail.com',
        'student10@mail.com',
        'student11@mail.com',
        'student12@mail.com'
      ]
      
      return mockStudents.map(email => {
        const isCurrentUser = email === this.authStore.user?.email
        const existingPreference = this.studentPreferences.find(p => p.email === email)
        
        return {
          id: email,
          name: email.split('@')[0],
          email: email,
          points: existingPreference?.points || 0,
          grade: existingPreference?.grade || '',
          unavailable: isCurrentUser
        }
      })
    },
    
    studentsWithPoints() {
      return this.availableStudentsForSelection
        .filter(student => student.points > 0)
        .sort((a, b) => b.points - a.points)
    },
    
    totalPointsUsed() {
      return this.availableStudentsForSelection
        .reduce((sum, student) => sum + (student.points || 0), 0)
    },
    
    validationErrors() {
      const errors = []
      
      if (this.totalPointsUsed > this.totalPointsAvailable) {
        errors.push(`You have exceeded the maximum points (${this.totalPointsUsed}/${this.totalPointsAvailable})`)
      }
      
      if (this.totalPointsUsed === 0) {
        errors.push('You must distribute at least 1 point')
      }
      
      if (this.selectedCluster?.gradingEnabled) {
        const studentsNeedingGrades = this.studentsWithPoints.filter(student => 
          !student.grade || 
          student.grade < this.selectedCluster.minGrade || 
          student.grade > this.selectedCluster.maxGrade
        )
        
        if (studentsNeedingGrades.length > 0) {
          errors.push(`Please assign valid grades to all students with points`)
        }
      }
      
      return errors
    },
    
    canSubmit() {
      return this.validationErrors.length === 0 && this.totalPointsUsed > 0
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
      const mockStudents = [
        'student0@mail.com',
        'student1@mail.com', 
        'student2@mail.com',
        'student10@mail.com',
        'student11@mail.com',
        'student12@mail.com'
      ]
      
      this.studentPreferences = mockStudents
        .filter(email => email !== this.authStore.user?.email)
        .map(email => ({
          email,
          points: 0,
          grade: ''
        }))
    },
    
    incrementPoints(student) {
      if (this.totalPointsUsed < this.totalPointsAvailable) {
        student.points = (student.points || 0) + 1
        this.updatePreference(student)
      }
    },
    
    decrementPoints(student) {
      if (student.points > 0) {
        student.points--
        this.updatePreference(student)
      }
    },
    
    setStudentPoints(student, points) {
      const currentTotal = this.totalPointsUsed - (student.points || 0)
      if (currentTotal + points <= this.totalPointsAvailable) {
        student.points = points
        this.updatePreference(student)
      }
    },
    
    validatePoints(student) {
      // Ensure points are within valid range
      if (student.points < 0) {
        student.points = 0
      }
      
      // Check if total exceeds limit
      if (this.totalPointsUsed > this.totalPointsAvailable) {
        const excess = this.totalPointsUsed - this.totalPointsAvailable
        student.points = Math.max(0, student.points - excess)
      }
      
      this.updatePreference(student)
    },
    
    updatePreference(student) {
      const preference = this.studentPreferences.find(p => p.email === student.email)
      if (preference) {
        preference.points = student.points || 0
        preference.grade = student.grade || ''
        
        // Clear grade if no points assigned
        if (preference.points === 0) {
          preference.grade = ''
          student.grade = ''
        }
      }
    },
    
    resetAllPoints() {
      this.availableStudentsForSelection.forEach(student => {
        student.points = 0
        student.grade = ''
      })
      
      this.studentPreferences.forEach(pref => {
        pref.points = 0
        pref.grade = ''
      })
    },
    
    async submitPreferences() {
      const preferences = {
        studentId: this.authStore.user.email,
        clusterId: this.selectedCluster.id,
        totalPoints: this.totalPointsUsed,
        choices: this.studentsWithPoints.map(student => ({
          email: student.email,
          name: student.name,
          points: student.points,
          grade: this.selectedCluster.gradingEnabled ? student.grade : null
        }))
      }
      
      const result = await this.clustersStore.submitStudentPreferences(
        this.selectedCluster.id, 
        preferences
      )
      
      if (result.success) {
        alert(`Preferences submitted successfully! You distributed ${this.totalPointsUsed} points among ${this.studentsWithPoints.length} students.`)
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
  max-width: 900px;
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

.cluster-info {
  color: #666;
  font-size: 0.9rem;
  margin: 5px 0;
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

.points-summary {
  display: flex;
  gap: 20px;
  margin-top: 15px;
  font-weight: bold;
}

.points-used {
  color: #4CAF50;
}

.points-remaining {
  color: #ff9800;
}

.points-remaining.points-exceeded {
  color: #f44336;
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
  background-color: #f9f9f9;
  border: 2px solid #ddd;
  padding: 20px;
  margin-bottom: 15px;
  transition: all 0.3s ease;
}

.student-item.has-points {
  background-color: #e8f5e8;
  border-color: #4CAF50;
}

.student-item.unavailable {
  background-color: #f0f0f0;
  opacity: 0.6;
}

.student-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.student-name {
  font-weight: bold;
  font-size: 1.1rem;
}

.unavailable-text {
  color: #666;
  font-style: italic;
}

.point-controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.point-input-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.point-input-wrapper {
  display: flex;
  align-items: center;
  gap: 5px;
}

.point-btn {
  width: 35px;
  height: 35px;
  background-color: #2196F3;
  color: white;
  border: 2px solid #333;
  cursor: pointer;
  font-weight: bold;
  font-size: 1.2rem;
}

.point-btn:hover:not(:disabled) {
  background-color: #1976D2;
}

.point-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.point-btn.minus {
  background-color: #f44336;
}

.point-btn.minus:hover:not(:disabled) {
  background-color: #d32f2f;
}

.point-input {
  width: 80px;
  padding: 8px;
  border: 2px solid #333;
  text-align: center;
  font-weight: bold;
}

.quick-select {
  display: flex;
  gap: 5px;
}

.quick-btn {
  padding: 5px 10px;
  background-color: #ffeb3b;
  border: 2px solid #333;
  cursor: pointer;
  font-size: 0.9rem;
}

.quick-btn:hover:not(:disabled) {
  background-color: #333;
  color: white;
}

.quick-btn:disabled {
  background-color: #eee;
  cursor: not-allowed;
}

.grade-input {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background-color: #fff3e0;
  border: 1px solid #ff9800;
  border-radius: 4px;
}

.grade-field {
  width: 80px;
  padding: 5px;
  border: 2px solid #333;
}

.selected-summary {
  background-color: #f0f8ff;
  border: 2px solid #2196F3;
  padding: 15px;
  margin: 20px 0;
}

.distribution-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
}

.distribution-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.points-badge {
  background-color: #4CAF50;
  color: white;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: bold;
}

.grade-badge {
  background-color: #ff9800;
  color: white;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.9rem;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.reset-btn {
  flex: 1;
  padding: 12px;
  background-color: #ff9800;
  color: white;
  border: 2px solid #333;
  cursor: pointer;
  font-weight: bold;
}

.reset-btn:hover:not(:disabled) {
  background-color: #f57c00;
}

.reset-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.submit-btn {
  flex: 2;
  padding: 15px;
  background-color: #2196F3;
  color: white;
  border: 2px solid #333;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: bold;
}

.submit-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.submit-btn:hover:not(:disabled) {
  background-color: #1976D2;
}

.validation-errors {
  background-color: #ffebee;
  border: 2px solid #f44336;
  padding: 15px;
  margin-top: 15px;
}

.validation-errors h4 {
  color: #f44336;
  margin-bottom: 10px;
}

.validation-errors ul {
  color: #d32f2f;
  margin: 0;
}
</style>