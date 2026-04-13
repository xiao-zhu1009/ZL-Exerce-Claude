<template>
  <div class="workout-log">
    <!-- 工具栏 -->
    <div class="toolbar">
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="yyyy-MM-dd"
        size="small"
        @change="fetchRecords"
      />
      <el-button type="primary" size="small" icon="el-icon-plus" @click="openDialog">
        记录训练
      </el-button>
    </div>

    <!-- 记录列表 -->
    <el-table :data="records" v-loading="loading" stripe style="width:100%;margin-top:12px">
      <el-table-column prop="record_date" label="日期" width="120" />
      <el-table-column prop="workout_type" label="类型" width="100">
        <template slot-scope="{ row }">
          <el-tag size="small" :type="typeColor(row.workout_type)">{{ row.workout_type }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="duration" label="时长(分钟)" width="110" />
      <el-table-column prop="calories" label="消耗卡路里" width="110" />
      <el-table-column prop="note" label="备注" show-overflow-tooltip />
      <el-table-column label="操作" width="80">
        <template slot-scope="{ row }">
          <el-button type="danger" size="mini" icon="el-icon-delete" circle @click="handleDelete(row.id)" />
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增弹窗 -->
    <el-dialog title="记录训练" :visible.sync="dialogVisible" width="420px" @close="resetForm">
      <el-form :model="form" :rules="rules" ref="form" label-width="90px">
        <el-form-item label="训练日期" prop="record_date">
          <el-date-picker v-model="form.record_date" type="date" value-format="yyyy-MM-dd"
            placeholder="选择日期" style="width:100%" />
        </el-form-item>
        <el-form-item label="训练类型" prop="workout_type">
          <el-select v-model="form.workout_type" placeholder="请选择" style="width:100%">
            <el-option v-for="t in typeOptions" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>
        <el-form-item label="时长(分钟)" prop="duration">
          <el-input-number v-model="form.duration" :min="1" :max="600" style="width:100%" />
        </el-form-item>
        <el-form-item label="消耗卡路里" prop="calories">
          <el-input-number v-model="form.calories" :min="0" :max="9999" style="width:100%" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.note" type="textarea" :rows="2" placeholder="可选" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getWorkoutRecords, addWorkoutRecord, deleteWorkoutRecord } from '@/api/training'

// 训练类型对应 Element tag 颜色
const TYPE_COLOR = { 力量: 'danger', 有氧: 'success', 瑜伽: 'warning', 球类: '', 其他: 'info' }

export default {
  name: 'WorkoutLog',
  data() {
    // 用本地时间避免 UTC 偏差导致日期错误（东八区凌晨会差一天）
    const localDate = (d) => {
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${y}-${m}-${day}`
    }
    const today = localDate(new Date())
    const monthAgo = localDate(new Date(Date.now() - 29 * 86400000))
    return {
      records: [],
      loading: false,
      dateRange: [monthAgo, today],
      dialogVisible: false,
      submitting: false,
      typeOptions: ['力量', '有氧', '瑜伽', '球类', '其他'],
      form: { record_date: today, workout_type: '', duration: 30, calories: 0, note: '' },
      rules: {
        record_date:  [{ required: true, message: '请选择日期', trigger: 'change' }],
        workout_type: [{ required: true, message: '请选择训练类型', trigger: 'change' }],
        duration:     [{ required: true, message: '请填写时长', trigger: 'blur' }],
      }
    }
  },
  created() {
    this.fetchRecords()
  },
  methods: {
    async fetchRecords() {
      this.loading = true
      try {
        const [start, end] = Array.isArray(this.dateRange) ? this.dateRange : []
        const res = await getWorkoutRecords({ start, end })
        this.records = res.data || []
      } finally {
        this.loading = false
      }
    },
    openDialog() {
      this.dialogVisible = true
    },
    resetForm() {
      this.$refs.form && this.$refs.form.resetFields()
    },
    async handleSubmit() {
      await this.$refs.form.validate()
      this.submitting = true
      try {
        await addWorkoutRecord(this.form)
        this.$message.success('记录成功')
        this.dialogVisible = false
        this.fetchRecords()
      } finally {
        this.submitting = false
      }
    },
    async handleDelete(id) {
      await this.$confirm('确认删除该训练记录？', '提示', { type: 'warning' })
      await deleteWorkoutRecord(id)
      this.$message.success('已删除')
      this.fetchRecords()
    },
    typeColor(type) {
      return TYPE_COLOR[type] || 'info'
    }
  }
}
</script>

<style scoped>
.toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
}
</style>
