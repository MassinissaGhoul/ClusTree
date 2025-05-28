<template>
  <div class="login-view">
    <LoginForm />
  </div>
</template>

<script>
import LoginForm from '@/components/auth/LoginForm.vue'

export default {
  name: 'LoginView',
  components: {
    LoginForm
  }
}
</script>

<style scoped>
.login-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #ffeb3b 0%, #fff 50%, #e3f2fd 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
</style>