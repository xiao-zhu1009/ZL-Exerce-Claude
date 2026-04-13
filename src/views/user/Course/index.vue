<template>
  <div>
    <h2 style="margin-bottom:20px">课程预约</h2>

    <!-- 筛选栏 -->
    <el-card style="margin-bottom:16px">
      <el-row :gutter="12" align="middle" type="flex">
        <el-col :span="5">
          <el-select v-model="filters.category" placeholder="课程分类" clearable @change="fetchList">
            <el-option v-for="c in categories" :key="c" :label="c" :value="c" />
          </el-select>
        </el-col>
        <el-col :span="9">
          <el-input v-model="filters.keyword" placeholder="搜索课程名称" clearable @clear="fetchList">
            <el-button slot="append" icon="el-icon-search" @click="fetchList" />
          </el-input>
        </el-col>
        <el-col :span="5">
          <el-badge :value="reservationCount" :hidden="reservationCount === 0">
            <el-button type="primary" plain @click="showMyReservations = !showMyReservations">
              {{ showMyReservations ? '返回课程列表' : '我的预约' }}
            </el-button>
          </el-badge>
        </el-col>
      </el-row>
    </el-card>

    <!-- 我的预约 -->
    <template v-if="showMyReservations">
      <el-table :data="myReservations" v-loading="myLoading" border fit>
        <el-table-column prop="course_title" label="课程名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="coach_name" label="教练" min-width="80" />
        <el-table-column prop="start_time" label="开始时间" min-width="150" />
        <el-table-column prop="location" label="地点" min-width="120" show-overflow-tooltip />
        <el-table-column label="状态" min-width="80">
          <template slot-scope="scope">
            <el-tag :type="reserveStatusType(scope.row.status)" size="small">{{ reserveStatusLabel(scope.row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="80">
          <template slot-scope="scope">
            <el-button
              v-if="scope.row.status === 1 || scope.row.status === 2"
              size="mini" type="danger"
              @click="cancelReserve(scope.row)"
            >取消</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="!myLoading && myReservations.length === 0" description="暂无预约记录" />
    </template>

    <!-- 课程列表 -->
    <template v-else>
      <el-row :gutter="16" v-loading="loading">
        <el-col :span="8" v-for="course in list" :key="course.id" style="margin-bottom:16px">
          <el-card class="course-card">
            <div class="cover">
              <img v-if="course.cover_img" :src="imgUrl(course.cover_img)" class="cover-img" />
              <span v-else class="cover-placeholder">{{ course.category }}</span>
            </div>
            <div style="padding:12px">
              <div style="font-weight:bold;font-size:15px;margin-bottom:8px">{{ course.title }}</div>
              <div style="color:#666;font-size:13px;line-height:1.8">
                <div>教练：{{ course.coach_name }}</div>
                <div>类型：{{ course.category }} · {{ difficultyLabel(course.difficulty) }}</div>
                <div>时间：{{ course.start_time }}</div>
                <div>地点：{{ course.location || '待定' }}</div>
                <div>价格：<b style="color:#F56C6C">{{ course.price === '0.00' ? '免费' : '¥' + course.price }}</b></div>
                <div>
                  名额：
                  <el-tag :type="course.enrolled >= course.max_people ? 'danger' : 'success'" size="small">
                    {{ course.enrolled }}/{{ course.max_people }}
                  </el-tag>
                </div>
              </div>
              <div style="margin-top:12px">
                <el-button
                  v-if="reservedSet.has(course.id)"
                  size="small" type="info" disabled
                >已预约</el-button>
                <el-button
                  v-else
                  type="primary" size="small"
                  :disabled="course.enrolled >= course.max_people"
                  @click="reserve(course)"
                >{{ course.enrolled >= course.max_people ? '已满员' : '立即预约' }}</el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      <el-empty v-if="!loading && list.length === 0" description="暂无课程" />
      <div style="text-align:center;margin-top:16px" v-if="total > filters.page_size">
        <el-pagination background layout="prev, pager, next" :total="total" :page-size="filters.page_size" :current-page="filters.page" @current-change="onPageChange" />
      </div>
    </template>
  </div>
</template>

<script>
import { getCourses, reserveCourse, getMyReservations, cancelReservation } from '@/api/course'

const BASE = process.env.VUE_APP_API_BASE || 'http://127.0.0.1:8009/api'

export default {
  name: 'Course',
  data() {
    return {
      loading: false,
      list: [],
      total: 0,
      filters: { category: '', keyword: '', page: 1, page_size: 12 },
      categories: ['有氧', '力量', '瑜伽', '综合'],
      showMyReservations: false,
      myLoading: false,
      myReservations: [],
      reservedSet: new Set()  // 当前有效预约的 course_id 集合（待审批+已确认）
    }
  },
  created() {
    this.fetchList()
    this.fetchMyReservations()  // 初始化时同步预约状态和红点
  },
  watch: {
    showMyReservations(val) { if (val) this.fetchMyReservations() }  // 切换到我的预约时刷新
  },
  computed: {
    reservationCount() { return this.$store.state.reservationCount }
  },
  methods: {
    async fetchList() {
      this.loading = true
      try {
        const params = { page: this.filters.page, page_size: this.filters.page_size }
        if (this.filters.category) params.category = this.filters.category
        if (this.filters.keyword) params.keyword = this.filters.keyword
        const res = await getCourses(params)
        this.list = res.data.list
        this.total = res.data.total
      } finally { this.loading = false }
    },
    async fetchMyReservations() {
      this.myLoading = true
      try {
        const res = await getMyReservations()
        this.myReservations = res.data
        // 待审批(1)+已确认(2) 的课程 id 集合，用于卡片"已预约"判断
        this.reservedSet = new Set(
          res.data.filter(r => r.status === 1 || r.status === 2).map(r => r.course_id)
        )
        // 同步红点数量到 store
        this.$store.commit('SET_RESERVATION_COUNT', this.reservedSet.size)
      } finally { this.myLoading = false }
    },
    async reserve(course) {
      await this.$confirm(`确认预约课程《${course.title}》？`, '提示', { type: 'info' })
      const res = await reserveCourse(course.id)
      if (res.code === 200) {
        this.$message.success('申请成功，等待教练确认')
        course.enrolled++
        // 更新已预约集合和红点
        this.reservedSet = new Set([...this.reservedSet, course.id])
        this.$store.commit('SET_RESERVATION_COUNT', this.reservedSet.size)
      } else {
        this.$message.error(res.message || '预约失败')
      }
    },
    async cancelReserve(row) {
      await this.$confirm('确认取消该预约？', '提示', { type: 'warning' })
      const res = await cancelReservation(row.reservation_id)
      if (res.code === 200) {
        this.$message.success('已取消')
        await this.fetchMyReservations()  // 重新拉取，同步 reservedSet 和红点
      } else {
        this.$message.error(res.message || '取消失败')
      }
    },
    onPageChange(p) { this.filters.page = p; this.fetchList() },
    imgUrl(path) { return `${BASE}/static/${path}` },
    difficultyLabel(d) { return ['', '初级', '中级', '高级'][d] || '' },
    reserveStatusLabel(s) { return ['已取消', '待审批', '已确认', '已拒绝'][s] ?? '未知' },
    reserveStatusType(s) { return ['info', 'warning', 'success', 'danger'][s] ?? '' }
  }
}
</script>

<style scoped>
.course-card { transition: box-shadow .2s; }
.course-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.12); }
.cover { height: 120px; background: #f0f2f5; display: flex; align-items: center; justify-content: center; border-radius: 4px; overflow: hidden; }
.cover-img { width: 100%; height: 100%; object-fit: cover; }
.cover-placeholder { font-size: 16px; color: #999; }
</style>
