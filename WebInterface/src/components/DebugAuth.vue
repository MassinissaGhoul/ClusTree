<!-- components/DebugAuth.vue - Composant temporaire pour déboguer -->
<template>
  <div class="debug-auth" v-if="showDebug">
    <div class="debug-panel">
      <h4>🔍 Debug Auth</h4>
      <div class="debug-info">
        <p><strong>Authenticated:</strong> {{ authStore.isAuthenticated ? '✅' : '❌' }}</p>
        <p><strong>Initialized:</strong> {{ authStore.initialized ? '✅' : '❌' }}</p>
        <p><strong>User:</strong> {{ authStore.user?.name || 'None' }}</p>
        <p><strong>Role:</strong> {{ authStore.userRoleString }}</p>
        <p><strong>Token:</strong> {{ authStore.token ? '✅ Présent' : '❌ Absent' }}</p>
        <p><strong>Loading:</strong> {{ authStore.loading ? '⏳' : '✅' }}</p>
        <p><strong>Error:</strong> {{ authStore.error || 'None' }}</p>
      </div>
      <div class="debug-actions">
        <button @click="authStore.forceReconnect()" class="debug-btn">
          🔄 Force Reconnect
        </button>
        <button @click="authStore.logout()" class="debug-btn">
          🚪 Logout
        </button>
        <button @click="showDebug = false" class="debug-btn">
          ❌ Fermer
        </button>
      </div>
    </div>
  </div>
  <button 
    v-else 
    @click="showDebug = true" 
    class="debug-toggle"
    title="Ouvrir le debug auth"
  >
    🔍
  </button>
</template>

<script>
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'DebugAuth',
  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },
  
  data() {
    return {
      showDebug: false
    }
  }
}
</script>

<style scoped>
.debug-toggle {
  position: fixed;
  top: 10px;
  right: 10px;
  background: #333;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 50%;
  cursor: pointer;
  z-index: 1000;
  font-size: 16px;
}

.debug-auth {
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 1000;
}

.debug-panel {
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 15px;
  border-radius: 8px;
  min-width: 250px;
  font-family: monospace;
  font-size: 12px;
}

.debug-panel h4 {
  margin: 0 0 10px 0;
  color: #ffeb3b;
}

.debug-info p {
  margin: 5px 0;
  word-break: break-all;
}

.debug-actions {
  margin-top: 10px;
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.debug-btn {
  background: #333;
  color: white;
  border: 1px solid #666;
  padding: 5px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 10px;
}

.debug-btn:hover {
  background: #555;
}
</style>