<template>
  <div class="home-container">
    <div class="hero-section">
      <h1 class="main-title">Cluster Management System</h1>
      <p class="subtitle">
        Collaborative platform for creating and managing student groups
      </p>
      
      <div class="auth-buttons">
        <router-link to="/login" class="auth-btn login-btn">
          Log In
        </router-link>
        <router-link to="/register" class="auth-btn register-btn">
          Sign Up
        </router-link>
      </div>
    </div>
    

  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'HomeView',
  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },
  
  mounted() {
    // Vérifier si l'utilisateur est déjà connecté
    if (this.authStore.isAuthenticated) {
      if (this.authStore.isTeacher) {
        this.$router.push('/teacher-dashboard')
      } else {
        this.$router.push('/student-dashboard')
      }
    }
  }
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #ffeb3b 0%, #fff 50%, #e3f2fd 100%);
  padding: 40px 20px;
}

.hero-section {
  text-align: center;
  max-width: 800px;
  margin: 0 auto 60px;
  padding: 60px 20px;
  background-color: white;
  border: 3px solid #333;
  box-shadow: 8px 8px 0px #333;
}

.main-title {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
  text-shadow: 2px 2px 0px #ffeb3b;
}

.subtitle {
  font-size: 1.3rem;
  color: #666;
  margin-bottom: 40px;
  line-height: 1.6;
}

.auth-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.auth-btn {
  padding: 15px 30px;
  font-size: 1.2rem;
  font-weight: bold;
  text-decoration: none;
  border: 3px solid #333;
  transition: all 0.3s ease;
  min-width: 150px;
  text-align: center;
}

.login-btn {
  background-color: #ffeb3b;
  color: #333;
}

.login-btn:hover {
  background-color: #333;
  color: #ffeb3b;
  transform: translateY(-2px);
}

.register-btn {
  background-color: #2196F3;
  color: white;
}

.register-btn:hover {
  background-color: #333;
  color: #2196F3;
  transform: translateY(-2px);
}

.features-section {
  max-width: 1000px;
  margin: 0 auto;
}

.features-section h2 {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 40px;
  color: #333;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 30px;
}

.feature-card {
  padding: 30px;
  border: 3px solid #333;
  background-color: white;
  box-shadow: 6px 6px 0px #333;
}

.teacher-feature {
  border-left: 10px solid #ffeb3b;
}

.student-feature {
  border-left: 10px solid #2196F3;
}

.feature-card h3 {
  font-size: 1.8rem;
  margin-bottom: 20px;
  color: #333;
}

.feature-card ul {
  list-style: none;
  padding: 0;
}

.feature-card li {
  padding: 8px 0;
  border-bottom: 1px solid #eee;
  position: relative;
  padding-left: 20px;
}

.feature-card li:before {
  content: "✓";
  position: absolute;
  left: 0;
  color: #4CAF50;
  font-weight: bold;
}

.teacher-feature li:before {
  color: #ff9800;
}

.student-feature li:before {
  color: #2196F3;
}

@media (max-width: 768px) {
  .main-title {
    font-size: 2.2rem;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .feature-card {
    min-width: auto;
  }
  
  .auth-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .auth-btn {
    width: 200px;
  }
}
</style>