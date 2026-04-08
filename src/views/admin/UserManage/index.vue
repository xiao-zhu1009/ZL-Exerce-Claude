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
          <el-select v-model="scope.row.role" size="mini" style="width:90px;margin-left:8px" @change="changeRole(scope.row)">
            <el-option label="用户" value="user" /><el-option label="教练" value="coach" />
          </el-select>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { getAdminUsers, toggleUserStatus, changeUserRole } from '../../../api/admin'

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
      // TODO: 对接后端 PUT /admin/users/:id/status
      await toggleUserStatus(user.id, user.status ? 0 : 1)
      user.status = user.status ? 0 : 1
    },
    async changeRole(user) {
      // TODO: 对接后端 PUT /admin/users/:id/role
      await changeUserRole(user.id, user.role)
      this.$message.success('角色已更新')
    },
    roleLabel(r) { return { user: '用户', coach: '教练', admin: '管理员' }[r] },
    roleType(r) { return { user: '', coach: 'success', admin: 'danger' }[r] }
  }
}
</script>
