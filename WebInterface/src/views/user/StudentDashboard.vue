<template>
  <div class="student-dashboard">
    <StudentDashboardForm @logout="handleLogout" />
  </div>
</template>

<script>
import StudentDashboardForm from '@/components/dashboard/StudentDashboardForm.vue'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'StudentDashboard',
  components: {
    StudentDashboardForm
  },
  
  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },
  
  methods: {
    handleLogout() {
      this.authStore.logout()
      this.$router.push('/')
    }
  }
}
</script>