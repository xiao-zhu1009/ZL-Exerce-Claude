<template>
  <div>
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
              <el-tag size="mini" :type="dietPlanStatusType(plan.status)">{{ dietPlanStatusLabel(plan.status) }}</el-tag>
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

    <el-dialog :title="dietPlanDetail ? dietPlanDetail.title : ''" :visible.sync="dietPlanDetailVisible" width="680px">
      <div v-if="dietPlanDetail">
        <el-descriptions :column="2" border size="small" style="margin-bottom:16px">
          <el-descriptions-item label="饮食目标">{{ dietPlanDetail.goal }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag size="mini" :type="dietPlanStatusType(dietPlanDetail.status)">
              {{ dietPlanStatusLabel(dietPlanDetail.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="开始日期">{{ dietPlanDetail.start_date }}</el-descriptions-item>
          <el-descriptions-item label="结束日期">{{ dietPlanDetail.end_date }}</el-descriptions-item>
          <el-descriptions-item v-if="dietPlanDetail.coach_name" label="制定教练" :span="2">
            {{ dietPlanDetail.coach_name }}
          </el-descriptions-item>
          <el-descriptions-item v-if="dietPlanDetail.description" label="整体说明" :span="2">
            {{ dietPlanDetail.description }}
          </el-descriptions-item>
        </el-descriptions>

        <div v-if="dietPlanDetail.content && dietPlanDetail.content.days && dietPlanDetail.content.days.length">
          <div style="font-weight:bold;margin-bottom:12px;font-size:14px">每日餐次安排</div>
          <el-collapse accordion>
            <el-collapse-item v-for="(day, idx) in dietPlanDetail.content.days" :key="idx" :name="idx">
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
import { getDietPlans, getDietPlanDetail } from '@/api/dietPlan'

const DIET_PLAN_STATUS = {
  0: { label: '已终止', type: 'info' },
  1: { label: '进行中', type: 'success' },
  2: { label: '已完成', type: '' },
}

export default {
  name: 'DietPlan',
  data() {
    return {
      dietPlanLoading: false,
      dietPlanList: [],
      dietPlanStatus: null,
      dietPlanDetailVisible: false,
      dietPlanDetail: null,
    }
  },
  created() {
    this.fetchDietPlans()
  },
  methods: {
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
        this.dietPlanDetail = res.data
        this.dietPlanDetailVisible = true
      } catch {
        this.$message.error('加载详情失败')
      }
    },
    dietPlanStatusLabel(s) { return DIET_PLAN_STATUS[s]?.label || '未知' },
    dietPlanStatusType(s) { return DIET_PLAN_STATUS[s]?.type || '' },
  }
}
</script>

<style scoped>
.plan-card { transition: box-shadow .2s; }
.plan-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.1); }
.plan-desc { overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }

.meal-block { background: #f8f9fa; border-radius: 4px; padding: 10px; }
.meal-title { font-size: 13px; font-weight: 500; color: #606266; margin-bottom: 6px; }
.meal-content { font-size: 13px; color: #333; line-height: 1.6; white-space: pre-wrap; }
</style>
