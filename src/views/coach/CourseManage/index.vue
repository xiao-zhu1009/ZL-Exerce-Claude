<template>
  <div>
    <el-tabs v-model="activeTab">
      <el-tab-pane label="我的课程" name="courses">
        <my-courses-tab
          :list="list"
          :loading="loading"
          :status-label="statusLabel"
          :status-type="statusType"
          @open-dialog="openDialog"
          @remove-course="remove"
          @view-reservations="viewReservations"
        />
      </el-tab-pane>

      <el-tab-pane label="预约审批" name="reservations">
        <reservation-approval-tab
          :current-course="currentCourse"
          :reservations="reservations"
          :loading="resLoading"
          :reserve-status-label="reserveStatusLabel"
          :reserve-status-type="reserveStatusType"
          @approve="approve"
          @open-reject="openReject"
        />
      </el-tab-pane>
    </el-tabs>

    <!-- 发布/修改课程弹窗 -->
    <el-dialog :title="form.id ? '修改课程（重新提交审核）' : '发布课程'" :visible.sync="dialogVisible" width="560px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="课程名称"><el-input v-model="form.title" /></el-form-item>
        <el-form-item label="类型">
          <el-select v-model="form.category" style="width:100%">
            <el-option v-for="c in categories" :key="c" :label="c" :value="c" />
          </el-select>
        </el-form-item>
        <el-form-item label="难度">
          <el-radio-group v-model="form.difficulty">
            <el-radio :label="1">初级</el-radio>
            <el-radio :label="2">中级</el-radio>
            <el-radio :label="3">高级</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="封面图">
          <el-upload action="#" :show-file-list="false" :before-upload="beforeCoverUpload" :http-request="uploadCover" accept="image/jpeg,image/png,image/webp">
            <img v-if="form.cover_img" :src="imgUrl(form.cover_img)" class="cover-preview" />
            <el-button v-else size="small" :loading="coverUploading">{{ coverUploading ? '上传中...' : '点击上传封面' }}</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="开始时间">
          <el-date-picker v-model="form.start_time" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" style="width:100%" />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker v-model="form.end_time" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" style="width:100%" />
        </el-form-item>
        <el-form-item label="上课地点"><el-input v-model="form.location" /></el-form-item>
        <el-form-item label="最大人数"><el-input v-model.number="form.max_people" type="number" /></el-form-item>
        <el-form-item label="价格(¥)"><el-input v-model.number="form.price" type="number" /></el-form-item>
        <el-form-item label="课程描述"><el-input v-model="form.description" type="textarea" :rows="3" /></el-form-item>
        <!-- 驳回原因提示 -->
        <el-alert v-if="form.id && rejectTip" :title="`驳回原因：${rejectTip}`" type="error" show-icon :closable="false" style="margin-bottom:8px" />
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">{{ form.id ? '重新提交审核' : '提交审核' }}</el-button>
      </div>
    </el-dialog>

    <!-- 拒绝预约弹窗 -->
    <el-dialog title="拒绝原因" :visible.sync="rejectVisible" width="400px">
      <el-input v-model="rejectReason" type="textarea" :rows="3" placeholder="请填写拒绝原因（选填）" />
      <div slot="footer">
        <el-button @click="rejectVisible = false">取消</el-button>
        <el-button type="danger" :loading="operating" @click="confirmReject">确认拒绝</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getMyCourses, publishCourse, updateCourse, deleteCourse,
  uploadCourseCover, getCourseReservations, approveReservation
} from '@/api/course'
import MyCoursesTab from './MyCoursesTab.vue'
import ReservationApprovalTab from './ReservationApprovalTab.vue'

const BASE = process.env.VUE_APP_API_BASE || 'http://127.0.0.1:8009/api'
const emptyForm = () => ({ id: null, title: '', category: '', difficulty: 1, cover_img: '', start_time: '', end_time: '', location: '', max_people: 10, price: 0, description: '' })

export default {
  name: 'CourseManage',
  components: {
    MyCoursesTab,
    ReservationApprovalTab,
  },
  data() {
    return {
      activeTab: 'courses',
      loading: false,
      list: [],
      categories: ['有氧', '力量', '瑜伽', '综合'],
      // 发布/修改弹窗
      dialogVisible: false,
      form: emptyForm(),
      rejectTip: '',
      coverUploading: false,
      submitting: false,
      // 预约审批
      currentCourse: null,
      reservations: [],
      resLoading: false,
      rejectVisible: false,
      rejectReason: '',
      currentReservation: null,
      operating: false,
      // 标记是否由“我的课程-预约列表”按钮进入审批页
      enterReservationsByCourseClick: false
    }
  },
  watch: {
    activeTab(val) {
      if (val !== 'reservations') {
        return
      }
      if (!this.enterReservationsByCourseClick) {
        // 直接点击 Tab 进入时，不展示课程预约数据
        this.currentCourse = null
        this.reservations = []
      }
      this.enterReservationsByCourseClick = false
    },
  },
  created() { this.fetchList() },
  methods: {
    async fetchList() {
      this.loading = true
      try {
        const res = await getMyCourses()
        this.list = res.data
      } finally { this.loading = false }
    },

    openDialog(row = null) {
      if (row) {
        this.form = { ...row, id: row.id }
        this.rejectTip = row.reject_reason || ''
      } else {
        this.form = emptyForm()
        this.rejectTip = ''
      }
      this.dialogVisible = true
    },

    beforeCoverUpload(file) {
      const ok = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
      if (!ok) this.$message.error('请上传 JPG、PNG 或 WebP 格式')
      return ok
    },

    async uploadCover({ file }) {
      this.coverUploading = true
      try {
        const res = await uploadCourseCover(file)
        if (res.code === 200) { this.form.cover_img = res.data.path; this.$message.success('上传成功') }
        else this.$message.error(res.message || '上传失败')
      } finally { this.coverUploading = false }
    },

    async submitForm() {
      if (!this.form.title) return this.$message.warning('请填写课程名称')
      if (!this.form.category) return this.$message.warning('请选择课程类型')
      if (!this.form.start_time) return this.$message.warning('请选择开始时间')
      this.submitting = true
      try {
        const payload = { ...this.form }
        delete payload.id
        if (!payload.end_time) delete payload.end_time

        let res
        if (this.form.id) {
          res = await updateCourse(this.form.id, payload)
        } else {
          res = await publishCourse(payload)
        }
        if (res.code === 200) {
          this.$message.success(this.form.id ? '已重新提交审核' : '提交成功，等待审核')
          this.dialogVisible = false
          this.fetchList()
        } else {
          this.$message.error(res.message || '提交失败')
        }
      } finally { this.submitting = false }
    },

    async remove(row) {
      await this.$confirm('确认删除该课程？', '提示', { type: 'warning' })
      const res = await deleteCourse(row.id)
      if (res.code === 200) { this.$message.success('已删除'); this.fetchList() }
      else this.$message.error(res.message || '删除失败')
    },

    async viewReservations(course) {
      this.enterReservationsByCourseClick = true
      this.currentCourse = course
      this.activeTab = 'reservations'
      this.resLoading = true
      try {
        const res = await getCourseReservations(course.id)
        this.reservations = res.data
      } finally { this.resLoading = false }
    },

    async approve(row, status) {
      const res = await approveReservation(row.reservation_id, { status })
      if (res.code === 200) {
        this.$message.success('已确认')
        row.status = status
        this.fetchList() // 刷新 enrolled 数量
      } else {
        this.$message.error(res.message || '操作失败')
      }
    },

    openReject(row) { this.currentReservation = row; this.rejectReason = ''; this.rejectVisible = true },

    async confirmReject() {
      this.operating = true
      try {
        const res = await approveReservation(this.currentReservation.reservation_id, { status: 3, cancel_reason: this.rejectReason })
        if (res.code === 200) {
          this.$message.success('已拒绝')
          this.currentReservation.status = 3
          this.currentReservation.cancel_reason = this.rejectReason
          this.rejectVisible = false
        } else {
          this.$message.error(res.message || '操作失败')
        }
      } finally { this.operating = false }
    },

    imgUrl(path) { return `${BASE}/static/${path}` },
    statusLabel(s) { return ['待审核', '招募中', '满员', '已结束', '已驳回', '已下架'][s] ?? '未知' },
    statusType(s) { return ['warning', 'success', 'primary', 'info', 'danger', 'info'][s] ?? '' },
    reserveStatusLabel(s) { return ['已取消', '待审批', '已确认', '已拒绝'][s] ?? '未知' },
    reserveStatusType(s) { return ['info', 'warning', 'success', 'danger'][s] ?? '' }
  }
}
</script>

<style scoped>
.cover-preview { width: 120px; height: 80px; object-fit: cover; border-radius: 4px; display: block; }
</style>
