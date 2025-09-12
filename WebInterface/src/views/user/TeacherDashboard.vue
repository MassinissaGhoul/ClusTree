<template>
  <div class="teacher-dashboard">
    <TeacherDashboardForm @logout="handleLogout" />
  </div>
</template>

<script>
import TeacherDashboardForm from '@/components/dashboard/TeacherDashboardForm.vue'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'TeacherDashboard',
  components: {
    TeacherDashboardForm
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