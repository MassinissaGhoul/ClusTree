<template>
  <div class="register-view">
    <RegisterForm />
  </div>
</template>

<script>
import RegisterForm from '@/components/auth/RegisterForm.vue'

export default {
  name: 'RegisterView',
  components: {
    RegisterForm
  }
}
</script>

<style scoped>
.register-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #ffeb3b 0%, #fff 50%, #e3f2fd 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
</style>