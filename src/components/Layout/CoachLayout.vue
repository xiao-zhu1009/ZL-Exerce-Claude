<template>
  <el-container style="height:100vh">
    <el-aside width="200px" style="background:#0a3d2e">
      <div style="color:#fff;font-size:16px;font-weight:bold;padding:20px 16px;border-bottom:1px solid #1a5c44">
        🏋️ 智能健身 · 教练端
      </div>
      <el-menu router background-color="#0a3d2e" text-color="#ccc" active-text-color="#67C23A" :default-active="$route.path">
        <el-menu-item index="/coach/students"><i class="el-icon-user" />学员管理</el-menu-item>
        <el-menu-item index="/coach/courses"><i class="el-icon-date" />课程管理</el-menu-item>
        <el-menu-item index="/coach/publish/action"><i class="el-icon-video-camera" />动作库投稿</el-menu-item>
        <el-menu-item index="/coach/publish/article"><i class="el-icon-edit-outline" />文章库投稿</el-menu-item>
        <el-menu-item index="/coach/foods"><i class="el-icon-food" />食物库投稿</el-menu-item>
        <el-menu-item index="/coach/profile"><i class="el-icon-user-solid" />个人主页</el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="coach-layout-header">
        <span class="page-title">{{ $route.meta.title || '' }}</span>
        <div class="header-right">
          <span class="user-name">{{ user && user.nickname }}</span>
          <el-button size="small" @click="logout">退出</el-button>
        </div>
      </el-header>
      <el-main style="background:#f0f2f5">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: 'CoachLayout',
  computed: { user() { return this.$store.state.user } },
  methods: {
    logout() {
      this.$store.dispatch('logout')
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.coach-layout-header {
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #eee;
  padding: 0 16px 0 20px;
}
.page-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.user-name {
  color: #666;
  font-size: 14px;
}
</style>
