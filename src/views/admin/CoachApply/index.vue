<template>
  <div>
    <h2 style="margin-bottom:20px">教练申请审批</h2>

    <!-- Tab 切换 -->
    <el-tabs v-model="activeTab" @tab-click="loadList">
      <el-tab-pane label="待审" name="pending" />
      <el-tab-pane label="已通过" name="approved" />
      <el-tab-pane label="已拒绝" name="rejected" />
    </el-tabs>

    <el-table :data="list" border fit style="width:100%">
      <el-table-column prop="username" label="账号" min-width="100" />
      <el-table-column prop="nickname" label="昵称" min-width="100" />
      <el-table-column prop="reason" label="申请说明" min-width="160" show-overflow-tooltip />
      <el-table-column prop="reject_reason" label="拒绝原因" min-width="160" show-overflow-tooltip />
      <el-table-column prop="created_at" label="申请时间" min-width="150" />
      <el-table-column label="操作" min-width="130" v-if="activeTab === 'pending'">
        <template slot-scope="{ row }">
          <el-button size="mini" type="success" @click="approve(row)">通过</el-button>
          <el-button size="mini" type="danger" @click="openReject(row)">拒绝</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 拒绝弹窗 -->
    <el-dialog title="填写拒绝原因" :visible.sync="rejectDialog" width="400px">
      <el-input v-model="rejectReason" type="textarea" :rows="3" placeholder="请填写拒绝原因" maxlength="500" show-word-limit />
      <span slot="footer">
        <el-button @click="rejectDialog = false">取消</el-button>
        <el-button type="danger" :loading="operating" @click="confirmReject">确认拒绝</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'

export default {
  name: 'CoachApply',
  data() {
    return {
      activeTab: 'pending',
      list: [],
      rejectDialog: false,
      rejectReason: '',
      currentRow: null,
      operating: false
    }
  },
  created() {
    this.loadList()
  },
  methods: {
    async loadList() {
      try {
        const res = await request.get('/admin/coach-applications', { params: { status: this.activeTab } })
        if (res.code === 200) this.list = res.data || []
      } catch (_) { this.$message.error('加载失败') }
    },
    async approve(row) {
      try {
        const res = await request.post(`/admin/coach-applications/${row.id}/approve`)
        if (res.code !== 200) return this.$message.error(res.msg || '操作失败')
        this.$message.success('已通过')
        this.loadList()
      } catch (e) {
        this.$message.error(e?.response?.data?.detail || '操作失败')
      }
    },
    openReject(row) {
      this.currentRow = row
      this.rejectReason = ''
      this.rejectDialog = true
    },
    async confirmReject() {
      if (!this.rejectReason.trim()) return this.$message.error('请填写拒绝原因')
      this.operating = true
      try {
        const res = await request.post(`/admin/coach-applications/${this.currentRow.id}/reject`, {
          reject_reason: this.rejectReason
        })
        if (res.code !== 200) return this.$message.error(res.msg || '操作失败')
        this.$message.success('已拒绝')
        this.rejectDialog = false
        this.loadList()
      } catch (e) {
        this.$message.error(e?.response?.data?.detail || '操作失败')
      } finally {
        this.operating = false
      }
    }
  }
}
</script>
