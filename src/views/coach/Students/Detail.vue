<template>
  <div>
    <el-button icon="el-icon-arrow-left" @click="$router.back()" style="margin-bottom:16px">返回</el-button>
    <el-row :gutter="20" v-if="student">
      <el-col :span="10">
        <el-card>
          <div slot="header">学员信息</div>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="昵称">{{ student.nickname }}</el-descriptions-item>
            <el-descriptions-item label="训练目标">{{ student.goal }}</el-descriptions-item>
            <el-descriptions-item label="身高(cm)">{{ student.height }}</el-descriptions-item>
            <el-descriptions-item label="体重(kg)">{{ student.weight }}</el-descriptions-item>
            <el-descriptions-item label="BMI">{{ student.bmi }}</el-descriptions-item>
            <el-descriptions-item label="体脂率(%)">{{ student.body_fat }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <el-card style="margin-top:16px">
          <div slot="header">训练记录</div>
          <el-table :data="student.workout_records" size="small">
            <el-table-column prop="record_date" label="日期" />
            <el-table-column prop="duration" label="时长(分钟)" />
            <el-table-column prop="calories" label="消耗(kcal)" />
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="14">
        <el-card>
          <div slot="header">制定训练计划</div>
          <el-form :model="planForm" label-width="90px">
            <el-form-item label="计划名称"><el-input v-model="planForm.title" /></el-form-item>
            <el-form-item label="训练目标">
              <el-select v-model="planForm.goal" style="width:100%">
                <el-option label="减脂" value="减脂" /><el-option label="增肌" value="增肌" />
                <el-option label="塑形" value="塑形" /><el-option label="维持" value="维持" />
              </el-select>
            </el-form-item>
            <el-form-item label="开始日期"><el-date-picker v-model="planForm.start_date" type="date" value-format="yyyy-MM-dd" style="width:100%" /></el-form-item>
            <el-form-item label="结束日期"><el-date-picker v-model="planForm.end_date" type="date" value-format="yyyy-MM-dd" style="width:100%" /></el-form-item>
            <el-form-item label="计划内容">
              <!-- TODO: 对接后端后可扩展为结构化的每日训练安排 -->
              <el-input v-model="planForm.content" type="textarea" :rows="6" placeholder="请输入训练计划详情..." />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitPlan">提交计划</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getStudentDetail, createPlan } from '@/api/coach'

export default {
  name: 'StudentDetail',
  data() {
    return {
      student: null,
      planForm: { title: '', goal: '', start_date: '', end_date: '', content: '' }
    }
  },
  async created() {
    // TODO: 对接后端 GET /coach/students/:id
    const res = await getStudentDetail(this.$route.params.id)
    this.student = res.data
  },
  methods: {
    async submitPlan() {
      // TODO: 对接后端 POST /coach/plan { user_id, ...planForm }
      await createPlan({ user_id: this.student.id, ...this.planForm })
      this.$message.success('计划已提交')
    }
  }
}
</script>
