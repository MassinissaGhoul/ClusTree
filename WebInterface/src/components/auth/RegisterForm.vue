<template>
  <div class="register-form-container">
    <div class="form-header">
      <button @click="goHome" class="home-btn">← Accueil</button>
      <h2>Inscription</h2>
    </div>
    
    <form @submit.prevent="handleRegister" class="register-form">
      <div class="form-group">
        <label for="firstName">Prénom</label>
        <input 
          id="firstName"
          v-model="userData.firstName" 
          type="text" 
          required 
          placeholder="Votre prénom"
          class="form-input"
        >
      </div>
      
      <div class="form-group">
        <label for="lastName">Nom</label>
        <input 
          id="lastName"
          v-model="userData.lastName" 
          type="text" 
          required 
          placeholder="Votre nom de famille"
          class="form-input"
        >
      </div>
      
      <div class="form-group">
        <label for="email">Email</label>
        <input 
          id="email"
          v-model="userData.email" 
          type="email" 
          required 
          placeholder="votre@email.com"
          class="form-input"
        >
      </div>
      
      <div class="form-group">
        <label for="password">Mot de passe</label>
        <input 
          id="password"
          v-model="userData.password" 
          type="password" 
          required 
          placeholder="Votre mot de passe"
          class="form-input"
        >
      </div>
      
      <div class="form-group">
        <label for="confirmPassword">Confirmer le mot de passe</label>
        <input 
          id="confirmPassword"
          v-model="userData.confirmPassword" 
          type="password" 
          required 
          placeholder="Confirmez votre mot de passe"
          class="form-input"
        >
      </div>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <button type="submit" class="submit-btn" :disabled="loading || !canSubmit">
        {{ loading ? 'Inscription...' : 'S\'inscrire' }}
      </button>
    </form>
    
    <div class="form-footer">
      <p>Déjà un compte ? 
        <router-link to="/login" class="link">Se connecter</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'RegisterForm',
  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },
  
  data() {
    return {
      userData: {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
      },
      loading: false,
      error: null
    }
  },
  
  computed: {
    canSubmit() {
      return this.userData.firstName.trim() &&
             this.userData.lastName.trim() &&
             this.userData.email.trim() &&
             this.userData.password &&
             this.userData.confirmPassword &&
             this.userData.password === this.userData.confirmPassword
    }
  },
  
  watch: {
    'userData.confirmPassword'() {
      if (this.userData.password && this.userData.confirmPassword && 
          this.userData.password !== this.userData.confirmPassword) {
        this.error = 'Les mots de passe ne correspondent pas'
      } else {
        this.error = null
      }
    }
  },
  
  methods: {
    async handleRegister() {
      if (this.userData.password !== this.userData.confirmPassword) {
        this.error = 'Les mots de passe ne correspondent pas'
        return
      }
      
      this.loading = true
      this.error = null
      
      try {
        // Déterminer le rôle basé sur l'email (logique temporaire)
        // Vous pouvez changer cette logique selon vos besoins
        const role = this.userData.email.includes('teacher') || this.userData.email.includes('prof') 
          ? 'teacher' 
          : 'student'
        
        const result = await this.authStore.register({
          name: `${this.userData.firstName} ${this.userData.lastName}`,
          firstName: this.userData.firstName,
          lastName: this.userData.lastName,
          email: this.userData.email,
          password: this.userData.password,
          role: role
        })
        
        if (result.success) {
          // Rediriger vers le dashboard approprié
          if (this.authStore.isTeacher) {
            this.$router.push('/teacher-dashboard')
          } else {
            this.$router.push('/student-dashboard')
          }
        } else {
          this.error = result.error || 'Erreur lors de l\'inscription'
        }
      } catch (error) {
        this.error = 'Erreur lors de l\'inscription. Veuillez réessayer.'
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
.register-form-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 30px;
  background-color: white;
  border: 2px solid #333;
}

.form-header {
  position: relative;
  text-align: center;
  margin-bottom: 30px;
}

.home-btn {
  position: absolute;
  left: 0;
  top: 0;
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

.link {
  color: #2196F3;
  text-decoration: none;
  font-weight: bold;
}

.link:hover {
  text-decoration: underline;
}
</style>