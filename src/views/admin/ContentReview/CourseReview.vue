<template>
  <div>
    <h2 style="margin-bottom:20px">课程审核</h2>

    <!-- 状态筛选 -->
    <el-card style="margin-bottom:16px">
      <el-radio-group v-model="filterStatus" @change="fetchList">
        <el-radio-button :label="null">全部</el-radio-button>
        <el-radio-button :label="0">待审核</el-radio-button>
        <el-radio-button :label="1">招募中</el-radio-button>
        <el-radio-button :label="2">满员</el-radio-button>
        <el-radio-button :label="4">已驳回</el-radio-button>
        <el-radio-button :label="5">已下架</el-radio-button>
      </el-radio-group>
    </el-card>

    <el-table :data="list" v-loading="loading" border fit>
      <el-table-column prop="title" label="课程名称" min-width="160" show-overflow-tooltip />
      <el-table-column prop="category" label="类型" min-width="70" />
      <el-table-column prop="coach_name" label="教练" min-width="90" />
      <el-table-column prop="start_time" label="开始时间" min-width="150" />
      <el-table-column label="名额" min-width="70">
        <template slot-scope="scope">{{ scope.row.enrolled }}/{{ scope.row.max_people }}</template>
      </el-table-column>
      <el-table-column label="状态" min-width="80">
        <template slot-scope="scope">
          <el-tag :type="statusType(scope.row.status)" size="small">{{ statusLabel(scope.row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="200">
        <template slot-scope="scope">
          <el-button size="mini" @click="preview(scope.row)">预览</el-button>
          <el-button v-if="scope.row.status === 0" size="mini" type="success" @click="approve(scope.row)">通过</el-button>
          <el-button v-if="scope.row.status === 0" size="mini" type="danger" @click="openReject(scope.row)">驳回</el-button>
          <el-button v-if="scope.row.status === 1 || scope.row.status === 2" size="mini" type="warning" @click="offline(scope.row)">下架</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div style="text-align:center;margin-top:16px" v-if="total > pageSize">
      <el-pagination background layout="prev, pager, next" :total="total" :page-size="pageSize" :current-page="page" @current-change="onPageChange" />
    </div>

    <!-- 驳回弹窗 -->
    <el-dialog title="驳回原因" :visible.sync="rejectVisible" width="400px">
      <el-input v-model="rejectReason" type="textarea" :rows="4" placeholder="请填写驳回原因（将通知教练）" />
      <div slot="footer">
        <el-button @click="rejectVisible = false">取消</el-button>
        <el-button type="danger" :loading="operating" @click="confirmReject">确认驳回</el-button>
      </div>
    </el-dialog>

    <!-- 课程预览弹窗 -->
    <el-dialog :title="previewData.title || '课程详情'" :visible.sync="previewVisible" width="600px">
      <div v-loading="previewLoading">
        <img v-if="previewData.cover_img" :src="imgUrl(previewData.cover_img)" style="width:100%;max-height:200px;object-fit:cover;border-radius:4px;margin-bottom:12px" />
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="类型">{{ previewData.category }}</el-descriptions-item>
          <el-descriptions-item label="难度">{{ ['', '初级', '中级', '高级'][previewData.difficulty] }}</el-descriptions-item>
          <el-descriptions-item label="教练">{{ previewData.coach_name }}</el-descriptions-item>
          <el-descriptions-item label="价格">{{ previewData.price === '0.00' ? '免费' : '¥' + previewData.price }}</el-descriptions-item>
          <el-descriptions-item label="开始时间">{{ previewData.start_time }}</el-descriptions-item>
          <el-descriptions-item label="结束时间">{{ previewData.end_time || '未设置' }}</el-descriptions-item>
          <el-descriptions-item label="地点" :span="2">{{ previewData.location || '未设置' }}</el-descriptions-item>
          <el-descriptions-item label="名额">{{ previewData.enrolled }}/{{ previewData.max_people }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ statusLabel(previewData.status) }}</el-descriptions-item>
          <el-descriptions-item v-if="previewData.reject_reason" label="驳回原因" :span="2">{{ previewData.reject_reason }}</el-descriptions-item>
          <el-descriptions-item v-if="previewData.description" label="课程描述" :span="2">{{ previewData.description }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getAdminCourses, getAdminCourseDetail, reviewCourse, offlineCourse } from '@/api/course'

const BASE = process.env.VUE_APP_API_BASE || 'http://127.0.0.1:8009/api'

export default {
  name: 'CourseReview',
  data() {
    return {
      loading: false,
      list: [],
      total: 0,
      page: 1,
      pageSize: 20,
      filterStatus: null,
      rejectVisible: false,
      rejectReason: '',
      currentId: null,
      operating: false,
      previewVisible: false,
      previewLoading: false,
      previewData: {}
    }
  },
  created() { this.fetchList() },
  methods: {
    async fetchList() {
      this.loading = true
      try {
        const params = { page: this.page, page_size: this.pageSize }
        if (this.filterStatus !== null) params.status = this.filterStatus
        const res = await getAdminCourses(params)
        this.list = res.data.list
        this.total = res.data.total
      } finally { this.loading = false }
    },

    onPageChange(p) { this.page = p; this.fetchList() },

    async approve(row) {
      await this.$confirm(`确认通过课程《${row.title}》？`, '提示', { type: 'success' })
      const res = await reviewCourse(row.id, { status: 1 })
      if (res.code === 200) { this.$message.success('已通过'); this.fetchList() }
      else this.$message.error(res.message || '操作失败')
    },

    openReject(row) { this.currentId = row.id; this.rejectReason = ''; this.rejectVisible = true },

    async confirmReject() {
      if (!this.rejectReason.trim()) return this.$message.warning('请填写驳回原因')
      this.operating = true
      try {
        const res = await reviewCourse(this.currentId, { status: 4, reject_reason: this.rejectReason })
        if (res.code === 200) {
          this.$message.success('已驳回')
          this.rejectVisible = false
          this.fetchList()
        } else {
          this.$message.error(res.message || '操作失败')
        }
      } finally { this.operating = false }
    },

    async offline(row) {
      await this.$confirm(`确认下架课程《${row.title}》？`, '提示', { type: 'warning' })
      const res = await offlineCourse(row.id)
      if (res.code === 200) { this.$message.success('已下架'); this.fetchList() }
      else this.$message.error(res.message || '操作失败')
    },

    async preview(row) {
      this.previewData = {}
      this.previewVisible = true
      this.previewLoading = true
      try {
        const res = await getAdminCourseDetail(row.id)
        if (res.code === 200) this.previewData = res.data
      } finally { this.previewLoading = false }
    },

    imgUrl(path) { return `${BASE}/static/${path}` },
    statusLabel(s) { return ['待审核', '招募中', '满员', '已结束', '已驳回', '已下架'][s] ?? '未知' },
    statusType(s) { return ['warning', 'success', 'primary', 'info', 'danger', 'info'][s] ?? '' }
  }
}
</script>
