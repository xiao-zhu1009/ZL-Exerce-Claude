<template>
  <div>
    <h2 style="margin-bottom:20px">学员管理</h2>
    <el-table :data="students" v-loading="loading" border>
      <el-table-column prop="nickname" label="学员昵称" />
      <el-table-column prop="goal" label="训练目标" />
      <el-table-column prop="weight" label="体重(kg)" />
      <el-table-column prop="bmi" label="BMI" />
      <el-table-column prop="body_fat" label="体脂率(%)" />
      <el-table-column prop="last_workout" label="最近训练" />
      <el-table-column label="操作" width="120">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="$router.push(`/coach/students/${scope.row.id}`)">查看详情</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { getStudents } from '../../../api/coach'

export default {
  name: 'Students',
  data() { return { loading: false, students: [] } },
  created() { this.fetchStudents() },
  methods: {
    async fetchStudents() {
      this.loading = true
      try {
        // TODO: 对接后端 GET /coach/students（仅返回该教练名下学员）
        const res = await getStudents()
        this.students = res.data
      } finally { this.loading = false }
    }
  }
}
</script>
