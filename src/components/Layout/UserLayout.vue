<template>
  <el-container style="height:100vh">
    <el-aside width="200px" style="background:#001529">
      <div style="color:#fff;font-size:16px;font-weight:bold;padding:20px 16px;border-bottom:1px solid #1f3a5f">
        💪 智能健身 · 用户端
      </div>
      <el-menu router background-color="#001529" text-color="#ccc" active-text-color="#409EFF" :default-active="$route.path">
        <el-menu-item index="/user/dashboard"><i class="el-icon-data-analysis" />数据看板</el-menu-item>
        <el-menu-item index="/user/actions"><i class="el-icon-video-play" />动作库</el-menu-item>
        <el-menu-item index="/user/diet"><i class="el-icon-food" />饮食中心</el-menu-item>
        <el-menu-item index="/user/diet/record"><i class="el-icon-notebook-2" />饮食记录</el-menu-item>
        <el-menu-item index="/user/courses"><i class="el-icon-date" />课程预约</el-menu-item>
        <el-menu-item index="/user/profile"><i class="el-icon-user" />个人主页</el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header style="background:#fff;display:flex;align-items:center;justify-content:flex-end;border-bottom:1px solid #eee">
        <span style="margin-right:12px;color:#666">{{ user && user.nickname }}</span>
        <el-button size="small" @click="logout">退出</el-button>
      </el-header>
      <el-main style="background:#f0f2f5">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: 'UserLayout',
  computed: { user() { return this.$store.state.user } },
  methods: {
    logout() {
      this.$store.dispatch('logout')
      this.$router.push('/login')
    }
  }
}
</script>
