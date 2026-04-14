<template>
  <el-container style="height:100vh">
    <el-aside width="200px" style="background:#1a0533">
      <div style="color:#fff;font-size:16px;font-weight:bold;padding:20px 16px;border-bottom:1px solid #3d1a6e">
        ⚙️ 智能健身 · 管理端
      </div>
      <el-menu router background-color="#1a0533" text-color="#ccc" active-text-color="#E6A23C" :default-active="$route.path">
        <el-menu-item index="/admin/statistics"><i class="el-icon-data-line" />数据统计</el-menu-item>
        <el-menu-item index="/admin/users"><i class="el-icon-user" />用户管理</el-menu-item>
        <el-menu-item index="/admin/review/actions"><i class="el-icon-video-camera" />动作审核</el-menu-item>
        <el-menu-item index="/admin/review/articles"><i class="el-icon-document" />文章审核</el-menu-item>
        <el-menu-item index="/admin/review/courses"><i class="el-icon-date" />课程审核</el-menu-item>
        <el-menu-item index="/admin/review/foods"><i class="el-icon-food" />食物库审核</el-menu-item>
        <el-menu-item index="/admin/coach-apply"><i class="el-icon-s-custom" />教练申请</el-menu-item>
        <el-menu-item index="/admin/bind-monitor"><i class="el-icon-connection" />绑定监管</el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="admin-layout-header">
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
  name: 'AdminLayout',
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
.admin-layout-header {
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
