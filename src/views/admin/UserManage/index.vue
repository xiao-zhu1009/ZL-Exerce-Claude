<template>
  <div>
    <h2 style="margin-bottom:20px">用户管理</h2>
    <el-card style="margin-bottom:16px">
      <el-row :gutter="12">
        <el-col :span="8">
          <el-input v-model="keyword" placeholder="搜索用户名/昵称" clearable @clear="fetchList">
            <el-button slot="append" icon="el-icon-search" @click="fetchList" />
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-select v-model="roleFilter" placeholder="角色筛选" clearable @change="fetchList" style="width:100%">
            <el-option label="普通用户" value="user" /><el-option label="教练" value="coach" /><el-option label="管理员" value="admin" />
          </el-select>
        </el-col>
      </el-row>
    </el-card>

    <el-table :data="list" v-loading="loading" border>
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="nickname" label="昵称" />
      <el-table-column label="角色" width="90">
        <template slot-scope="scope">
          <el-tag :type="roleType(scope.row.role)" size="small">{{ roleLabel(scope.row.role) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="80">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status ? 'success' : 'danger'" size="small">{{ scope.row.status ? '正常' : '封禁' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="注册时间" width="120" />
      <el-table-column label="操作" width="220">
        <template slot-scope="scope">
          <el-button size="mini" :type="scope.row.status ? 'danger' : 'success'" @click="toggleStatus(scope.row)">
            {{ scope.row.status ? '封禁' : '解封' }}
          </el-button>
          <el-select v-model="scope.row.role" size="mini" style="width:90px;margin-left:8px"
            @change="val => confirmChangeRole(scope.row, val)">
            <el-option label="用户" value="user" /><el-option label="教练" value="coach" />
          </el-select>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { getAdminUsers, toggleUserStatus, changeUserRole } from '@/api/admin'

export default {
  name: 'UserManage',
  data() { return { loading: false, list: [], keyword: '', roleFilter: '' } },
  created() { this.fetchList() },
  methods: {
    async fetchList() {
      this.loading = true
      try {
        // TODO: 对接后端 GET /admin/users?keyword=&role=
        const res = await getAdminUsers({ keyword: this.keyword, role: this.roleFilter })
        this.list = res.data.list
      } finally { this.loading = false }
    },
    async toggleStatus(user) {
      const newStatus = user.status ? 0 : 1
      const name = user.nickname || user.username
      try {
        await this.$confirm(
          newStatus === 0 ? `确认封禁「${name}」？封禁后该用户将被强制下线且无法登录。` : `确认解封「${name}」？`,
          newStatus === 0 ? '封禁确认' : '解封确认',
          { confirmButtonText: '确认', cancelButtonText: '取消', type: 'warning' }
        )
      } catch { return }
      try {
        const res = await toggleUserStatus(user.id, newStatus)
        if (res.code !== 200) return this.$message.error(res.msg || '操作失败')
        user.status = newStatus
        this.$message.success(newStatus === 0 ? '已封禁，该用户将被强制下线' : '已解封')
      } catch (e) {
        this.$message.error(e?.response?.data?.detail || '操作失败')
      }
    },
    async confirmChangeRole(user, newRole) {
      const oldRole = newRole === 'user' ? 'coach' : 'user'  // el-select 已更新 v-model，反推旧值
      const label = { user: '普通用户', coach: '教练' }
      try {
        await this.$confirm(
          `确认将「${user.nickname || user.username}」的角色从 ${label[oldRole]} 改为 ${label[newRole]}？\n该用户需重新登录后生效。`,
          '修改角色确认',
          { confirmButtonText: '确认', cancelButtonText: '取消', type: 'warning' }
        )
      } catch {
        // 取消：回滚 v-model
        user.role = oldRole
        return
      }
      try {
        const res = await changeUserRole(user.id, newRole)
        if (res.code !== 200) {
          user.role = oldRole
          return this.$message.error(res.msg || '操作失败')
        }
        this.$message.success('角色已更新，该用户需重新登录后生效')
      } catch (e) {
        user.role = oldRole
        this.$message.error(e?.response?.data?.detail || '操作失败')
      }
    },
    roleLabel(r) { return { user: '用户', coach: '教练', admin: '管理员' }[r] },
    roleType(r) { return { user: '', coach: 'success', admin: 'danger' }[r] }
  }
}
</script>
