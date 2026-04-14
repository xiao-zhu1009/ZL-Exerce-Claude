<template>
  <el-container style="height:100vh">
    <el-aside width="200px" style="background:#001529">
      <div style="color:#fff;font-size:16px;font-weight:bold;padding:20px 16px;border-bottom:1px solid #1f3a5f">
        💪 智能健身 · 用户端
      </div>
      <el-menu router background-color="#001529" text-color="#ccc" active-text-color="#409EFF" :default-active="menuActivePath">
        <el-menu-item index="/user/dashboard"><i class="el-icon-data-analysis" />数据看板</el-menu-item>
        <el-menu-item index="/user/training"><i class="el-icon-trophy" />训练中心</el-menu-item>
        <el-menu-item index="/user/diet"><i class="el-icon-food" />饮食中心</el-menu-item>
        <el-menu-item index="/user/articles"><i class="el-icon-reading" />文章库</el-menu-item>
        <el-menu-item index="/user/coach-zone"><i class="el-icon-s-cooperation" />教练专区</el-menu-item>
        <el-menu-item index="/user/courses"><i class="el-icon-date" />课程预约</el-menu-item>
        <el-menu-item index="/user/profile"><i class="el-icon-user" />个人主页</el-menu-item>
        <el-menu-item index="/user/apply-coach"><i class="el-icon-s-custom" />申请成为教练</el-menu-item>
      </el-menu>
    </el-aside>
    
    <el-container>
      <el-header class="user-layout-header">
        <span class="page-title">{{ $route.meta.title || '' }}</span>
        <el-dropdown trigger="click" class="user-menu" @command="handleUserCommand">
          <span class="user-menu-trigger">
            <el-avatar :size="32" fit="cover" :src="headerAvatar" class="user-menu-avatar">
              <i class="el-icon-user" />
            </el-avatar>
            <span class="user-menu-name">{{ displayName }}</span>
            <i class="el-icon-arrow-down user-menu-caret" />
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="profile" icon="el-icon-user">个人主页</el-dropdown-item>
            <el-dropdown-item command="logout" divided icon="el-icon-switch-button">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
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
  computed: {
    /** 训练中心含动作详情子路由时，侧栏仍高亮「训练中心」 */
    menuActivePath() {
      const p = this.$route.path
      if (p.startsWith('/user/training')) return '/user/training'
      if (p.startsWith('/user/articles')) return '/user/articles'
      return p
    },
    user() {
      return this.$store.state.user
    },
    reservationCount() {
      return this.$store.state.reservationCount
    },
    /** 与个人主页一致：有 URL 则显示图，否则用插槽默认图标；随登录 / Profile 内 syncUserToStore 更新 */
    headerAvatar() {
      const a = (this.user && this.user.avatar ? String(this.user.avatar) : '').trim()
      return a || undefined
    },
    displayName() {
      if (!this.user) return '用户'
      return (this.user.nickname || this.user.username || '').trim() || '用户'
    }
  },
  methods: {
    handleUserCommand(cmd) {
      if (cmd === 'profile') {
        if (this.$route.path !== '/user/profile') {
          this.$router.push('/user/profile')
        }
        return
      }
      if (cmd === 'logout') this.logout()
    },
    logout() {
      this.$store.dispatch('logout')
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.user-layout-header {
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
.user-menu-trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  color: #606266;
  outline: none;
}
.user-menu-trigger:hover {
  background: #f5f7fa;
  color: #409eff;
}
.user-menu-avatar {
  flex-shrink: 0;
  background: #c0c4cc !important;
}
.user-menu-name {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
}
.user-menu-caret {
  font-size: 12px;
  color: #909399;
}
.menu-badge {
  line-height: 1;
}
.menu-badge >>> .el-badge__content {
  top: 2px;
  right: -6px;
}
</style>
