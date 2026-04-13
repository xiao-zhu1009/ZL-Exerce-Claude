<template>
  <div>
    <el-button icon="el-icon-arrow-left" @click="$router.back()" style="margin-bottom:16px">返回</el-button>

    <div v-loading="pageLoading">
      <el-row :gutter="20" v-if="student">
        <!-- 左列：学员信息 + 训练记录 -->
        <el-col :span="10">
          <el-card>
            <div slot="header">学员信息</div>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="昵称">{{ student.nickname }}</el-descriptions-item>
              <el-descriptions-item label="训练目标">{{ student.goal || '未设置' }}</el-descriptions-item>
            </el-descriptions>
          </el-card>

          <el-card style="margin-top:16px">
            <div slot="header">最近训练记录</div>
            <el-empty v-if="!student.workout_records.length" description="暂无记录" :image-size="60" />
            <el-table v-else :data="student.workout_records" size="small">
              <el-table-column prop="record_date" label="日期" width="100" />
              <el-table-column prop="workout_type" label="类型" width="70" />
              <el-table-column prop="duration" label="时长(分)" width="80" />
              <el-table-column prop="calories" label="卡路里" />
            </el-table>
          </el-card>

          <!-- 已有训练计划 -->
          <el-card style="margin-top:16px">
            <div slot="header" style="display:flex;justify-content:space-between;align-items:center">
              <span>已有训练计划</span>
              <el-button type="text" size="small" @click="fetchPlans">刷新</el-button>
            </div>
            <el-empty v-if="!plans.length" description="暂无计划" :image-size="60" />
            <div v-else>
              <div v-for="p in plans" :key="p.id" class="plan-item">
                <div class="plan-item-title">
                  {{ p.title }}
                  <el-tag size="mini" :type="statusType(p.status)" style="margin-left:6px">{{ statusLabel(p.status) }}</el-tag>
                  <el-tag v-if="p.coach_id === 0" size="mini" type="info" style="margin-left:4px">自建</el-tag>
                </div>
                <div class="plan-item-meta">{{ p.goal }} · {{ p.start_date }} ~ {{ p.end_date }}</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 右列：制定训练计划 -->
        <el-col :span="14">
          <el-card>
            <div slot="header">为该学员制定训练计划</div>
            <el-form :model="planForm" :rules="rules" ref="planForm" label-width="90px">
              <el-form-item label="计划名称" prop="title">
                <el-input v-model="planForm.title" placeholder="如：8周增肌计划" />
              </el-form-item>
              <el-form-item label="训练目标" prop="goal">
                <el-select v-model="planForm.goal" style="width:100%">
                  <el-option label="减脂" value="减脂" />
                  <el-option label="增肌" value="增肌" />
                  <el-option label="塑形" value="塑形" />
                  <el-option label="提升耐力" value="提升耐力" />
                </el-select>
              </el-form-item>
              <el-form-item label="开始日期" prop="start_date">
                <el-date-picker v-model="planForm.start_date" type="date" value-format="yyyy-MM-dd"
                  style="width:100%" />
              </el-form-item>
              <el-form-item label="结束日期" prop="end_date">
                <el-date-picker v-model="planForm.end_date" type="date" value-format="yyyy-MM-dd"
                  style="width:100%" />
              </el-form-item>
              <el-form-item label="计划描述">
                <el-input v-model="planForm.description" type="textarea" :rows="3"
                  placeholder="描述训练目标、注意事项等" />
              </el-form-item>
              <el-form-item label="训练内容">
                <el-input v-model="planForm.contentText" type="textarea" :rows="5"
                  placeholder="详细训练安排，如：周一 力量训练 深蹲3组×12次..." />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" :loading="submitting" @click="submitPlan">提交计划</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import { getStudentDetail, createPlan, getStudentPlans } from '@/api/coach'

const STATUS_MAP = {
  0: { label: '已终止', type: 'info' },
  1: { label: '进行中', type: 'success' },
  2: { label: '已完成', type: '' }
}

export default {
  name: 'StudentDetail',
  data() {
    return {
      pageLoading: false,
      submitting: false,
      student: null,
      plans: [],
      planForm: {
        title: '',
        goal: '',
        start_date: '',
        end_date: '',
        description: '',
        contentText: ''   // 文本形式，提交时转为 content 字段
      },
      rules: {
        title:      [{ required: true, message: '请输入计划名称', trigger: 'blur' }],
        goal:       [{ required: true, message: '请选择训练目标', trigger: 'change' }],
        start_date: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
        end_date:   [{ required: true, message: '请选择结束日期', trigger: 'change' }],
      }
    }
  },
  async created() {
    this.pageLoading = true
    try {
      const res = await getStudentDetail(this.$route.params.id)
      this.student = res.data.data
      await this.fetchPlans()
    } finally {
      this.pageLoading = false
    }
  },
  methods: {
    async fetchPlans() {
      const res = await getStudentPlans(this.$route.params.id)
      this.plans = res.data.data || []
    },
    async submitPlan() {
      await this.$refs.planForm.validate()
      if (this.planForm.end_date < this.planForm.start_date) {
        return this.$message.warning('结束日期不能早于开始日期')
      }
      this.submitting = true
      try {
        const payload = {
          student_id:  this.student.id,
          title:       this.planForm.title,
          goal:        this.planForm.goal,
          start_date:  this.planForm.start_date,
          end_date:    this.planForm.end_date,
          description: this.planForm.description,
          // 将文本内容包装为 JSON，方便后续扩展结构化数据
          content: this.planForm.contentText ? { text: this.planForm.contentText } : null,
        }
        await createPlan(payload)
        this.$message.success('计划已提交')
        this.$refs.planForm.resetFields()
        this.planForm.contentText = ''
        await this.fetchPlans()
      } finally {
        this.submitting = false
      }
    },
    statusLabel(s) { return STATUS_MAP[s]?.label || '未知' },
    statusType(s)  { return STATUS_MAP[s]?.type  || '' },
  }
}
</script>

<style scoped>
.plan-item {
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}
.plan-item:last-child { border-bottom: none; }
.plan-item-title { font-size: 14px; font-weight: 500; }
.plan-item-meta { font-size: 12px; color: #909399; margin-top: 2px; }
</style>
