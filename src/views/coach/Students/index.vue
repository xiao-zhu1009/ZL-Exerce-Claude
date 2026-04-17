<template>
  <div>
    <el-tabs v-model="activeTab" @tab-click="onTabChange">
      <el-tab-pane label="我的学员" name="active">
        <my-students
          :students="students"
          :loading="loading"
          @view-detail="handleViewDetail"
          @end-bind="handleEndBind"
        />
      </el-tab-pane>

      <el-tab-pane label="待处理申请" name="pending">
        <pending-applications
          :requests="requests"
          :loading="reqLoading"
          @approve="handleApprove"
          @reject="handleReject"
        />
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
import MyStudents from './MyStudents.vue'
import PendingApplications from './PendingApplications.vue'

export default {
  name: 'Students',
  components: {
    MyStudents,
    PendingApplications,
  },
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
    handleViewDetail(studentId) {
      this.$router.push(`/coach/students/${studentId}`)
    },
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
