<template>
  <div>
    <h2 style="margin-bottom:20px">课程管理</h2>
    <el-button type="primary" icon="el-icon-plus" @click="openDialog()" style="margin-bottom:16px">发布课程</el-button>

    <el-table :data="list" v-loading="loading" border>
      <el-table-column prop="title" label="课程名称" />
      <el-table-column prop="category" label="类型" width="80" />
      <el-table-column prop="start_time" label="开始时间" width="160" />
      <el-table-column prop="price" label="价格(¥)" width="90" />
      <el-table-column label="名额" width="100">
        <template slot-scope="scope">{{ scope.row.enrolled }}/{{ scope.row.max_people }}</template>
      </el-table-column>
      <el-table-column label="状态" width="80">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status ? 'success' : 'info'" size="small">{{ scope.row.status ? '上架' : '下架' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template slot-scope="scope">
          <el-button size="mini" @click="openDialog(scope.row)">编辑</el-button>
          <el-button size="mini" :type="scope.row.status ? 'warning' : 'success'" @click="toggleStatus(scope.row)">
            {{ scope.row.status ? '下架' : '上架' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="form.id ? '编辑课程' : '发布课程'" :visible.sync="dialogVisible" width="500px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="课程名称"><el-input v-model="form.title" /></el-form-item>
        <el-form-item label="类型">
          <el-select v-model="form.category" style="width:100%">
            <el-option label="瑜伽" value="瑜伽" /><el-option label="力量" value="力量" /><el-option label="有氧" value="有氧" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间"><el-date-picker v-model="form.start_time" type="datetime" value-format="yyyy-MM-dd HH:mm" style="width:100%" /></el-form-item>
        <el-form-item label="最大人数"><el-input v-model.number="form.max_people" type="number" /></el-form-item>
        <el-form-item label="价格(¥)"><el-input v-model.number="form.price" type="number" /></el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getMyCourses, publishCourse, updateCourse, toggleCourseStatus } from '@/api/course'

export default {
  name: 'CourseManage',
  data() {
    return {
      loading: false,
      list: [],
      dialogVisible: false,
      form: { id: null, title: '', category: '', start_time: '', max_people: 10, price: 0 }
    }
  },
  created() { this.fetchList() },
  methods: {
    async fetchList() {
      this.loading = true
      try {
        // TODO: 对接后端 GET /courses/mine
        const res = await getMyCourses()
        this.list = res.data
      } finally { this.loading = false }
    },
    openDialog(row = null) {
      this.form = row ? { ...row } : { id: null, title: '', category: '', start_time: '', max_people: 10, price: 0 }
      this.dialogVisible = true
    },
    async submitForm() {
      if (this.form.id) {
        // TODO: 对接后端 PUT /courses/:id
        await updateCourse(this.form.id, this.form)
        const idx = this.list.findIndex(c => c.id === this.form.id)
        this.$set(this.list, idx, { ...this.list[idx], ...this.form })
      } else {
        // TODO: 对接后端 POST /courses
        const res = await publishCourse(this.form)
        this.list.push(res.data)
      }
      this.dialogVisible = false
      this.$message.success('操作成功')
    },
    async toggleStatus(course) {
      // TODO: 对接后端 PUT /courses/:id/status
      await toggleCourseStatus(course.id, course.status ? 0 : 1)
      course.status = course.status ? 0 : 1
    }
  }
}
</script>
