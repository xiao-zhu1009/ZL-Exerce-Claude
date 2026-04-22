<template>
  <div>
    <!-- 教练计划 / 我的计划 切换 -->
    <el-tabs v-model="activeTab" @tab-click="onTabChange" style="margin-bottom:8px">
      <el-tab-pane label="教练计划" name="coach" />
      <el-tab-pane label="我的计划" name="self" />
    </el-tabs>

    <!-- ── 教练计划 Tab ── -->
    <template v-if="activeTab === 'coach'">
      <el-card style="margin-bottom:16px">
        <el-radio-group v-model="dietPlanStatus" @change="fetchDietPlans">
          <el-radio-button :label="null">全部</el-radio-button>
          <el-radio-button :label="1">进行中</el-radio-button>
          <el-radio-button :label="2">已完成</el-radio-button>
          <el-radio-button :label="0">已终止</el-radio-button>
        </el-radio-group>
      </el-card>

      <div v-loading="dietPlanLoading">
        <el-empty v-if="!dietPlanLoading && dietPlanList.length === 0" description="暂无饮食计划" :image-size="80" />
        <el-row :gutter="16">
          <el-col :span="8" v-for="plan in dietPlanList" :key="plan.id" style="margin-bottom:16px">
            <el-card class="plan-card" shadow="hover">
              <div style="display:flex;justify-content:space-between;align-items:flex-start">
                <div style="font-size:15px;font-weight:bold;flex:1;margin-right:8px">{{ plan.title }}</div>
                <el-tag size="mini" :type="statusType(plan.status)">{{ statusLabel(plan.status) }}</el-tag>
              </div>
              <div style="margin-top:8px;color:#606266;font-size:13px">
                <i class="el-icon-aim" style="margin-right:4px" />目标：{{ plan.goal }}
              </div>
              <div style="margin-top:4px;color:#909399;font-size:12px">
                <i class="el-icon-date" style="margin-right:4px" />{{ plan.start_date }} ~ {{ plan.end_date }}
              </div>
              <div v-if="plan.coach_name" style="margin-top:4px;color:#909399;font-size:12px">
                <i class="el-icon-user" style="margin-right:4px" />教练：{{ plan.coach_name }}
              </div>
              <div v-if="plan.description" style="margin-top:8px;color:#666;font-size:12px;line-height:1.5" class="plan-desc">
                {{ plan.description }}
              </div>
              <div style="margin-top:12px;text-align:right">
                <el-button size="mini" type="primary" plain @click="openDietPlanDetail(plan)">查看详情</el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </template>

    <!-- ── 我的计划 Tab ── -->
    <template v-if="activeTab === 'self'">
      <!-- 自拟计划列表 -->
      <el-card style="margin-bottom:16px">
        <div slot="header" style="display:flex;justify-content:space-between;align-items:center">
          <span>我的自拟计划</span>
          <div style="display:flex;align-items:center;gap:8px">
            <el-radio-group v-model="selfPlanStatus" size="mini" @change="fetchSelfPlans">
              <el-radio-button :label="null">全部</el-radio-button>
              <el-radio-button :label="1">进行中</el-radio-button>
              <el-radio-button :label="2">已完成</el-radio-button>
              <el-radio-button :label="0">已终止</el-radio-button>
            </el-radio-group>
            <el-button type="text" size="small" @click="fetchSelfPlans">刷新</el-button>
          </div>
        </div>
        <div v-loading="selfPlanLoading">
          <el-empty v-if="!selfPlanLoading && selfPlanList.length === 0" description="暂无自拟计划" :image-size="60" />
          <el-row :gutter="16">
            <el-col :span="8" v-for="plan in selfPlanList" :key="plan.id" style="margin-bottom:16px">
              <el-card class="plan-card" shadow="hover">
                <div style="display:flex;justify-content:space-between;align-items:flex-start">
                  <div style="font-size:15px;font-weight:bold;flex:1;margin-right:8px">{{ plan.title }}</div>
                  <el-tag size="mini" :type="statusType(plan.status)">{{ statusLabel(plan.status) }}</el-tag>
                </div>
                <div style="margin-top:8px;color:#606266;font-size:13px">
                  <i class="el-icon-aim" style="margin-right:4px" />目标：{{ plan.goal }}
                </div>
                <div style="margin-top:4px;color:#909399;font-size:12px">
                  <i class="el-icon-date" style="margin-right:4px" />{{ plan.start_date }} ~ {{ plan.end_date }}
                </div>
                <div v-if="plan.description" style="margin-top:8px;color:#666;font-size:12px;line-height:1.5" class="plan-desc">
                  {{ plan.description }}
                </div>
                <div style="margin-top:12px;display:flex;justify-content:space-between;align-items:center">
                  <div>
                    <el-button v-if="plan.status === 1" size="mini" type="warning" @click="changeSelfPlanStatus(plan.id, 0)">终止</el-button>
                    <el-button v-if="plan.status === 1" size="mini" type="success" @click="changeSelfPlanStatus(plan.id, 2)">标记完成</el-button>
                  </div>
                  <el-button size="mini" type="primary" plain @click="openSelfPlanDetail(plan)">查看详情</el-button>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </el-card>

      <!-- 创建自拟计划表单 -->
      <el-card>
        <div slot="header">新建自拟饮食计划</div>
        <el-form :model="selfForm" :rules="selfRules" ref="selfForm" label-width="90px">
          <el-form-item label="计划名称" prop="title">
            <el-input v-model="selfForm.title" placeholder="如：我的减脂饮食方案" />
          </el-form-item>
          <el-form-item label="饮食目标" prop="goal">
            <el-select v-model="selfForm.goal" style="width:100%">
              <el-option label="减脂" value="减脂" />
              <el-option label="增肌" value="增肌" />
              <el-option label="均衡饮食" value="均衡饮食" />
              <el-option label="增重" value="增重" />
            </el-select>
          </el-form-item>
          <el-form-item label="开始日期" prop="start_date">
            <el-date-picker v-model="selfForm.start_date" type="date" value-format="yyyy-MM-dd" style="width:100%" />
          </el-form-item>
          <el-form-item label="结束日期" prop="end_date">
            <el-date-picker v-model="selfForm.end_date" type="date" value-format="yyyy-MM-dd" style="width:100%" />
          </el-form-item>
          <el-form-item label="整体说明">
            <el-input v-model="selfForm.description" type="textarea" :rows="2" placeholder="热量目标、饮食原则、禁忌食物等" />
          </el-form-item>
          <el-form-item label="每日餐次">
            <div v-for="(day, idx) in selfForm.days" :key="idx" class="day-item">
              <div class="day-header">
                <el-input v-model="day.label" placeholder="如：周一 / 工作日" size="small" style="width:150px" />
                <el-button type="text" icon="el-icon-delete" style="color:#F56C6C" @click="removeSelfDay(idx)" />
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
            <el-button size="small" icon="el-icon-plus" @click="addSelfDay">添加一天</el-button>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="selfSubmitting" @click="submitSelfPlan">提交计划</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </template>

    <!-- 计划详情弹窗（教练计划 & 自拟计划共用） -->
    <el-dialog :title="currentDetail ? currentDetail.title : ''" :visible.sync="detailVisible" width="680px">
      <div v-if="currentDetail">
        <el-descriptions :column="2" border size="small" style="margin-bottom:16px">
          <el-descriptions-item label="饮食目标">{{ currentDetail.goal }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag size="mini" :type="statusType(currentDetail.status)">{{ statusLabel(currentDetail.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="开始日期">{{ currentDetail.start_date }}</el-descriptions-item>
          <el-descriptions-item label="结束日期">{{ currentDetail.end_date }}</el-descriptions-item>
          <el-descriptions-item v-if="currentDetail.coach_name" label="制定教练" :span="2">
            {{ currentDetail.coach_name }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentDetail.description" label="整体说明" :span="2">
            {{ currentDetail.description }}
          </el-descriptions-item>
        </el-descriptions>

        <div v-if="currentDetail.content && currentDetail.content.days && currentDetail.content.days.length">
          <div style="font-weight:bold;margin-bottom:12px;font-size:14px">每日餐次安排</div>
          <el-collapse accordion>
            <el-collapse-item v-for="(day, idx) in currentDetail.content.days" :key="idx" :name="idx">
              <template slot="title">
                <span style="font-weight:500">{{ day.label || `第 ${idx + 1} 天` }}</span>
              </template>
              <el-row :gutter="12">
                <el-col :span="12" v-if="day.breakfast">
                  <div class="meal-block">
                    <div class="meal-title"><i class="el-icon-sunrise" /> 早餐</div>
                    <div class="meal-content">{{ day.breakfast }}</div>
                  </div>
                </el-col>
                <el-col :span="12" v-if="day.lunch">
                  <div class="meal-block">
                    <div class="meal-title"><i class="el-icon-sunny" /> 午餐</div>
                    <div class="meal-content">{{ day.lunch }}</div>
                  </div>
                </el-col>
                <el-col :span="12" v-if="day.dinner" style="margin-top:8px">
                  <div class="meal-block">
                    <div class="meal-title"><i class="el-icon-moon" /> 晚餐</div>
                    <div class="meal-content">{{ day.dinner }}</div>
                  </div>
                </el-col>
                <el-col :span="12" v-if="day.snack" style="margin-top:8px">
                  <div class="meal-block">
                    <div class="meal-title"><i class="el-icon-apple" /> 加餐</div>
                    <div class="meal-content">{{ day.snack }}</div>
                  </div>
                </el-col>
              </el-row>
            </el-collapse-item>
          </el-collapse>
        </div>
        <el-empty v-else description="暂无每日餐次安排" :image-size="60" />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getDietPlans, getDietPlanDetail, createSelfDietPlan, getSelfDietPlans, updateSelfDietPlanStatus } from '@/api/dietPlan'

const STATUS_MAP = {
  0: { label: '已终止', type: 'info' },
  1: { label: '进行中', type: 'success' },
  2: { label: '已完成', type: '' },
}

export default {
  name: 'DietPlan',
  data() {
    return {
      activeTab: 'coach',

      // 教练计划
      dietPlanLoading: false,
      dietPlanList: [],
      dietPlanStatus: null,

      // 自拟计划
      selfPlanLoading: false,
      selfPlanList: [],
      selfPlanStatus: null,
      selfSubmitting: false,
      selfForm: { title: '', goal: '', start_date: '', end_date: '', description: '', days: [] },
      selfRules: {
        title: [{ required: true, message: '请输入计划名称', trigger: 'blur' }],
        goal: [{ required: true, message: '请选择饮食目标', trigger: 'change' }],
        start_date: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
        end_date: [{ required: true, message: '请选择结束日期', trigger: 'change' }],
      },

      // 详情弹窗（共用）
      detailVisible: false,
      currentDetail: null,
    }
  },
  created() {
    this.fetchDietPlans()
  },
  methods: {
    onTabChange(tab) {
      if (tab.name === 'self' && !this.selfPlanList.length) {
        this.fetchSelfPlans()
      }
    },

    // ── 教练计划 ──────────────────────────────────────────
    async fetchDietPlans() {
      this.dietPlanLoading = true
      try {
        const res = await getDietPlans(this.dietPlanStatus)
        this.dietPlanList = res.data || []
      } catch {
        this.$message.error('加载饮食计划失败')
      } finally {
        this.dietPlanLoading = false
      }
    },
    async openDietPlanDetail(plan) {
      try {
        const res = await getDietPlanDetail(plan.id)
        this.currentDetail = res.data
        this.detailVisible = true
      } catch {
        this.$message.error('加载详情失败')
      }
    },

    // ── 自拟计划 ──────────────────────────────────────────
    async fetchSelfPlans() {
      this.selfPlanLoading = true
      try {
        const res = await getSelfDietPlans(this.selfPlanStatus)
        this.selfPlanList = res.data || []
      } catch {
        this.$message.error('加载自拟计划失败')
      } finally {
        this.selfPlanLoading = false
      }
    },
    addSelfDay() {
      this.selfForm.days.push({ label: '', breakfast: '', lunch: '', dinner: '', snack: '' })
    },
    removeSelfDay(idx) {
      this.selfForm.days.splice(idx, 1)
    },
    async submitSelfPlan() {
      await this.$refs.selfForm.validate()
      if (this.selfForm.end_date < this.selfForm.start_date) {
        return this.$message.warning('结束日期不能早于开始日期')
      }
      this.selfSubmitting = true
      try {
        const days = this.selfForm.days.filter((d) => d.label || d.breakfast || d.lunch || d.dinner)
        await createSelfDietPlan({
          title: this.selfForm.title,
          goal: this.selfForm.goal,
          start_date: this.selfForm.start_date,
          end_date: this.selfForm.end_date,
          description: this.selfForm.description,
          content: days.length ? { days } : null,
        })
        this.$message.success('自拟计划已创建')
        this.$refs.selfForm.resetFields()
        this.selfForm = { title: '', goal: '', start_date: '', end_date: '', description: '', days: [] }
        await this.fetchSelfPlans()
      } catch (e) {
        this.$message.error(e?.response?.data?.message || '提交失败')
      } finally {
        this.selfSubmitting = false
      }
    },
    async changeSelfPlanStatus(planId, status) {
      const label = status === 0 ? '终止' : '标记完成'
      await this.$confirm(`确认${label}该计划？`, '提示', { type: 'warning' })
      try {
        await updateSelfDietPlanStatus(planId, status)
        this.$message.success(`已${label}`)
        await this.fetchSelfPlans()
      } catch (e) {
        this.$message.error(e?.response?.data?.message || '操作失败')
      }
    },
    openSelfPlanDetail(plan) {
      // 自拟计划直接用列表数据展示，无需额外请求
      this.currentDetail = plan
      this.detailVisible = true
    },

    statusLabel(s) { return STATUS_MAP[s]?.label || '未知' },
    statusType(s) { return STATUS_MAP[s]?.type || '' },
  }
}
</script>

<style scoped>
.plan-card { transition: box-shadow .2s; }
.plan-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.1); }
.plan-desc { overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }

.day-item { margin-bottom: 12px; padding: 10px; background: #fafafa; border-radius: 4px; }
.day-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }

.meal-block { background: #f8f9fa; border-radius: 4px; padding: 10px; }
.meal-title { font-size: 13px; font-weight: 500; color: #606266; margin-bottom: 6px; }
.meal-content { font-size: 13px; color: #333; line-height: 1.6; white-space: pre-wrap; }
</style>
