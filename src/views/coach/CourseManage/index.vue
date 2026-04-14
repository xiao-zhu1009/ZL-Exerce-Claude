<template>
  <div>
    <!-- Tab 切换：课程列表 / 预约审批 -->
    <el-tabs v-model="activeTab">
      <el-tab-pane label="我的课程" name="courses">
        <el-button type="primary" icon="el-icon-plus" @click="openDialog()" style="margin-bottom:16px">发布课程</el-button>
        <el-table :data="list" v-loading="loading" border fit>
          <el-table-column prop="title" label="课程名称" min-width="150" show-overflow-tooltip />
          <el-table-column prop="category" label="类型" min-width="70" />
          <el-table-column prop="start_time" label="开始时间" min-width="150" />
          <el-table-column label="价格" min-width="70">
            <template slot-scope="scope">{{ scope.row.price === '0.00' ? '免费' : '¥' + scope.row.price }}</template>
          </el-table-column>
          <el-table-column label="名额" min-width="70">
            <template slot-scope="scope">{{ scope.row.enrolled }}/{{ scope.row.max_people }}</template>
          </el-table-column>
          <el-table-column label="状态" min-width="80">
            <template slot-scope="scope">
              <el-tag :type="statusType(scope.row.status)" size="small">{{ statusLabel(scope.row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" min-width="180">
            <template slot-scope="scope">
              <!-- 已驳回：可修改 -->
              <el-button v-if="scope.row.status === 4" size="mini" type="warning" @click="openDialog(scope.row)">修改</el-button>
              <!-- 待审核/已驳回：可删除 -->
              <el-button v-if="scope.row.status === 0 || scope.row.status === 4" size="mini" type="danger" @click="remove(scope.row)">删除</el-button>
              <!-- 招募中/满员：查看预约 -->
              <el-badge :value="scope.row.pending_count" :hidden="!scope.row.pending_count" style="margin-left:4px">
                <el-button v-if="scope.row.status === 1 || scope.row.status === 2" size="mini" @click="viewReservations(scope.row)">预约列表</el-button>
              </el-badge>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-if="!loading && list.length === 0" description="暂无课程" />
      </el-tab-pane>

      <el-tab-pane label="预约审批" name="reservations">
        <div v-if="!currentCourse" style="color:#999;padding:20px">请在「我的课程」中点击「预约列表」查看</div>
        <template v-else>
          <div style="margin-bottom:12px">
            <el-tag>{{ currentCourse.title }}</el-tag>
            <el-button size="mini" style="margin-left:8px" @click="currentCourse = null">返回</el-button>
          </div>
          <el-table :data="reservations" v-loading="resLoading" border fit>
            <el-table-column prop="user_name" label="学员" min-width="90" />
            <el-table-column prop="created_at" label="申请时间" min-width="150" />
            <el-table-column label="状态" min-width="80">
              <template slot-scope="scope">
                <el-tag :type="reserveStatusType(scope.row.status)" size="small">{{ reserveStatusLabel(scope.row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="cancel_reason" label="拒绝原因" min-width="120" show-overflow-tooltip />
            <el-table-column label="操作" min-width="130">
              <template slot-scope="scope">
                <template v-if="scope.row.status === 1">
                  <el-button size="mini" type="success" @click="approve(scope.row, 2)">确认</el-button>
                  <el-button size="mini" type="danger" @click="openReject(scope.row)">拒绝</el-button>
                </template>
              </template>
            </el-table-column>
          </el-table>
        </template>
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

const BASE = process.env.VUE_APP_API_BASE || 'http://127.0.0.1:8009/api'
const emptyForm = () => ({ id: null, title: '', category: '', difficulty: 1, cover_img: '', start_time: '', end_time: '', location: '', max_people: 10, price: 0, description: '' })

export default {
  name: 'CourseManage',
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
      operating: false
    }
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
