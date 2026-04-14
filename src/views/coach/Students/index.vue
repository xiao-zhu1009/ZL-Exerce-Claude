<template>
  <div>
    <el-tabs v-model="activeTab" @tab-click="onTabChange">
      <!-- ── 已绑定学员 ── -->
      <el-tab-pane label="我的学员" name="active">
        <el-table :data="students" v-loading="loading" border fit>
          <el-table-column prop="nickname" label="学员昵称" min-width="100" />
          <el-table-column prop="goal" label="训练目标" min-width="120" show-overflow-tooltip />
          <el-table-column prop="bind_at" label="绑定时间" min-width="130">
            <template slot-scope="scope">{{ scope.row.bind_at ? scope.row.bind_at.slice(0,10) : '-' }}</template>
          </el-table-column>
          <el-table-column label="操作" min-width="160">
            <template slot-scope="scope">
              <el-button size="mini" type="primary" @click="$router.push(`/coach/students/${scope.row.id}`)">查看详情</el-button>
              <el-button size="mini" type="danger" @click="handleEndBind(scope.row)">解绑</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- ── 待处理申请 ── -->
      <el-tab-pane name="pending">
        <span slot="label">
          待处理申请
          <el-badge v-if="pendingCount > 0" :value="pendingCount" style="margin-left:4px" />
        </span>
        <el-table :data="requests" v-loading="reqLoading" border fit>
          <el-table-column prop="nickname" label="学员昵称" min-width="100" />
          <el-table-column prop="request_msg" label="申请留言" min-width="180" show-overflow-tooltip />
          <el-table-column prop="created_at" label="申请时间" min-width="130">
            <template slot-scope="scope">{{ scope.row.created_at ? scope.row.created_at.slice(0,10) : '-' }}</template>
          </el-table-column>
          <el-table-column label="操作" min-width="160">
            <template slot-scope="scope">
              <el-button size="mini" type="success" @click="handleApprove(scope.row)">同意</el-button>
              <el-button size="mini" type="danger" @click="handleReject(scope.row)">拒绝</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- 拒绝原因弹窗 -->
    <el-dialog title="拒绝申请" :visible.sync="rejectVisible" width="380px">
      <el-input v-model="rejectReason" type="textarea" :rows="3" placeholder="填写拒绝原因（可选）" />
      <div slot="footer">
        <el-button @click="rejectVisible = false">取消</el-button>
        <el-button type="danger" :loading="actionLoading" @click="submitReject">确认拒绝</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getStudents, getBindRequests, approveBindRequest, rejectBindRequest, coachEndBind } from '@/api/coach'

export default {
  name: 'Students',
  data() {
    return {
      activeTab: 'active',
      // 已绑定学员
      loading: false,
      students: [],
      // 待处理申请
      reqLoading: false,
      requests: [],
      pendingCount: 0,
      // 拒绝弹窗
      rejectVisible: false,
      rejectTarget: null,
      rejectReason: '',
      actionLoading: false,
    }
  },
  created() {
    this.fetchStudents()
    this.fetchPendingCount()
  },
  methods: {
    onTabChange(tab) {
      if (tab.name === 'active') this.fetchStudents()
      if (tab.name === 'pending') this.fetchRequests()
    },
    async fetchStudents() {
      this.loading = true
      try {
        const res = await getStudents()
        this.students = res.data || []
      } finally { this.loading = false }
    },
    async fetchRequests() {
      this.reqLoading = true
      try {
        const res = await getBindRequests('pending')
        this.requests = res.data || []
        this.pendingCount = this.requests.length
      } finally { this.reqLoading = false }
    },
    async fetchPendingCount() {
      try {
        const res = await getBindRequests('pending')
        this.pendingCount = (res.data || []).length
      } catch {}
    },
    async handleApprove(row) {
      try {
        await approveBindRequest(row.bind_id)
        this.$message.success('已同意')
        this.fetchRequests()
        this.fetchStudents()
      } catch (e) {
        this.$message.error(e.response?.data?.message || '操作失败')
      }
    },
    handleReject(row) {
      this.rejectTarget = row
      this.rejectReason = ''
      this.rejectVisible = true
    },
    async submitReject() {
      this.actionLoading = true
      try {
        await rejectBindRequest(this.rejectTarget.bind_id, this.rejectReason)
        this.$message.success('已拒绝')
        this.rejectVisible = false
        this.fetchRequests()
      } catch (e) {
        this.$message.error(e.response?.data?.message || '操作失败')
      } finally { this.actionLoading = false }
    },
    async handleEndBind(row) {
      await this.$confirm(`确认解除与「${row.nickname}」的绑定？`, '提示', { type: 'warning' })
      try {
        await coachEndBind(row.bind_id)
        this.$message.success('已解绑')
        this.fetchStudents()
      } catch (e) {
        this.$message.error(e.response?.data?.message || '操作失败')
      }
    },
  }
}
</script>
