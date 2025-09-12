<template>
  <div class="login-form-container">
    <div class="form-header">
      <button @click="goHome" class="home-btn">← Home</button>
      <h2>Login</h2>
    </div>
    
    <form @submit.prevent="handleLogin" class="login-form">
      <div class="form-group">
        <label for="email">Email</label>
        <input 
          id="email"
          v-model="credentials.email" 
          type="email" 
          required 
          placeholder="your@email.com"
          class="form-input"
        >
      </div>
      
      <div class="form-group">
        <label for="password">Password</label>
        <input 
          id="password"
          v-model="credentials.password" 
          type="password" 
          required 
          placeholder="Your password"
          class="form-input"
        >
      </div>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <button type="submit" class="submit-btn" :disabled="loading">
        {{ loading ? 'Logging in...' : 'Login' }}
      </button>
    </form>
    
    <div class="form-footer">
      <p>Don't have an account? 
        <router-link to="/register" class="link">Sign up</router-link>
      </p>

    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'LoginForm',
  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },
  
  data() {
    return {
      credentials: {
        email: '',
        password: ''
      },
      loading: false,
      error: null
    }
  },
  
  methods: {
    async handleLogin() {
      this.loading = true
      this.error = null
      
      try {
        const result = await this.authStore.login(this.credentials)
        
        if (result.success) {
          // Redirect to appropriate dashboard
          if (this.authStore.isTeacher) {
            this.$router.push('/teacher-dashboard')
          } else {
            this.$router.push('/student-dashboard')
          }
        } else {
          this.error = result.error || 'Login error'
        }
      } catch (error) {
        this.error = 'Login error. Please try again.'
      } finally {
        this.loading = false
      }
    },
    
    goHome() {
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
.login-form-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 30px;
  background-color: white;
  border: 2px solid #333;
  position: relative;
}

.form-header {
  text-align: center;
  margin-bottom: 30px;
  margin-top: 40px;
}

.home-btn {
  position: absolute;
  top: -40px;
  left: 0;
  padding: 8px 12px;
  background-color: #666;
  color: white;
  border: 2px solid #333;
  cursor: pointer;
  font-size: 14px;
}

.home-btn:hover {
  background-color: #333;
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
  padding: 12px;
  border: 2px solid #333;
  background-color: #fff;
  font-size: 16px;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  background-color: #fffbeb;
}

.error-message {
  background-color: #ffebee;
  color: #f44336;
  padding: 10px;
  border: 2px solid #f44336;
  margin-bottom: 20px;
}

.submit-btn {
  width: 100%;
  padding: 15px;
  background-color: #ffeb3b;
  border: 2px solid #333;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
  background-color: #333;
  color: white;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-footer {
  text-align: center;
  margin-top: 20px;
}

.form-footer p {
  margin: 10px 0;
}

.link {
  color: #2196F3;
  text-decoration: none;
  font-weight: bold;
}

.link:hover {
  text-decoration: underline;
}
</style>