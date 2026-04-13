<template>
  <div class="training-plan">
    <!-- 工具栏 -->
    <div class="toolbar">
      <el-radio-group v-model="statusFilter" size="small" @change="fetchPlans">
        <el-radio-button :label="null">全部</el-radio-button>
        <el-radio-button :label="1">进行中</el-radio-button>
        <el-radio-button :label="2">已完成</el-radio-button>
        <el-radio-button :label="0">已终止</el-radio-button>
      </el-radio-group>
      <el-button type="primary" size="small" icon="el-icon-plus" @click="openDialog">
        新建计划
      </el-button>
    </div>

    <div v-loading="loading">
      <el-empty v-if="!loading && plans.length === 0" description="暂无训练计划" />

      <div class="plan-list">
        <el-card v-for="plan in plans" :key="plan.id" class="plan-card" shadow="hover">
          <div class="card-header">
            <span class="plan-title">{{ plan.title }}</span>
            <div style="display:flex;align-items:center;gap:6px">
              <!-- 区分教练指定还是自建 -->
              <el-tag v-if="plan.coach_id > 0" size="mini" type="warning">教练指定</el-tag>
              <el-tag :type="statusType(plan.status)" size="small">{{ statusLabel(plan.status) }}</el-tag>
            </div>
          </div>

          <div class="card-meta">
            <span><i class="el-icon-aim" /> 目标：{{ plan.goal }}</span>
            <span><i class="el-icon-date" /> {{ plan.start_date }} ~ {{ plan.end_date }}</span>
          </div>

          <p v-if="plan.description" class="plan-desc">{{ plan.description }}</p>

          <div v-if="plan.status === 1" class="progress-wrap">
            <span class="progress-label">进度</span>
            <el-progress :percentage="calcProgress(plan)" :stroke-width="8" />
          </div>
        </el-card>
      </div>
    </div>

    <!-- 新建计划弹窗 -->
    <el-dialog title="新建训练计划" :visible.sync="dialogVisible" width="460px" @close="resetForm">
      <el-form :model="form" :rules="rules" ref="form" label-width="90px">
        <el-form-item label="计划名称" prop="title">
          <el-input v-model="form.title" placeholder="如：12周减脂计划" />
        </el-form-item>
        <el-form-item label="训练目标" prop="goal">
          <el-select v-model="form.goal" style="width:100%">
            <el-option label="减脂" value="减脂" />
            <el-option label="增肌" value="增肌" />
            <el-option label="塑形" value="塑形" />
            <el-option label="提升耐力" value="提升耐力" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始日期" prop="start_date">
          <el-date-picker v-model="form.start_date" type="date" value-format="yyyy-MM-dd"
            placeholder="选择日期" style="width:100%" />
        </el-form-item>
        <el-form-item label="结束日期" prop="end_date">
          <el-date-picker v-model="form.end_date" type="date" value-format="yyyy-MM-dd"
            placeholder="选择日期" style="width:100%" />
        </el-form-item>
        <el-form-item label="计划描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="可选，描述计划目标和安排" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">创建</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getTrainingPlans, addTrainingPlan } from '@/api/training'

const STATUS_MAP = {
  0: { label: '已终止', type: 'info' },
  1: { label: '进行中', type: 'success' },
  2: { label: '已完成', type: '' }
}

export default {
  name: 'TrainingPlan',
  data() {
    return {
      plans: [],
      loading: false,
      statusFilter: null,
      dialogVisible: false,
      submitting: false,
      form: { title: '', goal: '', start_date: '', end_date: '', description: '' },
      rules: {
        title:      [{ required: true, message: '请输入计划名称', trigger: 'blur' }],
        goal:       [{ required: true, message: '请选择训练目标', trigger: 'change' }],
        start_date: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
        end_date:   [{ required: true, message: '请选择结束日期', trigger: 'change' }],
      }
    }
  },
  created() {
    this.fetchPlans()
  },
  methods: {
    async fetchPlans() {
      this.loading = true
      try {
        const res = await getTrainingPlans(this.statusFilter)
        this.plans = res.data.data || []
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
      if (this.form.end_date < this.form.start_date) {
        return this.$message.warning('结束日期不能早于开始日期')
      }
      this.submitting = true
      try {
        await addTrainingPlan(this.form)
        this.$message.success('计划创建成功')
        this.dialogVisible = false
        this.fetchPlans()
      } finally {
        this.submitting = false
      }
    },
    statusLabel(s) { return STATUS_MAP[s]?.label || '未知' },
    statusType(s)  { return STATUS_MAP[s]?.type  || '' },
    calcProgress(plan) {
      const start = new Date(plan.start_date).getTime()
      const end   = new Date(plan.end_date).getTime()
      const now   = Date.now()
      if (now <= start) return 0
      if (now >= end)   return 100
      return Math.round(((now - start) / (end - start)) * 100)
    }
  }
}
</script>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.plan-list { display: flex; flex-wrap: wrap; gap: 16px; }
.plan-card { width: 320px; }
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.plan-title { font-weight: 600; font-size: 15px; }
.card-meta { display: flex; flex-direction: column; gap: 4px; color: #606266; font-size: 13px; }
.plan-desc { margin: 10px 0 0; color: #909399; font-size: 13px; line-height: 1.5; }
.progress-wrap { margin-top: 12px; display: flex; align-items: center; gap: 8px; }
.progress-label { font-size: 12px; color: #909399; white-space: nowrap; }
</style>
