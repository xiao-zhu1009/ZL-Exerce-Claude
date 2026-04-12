<template>
  <div>
    <h2 style="margin-bottom:20px">课程预约</h2>
    <el-row :gutter="16" v-loading="loading">
      <el-col :span="8" v-for="course in list" :key="course.id" style="margin-bottom:16px">
        <el-card>
          <div slot="header" style="font-weight:bold">{{ course.title }}</div>
          <div style="line-height:2;color:#666;font-size:14px">
            <div>教练：{{ course.coach_name }}</div>
            <div>类型：{{ course.category }}</div>
            <div>时间：{{ course.start_time }}</div>
            <div>价格：<b style="color:#F56C6C">¥{{ course.price }}</b></div>
            <div>
              名额：
              <el-tag :type="course.enrolled >= course.max_people ? 'danger' : 'success'" size="small">
                {{ course.enrolled }}/{{ course.max_people }}
              </el-tag>
            </div>
          </div>
          <div style="margin-top:12px">
            <el-button
              type="primary"
              size="small"
              :disabled="course.enrolled >= course.max_people"
              @click="reserve(course)"
            >
              {{ course.enrolled >= course.max_people ? '已满员' : '立即预约' }}
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-empty v-if="!loading && list.length === 0" description="暂无课程" />
  </div>
</template>

<script>
import { getCourses, reserveCourse } from '@/api/course'

export default {
  name: 'Course',
  data() { return { loading: false, list: [] } },
  created() { this.fetchList() },
  methods: {
    async fetchList() {
      this.loading = true
      try {
        // TODO: 对接后端 GET /courses
        const res = await getCourses()
        this.list = res.data.list
      } finally { this.loading = false }
    },
    async reserve(course) {
      // TODO: 对接后端 POST /reservations { course_id }
      await reserveCourse(course.id)
      course.enrolled++
      this.$message.success('预约成功')
    }
  }
}
</script>
