<template>
  <div>
    <el-button icon="el-icon-arrow-left" @click="$router.back()" style="margin-bottom:16px">返回</el-button>
    <div v-loading="pageLoading">
      <el-row :gutter="20" v-if="student">
        <el-col :span="10">
          <el-card>
            <div slot="header">学员信息</div>
            <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px">
              <el-avatar :size="60" :src="student.avatar" style="background:#c0c4cc;flex-shrink:0">
                <i class="el-icon-user" style="font-size:28px" />
              </el-avatar>
              <div>
                <div style="font-size:16px;font-weight:bold">{{ student.nickname }}</div>
                <div v-if="student.signature" style="color:#909399;font-size:12px;margin-top:4px">
                  {{ student.signature }}
                </div>
              </div>
            </div>
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="手机号">{{ student.phone || '未填写' }}</el-descriptions-item>
              <el-descriptions-item label="训练目标">{{ student.goal || '未设置' }}</el-descriptions-item>
            </el-descriptions>
          </el-card>

          <el-card style="margin-top:16px">
            <div slot="header">身体指标</div>
            <el-descriptions :column="2" border size="small">
              <el-descriptions-item label="身高">{{ student.height ? student.height + ' cm' : '-' }}</el-descriptions-item>
              <el-descriptions-item label="体重">{{ student.weight ? student.weight + ' kg' : '-' }}</el-descriptions-item>
              <el-descriptions-item label="BMI">
                <span v-if="student.bmi">
                  {{ student.bmi }}
                  <el-tag size="mini" :type="bmiType(student.bmi)" style="margin-left:4px">{{ bmiLabel(student.bmi) }}</el-tag>
                </span>
                <span v-else>-</span>
              </el-descriptions-item>
              <el-descriptions-item label="体脂率">{{ student.body_fat ? student.body_fat + ' %' : '-' }}</el-descriptions-item>
              <el-descriptions-item label="腰围">{{ student.waist ? student.waist + ' cm' : '-' }}</el-descriptions-item>
              <el-descriptions-item label="臀围">{{ student.hip ? student.hip + ' cm' : '-' }}</el-descriptions-item>
              <el-descriptions-item label="腰臀比">{{ student.whr || '-' }}</el-descriptions-item>
            </el-descriptions>
          </el-card>

          <el-card style="margin-top:16px">
            <div slot="header">最近训练记录</div>
            <el-empty v-if="!student.workout_records.length" description="暂无记录" :image-size="60" />
            <el-table v-else :data="student.workout_records" size="small">
              <el-table-column prop="record_date" label="日期" width="100" />
              <el-table-column prop="workout_type" label="类型" width="70" />
              <el-table-column prop="duration" label="时长(分)" width="75" align="center" />
              <el-table-column prop="calories" label="卡路里" align="center" />
            </el-table>
          </el-card>
        </el-col>

        <el-col :span="14">
          <el-tabs v-model="rightTab">
            <el-tab-pane label="训练计划" name="training">
              <el-card style="margin-bottom:16px">
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

              <el-card>
                <div slot="header">制定训练计划</div>
                <el-form :model="planForm" :rules="planRules" ref="planForm" label-width="90px">
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
                    <el-date-picker v-model="planForm.start_date" type="date" value-format="yyyy-MM-dd" style="width:100%" />
                  </el-form-item>
                  <el-form-item label="结束日期" prop="end_date">
                    <el-date-picker v-model="planForm.end_date" type="date" value-format="yyyy-MM-dd" style="width:100%" />
                  </el-form-item>
                  <el-form-item label="计划描述">
                    <el-input v-model="planForm.description" type="textarea" :rows="2" placeholder="整体目标、注意事项等" />
                  </el-form-item>
                  <el-form-item label="每日安排">
                    <div v-for="(day, idx) in planForm.days" :key="idx" class="day-item">
                      <div class="day-header">
                        <el-input v-model="day.label" placeholder="如：周一 / Day1" size="small" style="width:150px" />
                        <el-button type="text" icon="el-icon-delete" style="color:#F56C6C" @click="removeDay(idx)" />
                      </div>
                      <el-input
                        v-model="day.content"
                        type="textarea"
                        :rows="2"
                        size="small"
                        placeholder="如：深蹲 4×12，卧推 4×10..."
                      />
                    </div>
                    <el-button size="small" icon="el-icon-plus" @click="addDay">添加一天</el-button>
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" :loading="planSubmitting" @click="submitPlan">提交训练计划</el-button>
                  </el-form-item>
                </el-form>
              </el-card>
            </el-tab-pane>

            <el-tab-pane label="饮食计划" name="diet">
              <el-card style="margin-bottom:16px">
                <div slot="header" style="display:flex;justify-content:space-between;align-items:center">
                  <span>已有饮食计划</span>
                  <el-button type="text" size="small" @click="fetchDietPlans">刷新</el-button>
                </div>
                <el-empty v-if="!dietPlans.length" description="暂无饮食计划" :image-size="60" />
                <div v-else>
                  <div v-for="p in dietPlans" :key="p.id" class="plan-item">
                    <div class="plan-item-title">
                      {{ p.title }}
                      <el-tag size="mini" :type="statusType(p.status)" style="margin-left:6px">{{ statusLabel(p.status) }}</el-tag>
                    </div>
                    <div class="plan-item-meta">{{ p.goal }} · {{ p.start_date }} ~ {{ p.end_date }}</div>
                    <div style="margin-top:4px">
                      <el-button v-if="p.status === 1" size="mini" type="warning" @click="changeDietPlanStatus(p.id, 0)">终止</el-button>
                      <el-button v-if="p.status === 1" size="mini" type="success" @click="changeDietPlanStatus(p.id, 2)">标记完成</el-button>
                    </div>
                  </div>
                </div>
              </el-card>

              <el-card>
                <div slot="header">制定饮食计划</div>
                <el-form :model="dietForm" :rules="dietRules" ref="dietForm" label-width="90px">
                  <el-form-item label="计划名称" prop="title">
                    <el-input v-model="dietForm.title" placeholder="如：减脂期饮食方案" />
                  </el-form-item>
                  <el-form-item label="饮食目标" prop="goal">
                    <el-select v-model="dietForm.goal" style="width:100%">
                      <el-option label="减脂" value="减脂" />
                      <el-option label="增肌" value="增肌" />
                      <el-option label="均衡饮食" value="均衡饮食" />
                      <el-option label="增重" value="增重" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="开始日期" prop="start_date">
                    <el-date-picker v-model="dietForm.start_date" type="date" value-format="yyyy-MM-dd" style="width:100%" />
                  </el-form-item>
                  <el-form-item label="结束日期" prop="end_date">
                    <el-date-picker v-model="dietForm.end_date" type="date" value-format="yyyy-MM-dd" style="width:100%" />
                  </el-form-item>
                  <el-form-item label="整体说明">
                    <el-input v-model="dietForm.description" type="textarea" :rows="2" placeholder="热量目标、饮食原则、禁忌食物等" />
                  </el-form-item>
                  <el-form-item label="每日餐次">
                    <div v-for="(day, idx) in dietForm.days" :key="idx" class="day-item">
                      <div class="day-header">
                        <el-input v-model="day.label" placeholder="如：周一 / 工作日" size="small" style="width:150px" />
                        <el-button type="text" icon="el-icon-delete" style="color:#F56C6C" @click="removeDietDay(idx)" />
                      </div>
                      <el-row :gutter="8">
                        <el-col :span="12">
                          <el-input v-model="day.breakfast" type="textarea" :rows="2" size="small" placeholder="早餐：如 燕麦100g + 鸡蛋2个" />
                        </el-col>
                        <el-col :span="12">
                          <el-input v-model="day.lunch" type="textarea" :rows="2" size="small" placeholder="午餐：如 米饭150g + 鸡胸肉200g" />
                        </el-col>
                        <el-col :span="12" style="margin-top:8px">
                          <el-input v-model="day.dinner" type="textarea" :rows="2" size="small" placeholder="晚餐：如 蔬菜沙拉 + 三文鱼150g" />
                        </el-col>
                        <el-col :span="12" style="margin-top:8px">
                          <el-input v-model="day.snack" type="textarea" :rows="2" size="small" placeholder="加餐（可选）：如 蛋白粉 + 坚果" />
                        </el-col>
                      </el-row>
                    </div>
                    <el-button size="small" icon="el-icon-plus" @click="addDietDay">添加一天</el-button>
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" :loading="dietSubmitting" @click="submitDietPlan">提交饮食计划</el-button>
                  </el-form-item>
                </el-form>
              </el-card>
            </el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import { getStudentDetail, createPlan, getStudentPlans } from '@/api/coach'
import { coachCreateDietPlan, coachGetDietPlans, coachUpdateDietPlanStatus } from '@/api/dietPlan'

const STATUS_MAP = {
  0: { label: '已终止', type: 'info' },
  1: { label: '进行中', type: 'success' },
  2: { label: '已完成', type: '' },
}

export default {
  name: 'StudentDetail',
  data() {
    return {
      pageLoading: false,
      rightTab: 'training',
      student: null,
      plans: [],
      planSubmitting: false,
      planForm: { title: '', goal: '', start_date: '', end_date: '', description: '', days: [] },
      planRules: {
        title: [{ required: true, message: '请输入计划名称', trigger: 'blur' }],
        goal: [{ required: true, message: '请选择训练目标', trigger: 'change' }],
        start_date: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
        end_date: [{ required: true, message: '请选择结束日期', trigger: 'change' }],
      },
      dietPlans: [],
      dietSubmitting: false,
      dietForm: { title: '', goal: '', start_date: '', end_date: '', description: '', days: [] },
      dietRules: {
        title: [{ required: true, message: '请输入计划名称', trigger: 'blur' }],
        goal: [{ required: true, message: '请选择饮食目标', trigger: 'change' }],
        start_date: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
        end_date: [{ required: true, message: '请选择结束日期', trigger: 'change' }],
      },
    }
  },
  async created() {
    await this.loadPageData()
  },
  methods: {
    async loadPageData() {
      this.pageLoading = true
      try {
        const res = await getStudentDetail(this.$route.params.id)
        this.student = res.data || null
        await Promise.all([this.fetchPlans(), this.fetchDietPlans()])
      } catch (e) {
        this.$message.error(e?.response?.data?.message || '加载失败')
      } finally {
        this.pageLoading = false
      }
    },
    async fetchPlans() {
      try {
        const res = await getStudentPlans(this.$route.params.id)
        this.plans = res.data || []
      } catch {}
    },
    addDay() {
      this.planForm.days.push({ label: '', content: '' })
    },
    removeDay(idx) {
      this.planForm.days.splice(idx, 1)
    },
    async submitPlan() {
      await this.$refs.planForm.validate()
      if (this.planForm.end_date < this.planForm.start_date) {
        return this.$message.warning('结束日期不能早于开始日期')
      }
      this.planSubmitting = true
      try {
        const days = this.planForm.days.filter((d) => d.label || d.content)
        await createPlan({
          student_id: this.student.id,
          title: this.planForm.title,
          goal: this.planForm.goal,
          start_date: this.planForm.start_date,
          end_date: this.planForm.end_date,
          description: this.planForm.description,
          content: days.length ? { days } : null,
        })
        this.$message.success('训练计划已提交')
        this.$refs.planForm.resetFields()
        this.planForm.days = []
        await this.fetchPlans()
      } catch (e) {
        this.$message.error(e?.response?.data?.message || '提交失败')
      } finally {
        this.planSubmitting = false
      }
    },
    async fetchDietPlans() {
      try {
        const res = await coachGetDietPlans(this.$route.params.id)
        this.dietPlans = res.data || []
      } catch {}
    },
    addDietDay() {
      this.dietForm.days.push({ label: '', breakfast: '', lunch: '', dinner: '', snack: '' })
    },
    removeDietDay(idx) {
      this.dietForm.days.splice(idx, 1)
    },
    async submitDietPlan() {
      await this.$refs.dietForm.validate()
      if (this.dietForm.end_date < this.dietForm.start_date) {
        return this.$message.warning('结束日期不能早于开始日期')
      }
      this.dietSubmitting = true
      try {
        const days = this.dietForm.days.filter((d) => d.label || d.breakfast || d.lunch || d.dinner)
        await coachCreateDietPlan({
          student_id: this.student.id,
          title: this.dietForm.title,
          goal: this.dietForm.goal,
          start_date: this.dietForm.start_date,
          end_date: this.dietForm.end_date,
          description: this.dietForm.description,
          content: days.length ? { days } : null,
        })
        this.$message.success('饮食计划已提交')
        this.$refs.dietForm.resetFields()
        this.dietForm.days = []
        await this.fetchDietPlans()
      } catch (e) {
        this.$message.error(e?.response?.data?.message || '提交失败')
      } finally {
        this.dietSubmitting = false
      }
    },
    async changeDietPlanStatus(planId, status) {
      const label = status === 0 ? '终止' : '标记完成'
      await this.$confirm(`确认${label}该饮食计划？`, '提示', { type: 'warning' })
      try {
        await coachUpdateDietPlanStatus(planId, status)
        this.$message.success(`已${label}`)
        await this.fetchDietPlans()
      } catch (e) {
        this.$message.error(e?.response?.data?.message || '操作失败')
      }
    },
    bmiLabel(b) {
      if (b < 18.5) return '偏瘦'
      if (b < 24) return '正常'
      if (b < 28) return '超重'
      return '肥胖'
    },
    bmiType(b) {
      if (b < 18.5) return 'primary'
      if (b < 24) return 'success'
      if (b < 28) return 'warning'
      return 'danger'
    },
    statusLabel(s) {
      return STATUS_MAP[s]?.label || '未知'
    },
    statusType(s) {
      return STATUS_MAP[s]?.type || ''
    },
  },
}
</script>

<style scoped>
.plan-item {
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}
.plan-item:last-child {
  border-bottom: none;
}
.plan-item-title {
  font-size: 14px;
  font-weight: 500;
}
.plan-item-meta {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}
.day-item {
  margin-bottom: 12px;
  padding: 10px;
  background: #fafafa;
  border-radius: 4px;
}
.day-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
</style>
