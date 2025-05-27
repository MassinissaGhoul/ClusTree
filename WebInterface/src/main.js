// main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Créer l'application Vue
const app = createApp(App)

// Créer et configurer Pinia
const pinia = createPinia()

// Utiliser les plugins
app.use(pinia)
app.use(router)

// Initialiser l'authentification au démarrage
import { useAuthStore } from '@/stores/auth'
const authStore = useAuthStore()
authStore.initAuth()

// Monter l'application
app.mount('#app')