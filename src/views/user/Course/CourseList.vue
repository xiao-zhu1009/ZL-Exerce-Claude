<template>
  <div>
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
      </el-row>
    </el-card>

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
  </div>
</template>

<script>
import { getCourses, reserveCourse, getMyReservations } from '@/api/course'

const BASE = process.env.VUE_APP_API_BASE || 'http://127.0.0.1:8009/api'

export default {
  name: 'CourseList',
  data() {
    return {
      loading: false,
      list: [],
      total: 0,
      filters: { category: '', keyword: '', page: 1, page_size: 12 },
      categories: ['有氧', '力量', '瑜伽', '综合'],
      reservedSet: new Set()
    }
  },
  created() {
    this.fetchList()
    this.fetchReservedSet()
  },
  methods: {
    async fetchList() {
      this.loading = true
      try {
        const params = { page: this.filters.page, page_size: this.filters.page_size }
        if (this.filters.category) params.category = this.filters.category
        if (this.filters.keyword) params.keyword = this.filters.keyword
        const res = await getCourses(params)
        this.list = (res.data && res.data.list) || []
        this.total = (res.data && res.data.total) || 0
      } finally {
        this.loading = false
      }
    },
    async fetchReservedSet() {
      const res = await getMyReservations()
      const rows = res.data || []
      this.reservedSet = new Set(
        rows.filter(r => r.status === 1 || r.status === 2).map(r => r.course_id)
      )
      this.$emit('reservations-changed', this.reservedSet.size)
    },
    async reserve(course) {
      await this.$confirm(`确认预约课程《${course.title}》？`, '提示', { type: 'info' })
      const res = await reserveCourse(course.id)
      if (res.code === 200) {
        this.$message.success('申请成功，等待教练确认')
        course.enrolled++
        this.reservedSet = new Set([...this.reservedSet, course.id])
        this.$emit('reservations-changed', this.reservedSet.size)
      } else {
        this.$message.error(res.message || '预约失败')
      }
    },
    onPageChange(p) { this.filters.page = p; this.fetchList() },
    imgUrl(path) { return `${BASE}/static/${path}` },
    difficultyLabel(d) { return ['', '初级', '中级', '高级'][d] || '' },
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
