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
      <el-button type="primary" size="small" icon="el-icon-plus" @click="openCreate">
        记录训练
      </el-button>
    </div>

    <!-- 记录列表 -->
    <el-table :data="records" v-loading="loading" stripe style="width:100%;margin-top:12px" row-key="id">
      <el-table-column type="expand">
        <template slot-scope="{ row }">
          <div v-if="hasDetail(row)" class="exercise-expand">
            <div class="exercise-title">动作明细</div>
            <el-table :data="row.extra.exercises" size="mini" border>
              <el-table-column prop="name" label="动作名称" min-width="120" />
              <el-table-column label="组数×次数" width="100">
                <template slot-scope="{ row: ex }">{{ ex.sets }}组×{{ ex.reps }}次</template>
              </el-table-column>
              <el-table-column label="重量" width="90">
                <template slot-scope="{ row: ex }">
                  <span v-if="ex.weight">{{ ex.weight }}{{ ex.unit || 'kg' }}</span>
                  <span v-else>—</span>
                </template>
              </el-table-column>
              <el-table-column prop="note" label="备注" show-overflow-tooltip />
            </el-table>
          </div>
          <div v-else class="exercise-expand no-detail">
            <span v-if="row.note">{{ row.note }}</span>
            <span v-else style="color:#999">无详细记录</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="record_date" label="日期" width="120" />
      <el-table-column prop="workout_type" label="类型" width="100">
        <template slot-scope="{ row }">
          <el-tag size="small" :type="typeColor(row.workout_type)">{{ row.workout_type }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="duration" label="时长(分钟)" width="110" />
      <el-table-column prop="calories" label="消耗卡路里" width="110" />
      <el-table-column label="记录方式" width="100">
        <template slot-scope="{ row }">
          <el-tag v-if="hasDetail(row)" size="mini" type="primary">详细</el-tag>
          <el-tag v-else size="mini" type="info">简单</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="note" label="备注" show-overflow-tooltip />
      <el-table-column label="操作" width="110">
        <template slot-scope="{ row }">
          <el-button type="primary" size="mini" icon="el-icon-edit" circle @click="openEdit(row)" />
          <el-button type="danger" size="mini" icon="el-icon-delete" circle @click="handleDelete(row.id)" />
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      :title="editId ? '修改训练记录' : '记录训练'"
      :visible.sync="dialogVisible"
      width="560px"
      @close="resetForm"
    >
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

        <!-- 记录模式切换 -->
        <el-form-item label="记录模式">
          <el-radio-group v-model="recordMode">
            <el-radio label="simple">简单记录</el-radio>
            <el-radio label="detail">详细记录（按动作）</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 详细模式：动作列表 -->
        <template v-if="recordMode === 'detail'">
          <el-divider content-position="left">动作明细</el-divider>
          <div v-for="(ex, idx) in exercises" :key="idx" class="exercise-row">
            <div class="exercise-row-header">
              <span class="exercise-index">动作 {{ idx + 1 }}</span>
              <el-button type="text" icon="el-icon-delete" style="color:#f56c6c" @click="removeExercise(idx)" />
            </div>
            <el-row :gutter="8">
              <el-col :span="14">
                <!-- 动作名称：支持从动作库搜索 -->
                <el-autocomplete
                  v-model="ex.name"
                  :fetch-suggestions="(q, cb) => queryActions(q, cb)"
                  placeholder="动作名称，可搜索动作库"
                  size="small"
                  style="width:100%"
                  value-key="title"
                  @select="(item) => ex.name = item.title"
                >
                  <template slot-scope="{ item }">
                    <span>{{ item.title }}</span>
                    <span class="action-tag">{{ item.body_part }} · {{ item.category }}</span>
                  </template>
                </el-autocomplete>
              </el-col>
              <el-col :span="5">
                <el-input-number v-model="ex.sets" :min="1" :max="99" size="small" placeholder="组数" style="width:100%" />
              </el-col>
              <el-col :span="5">
                <el-input-number v-model="ex.reps" :min="1" :max="999" size="small" placeholder="次数" style="width:100%" />
              </el-col>
            </el-row>
            <el-row :gutter="8" style="margin-top:6px">
              <el-col :span="8">
                <el-input-number v-model="ex.weight" :min="0" :max="9999" :precision="1" size="small" placeholder="重量(可选)" style="width:100%" />
              </el-col>
              <el-col :span="5">
                <el-select v-model="ex.unit" size="small" style="width:100%">
                  <el-option label="kg" value="kg" />
                  <el-option label="lb" value="lb" />
                  <el-option label="次" value="次" />
                </el-select>
              </el-col>
              <el-col :span="11">
                <el-input v-model="ex.note" size="small" placeholder="备注（可选）" />
              </el-col>
            </el-row>
          </div>
          <el-button type="dashed" icon="el-icon-plus" size="small" style="width:100%;margin-top:8px" @click="addExercise">
            添加动作
          </el-button>
        </template>
      </el-form>
      <span slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getWorkoutRecords, addWorkoutRecord, updateWorkoutRecord, deleteWorkoutRecord } from '@/api/training'
import { getActions } from '@/api/action'

const TYPE_COLOR = { 力量: 'danger', 有氧: 'success', 瑜伽: 'warning', 球类: '', 其他: 'info' }
const newExercise = () => ({ name: '', sets: 3, reps: 12, weight: null, unit: 'kg', note: '' })

export default {
  name: 'WorkoutLog',
  data() {
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
      editId: null,           // null=新增，有值=编辑中的记录 id
      typeOptions: ['力量', '有氧', '瑜伽', '球类', '其他'],
      recordMode: 'simple',
      exercises: [newExercise()],
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

    openCreate() {
      this.editId = null
      this.dialogVisible = true
    },

    openEdit(row) {
      this.editId = row.id
      // 回填基础字段
      this.form = {
        record_date:  row.record_date,
        workout_type: row.workout_type,
        duration:     row.duration,
        calories:     row.calories,
        note:         row.note || '',
      }
      // 回填模式和动作列表
      if (this.hasDetail(row)) {
        this.recordMode = 'detail'
        this.exercises = row.extra.exercises.map(e => ({ ...e }))
      } else {
        this.recordMode = 'simple'
        this.exercises = [newExercise()]
      }
      this.dialogVisible = true
    },

    resetForm() {
      this.$refs.form && this.$refs.form.resetFields()
      this.editId = null
      this.recordMode = 'simple'
      this.exercises = [newExercise()]
    },

    addExercise() {
      this.exercises.push(newExercise())
    },

    removeExercise(idx) {
      this.exercises.splice(idx, 1)
      if (this.exercises.length === 0) this.exercises.push(newExercise())
    },

    // 动作库搜索：输入关键词后调接口，返回 autocomplete 建议列表
    async queryActions(keyword, callback) {
      if (!keyword || keyword.length < 1) {
        callback([])
        return
      }
      try {
        const res = await getActions({ keyword, page_size: 8 })
        callback((res.data && res.data.list) || [])
      } catch {
        callback([])
      }
    },

    async handleSubmit() {
      await this.$refs.form.validate()

      if (this.recordMode === 'detail') {
        const valid = this.exercises.some(e => e.name.trim())
        if (!valid) {
          this.$message.warning('请至少填写一个动作名称')
          return
        }
      }

      this.submitting = true
      try {
        const payload = { ...this.form }
        if (this.recordMode === 'detail') {
          const exercises = this.exercises
            .filter(e => e.name.trim())
            .map(e => ({ ...e, weight: e.weight || null }))
          payload.extra = { mode: 'detail', exercises }
        } else {
          payload.extra = null
        }

        if (this.editId) {
          await updateWorkoutRecord(this.editId, payload)
          this.$message.success('修改成功')
        } else {
          await addWorkoutRecord(payload)
          this.$message.success('记录成功')
        }
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
    },

    hasDetail(row) {
      return row.extra && row.extra.mode === 'detail' && Array.isArray(row.extra.exercises) && row.extra.exercises.length > 0
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
.exercise-expand {
  padding: 8px 16px;
}
.exercise-expand.no-detail {
  color: #606266;
  font-size: 13px;
}
.exercise-title {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}
.exercise-row {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 10px 12px;
  margin-bottom: 10px;
  background: #fafafa;
}
.exercise-row-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.exercise-index {
  font-size: 13px;
  font-weight: 600;
  color: #409eff;
}
.action-tag {
  float: right;
  font-size: 11px;
  color: #909399;
  margin-top: 2px;
}
</style>
