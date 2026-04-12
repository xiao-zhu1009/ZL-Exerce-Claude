<template>
  <div>
    <h2 style="margin-bottom:20px">数据看板</h2>
    <el-row :gutter="16" style="margin-bottom:20px">
      <el-col :span="6" v-for="card in overviewCards" :key="card.label">
        <el-card style="text-align:center">
          <div style="font-size:28px;font-weight:bold;color:#409EFF">{{ card.value }}</div>
          <div style="color:#999;margin-top:6px">{{ card.label }}</div>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="16">
      <el-col :span="12">
        <el-card>
          <div slot="header">体重变化趋势</div>
          <!-- TODO: 对接后端 GET /user/body-records 获取真实数据 -->
          <div ref="weightChart" style="height:260px" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <div slot="header">本周训练频次</div>
          <!-- TODO: 对接后端 GET /user/dashboard 获取真实训练记录 -->
          <div ref="workoutChart" style="height:260px" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import echarts from 'echarts'
import { getDashboard } from '@/api/user'

export default {
  name: 'Dashboard',
  data() {
    return {
      overviewCards: [
        { label: '本周训练次数', value: 0 },
        { label: '本周消耗卡路里', value: 0 },
        { label: '今日摄入卡路里', value: 0 },
        { label: '当前体重(kg)', value: 0 }
      ]
    }
  },
  async created() {
    // TODO: 对接后端 GET /user/dashboard
    const res = await getDashboard()
    const d = res.data
    this.overviewCards[0].value = d.workout_count_week
    this.overviewCards[1].value = d.calories_burned_week
    this.overviewCards[2].value = d.calories_intake_today
    this.overviewCards[3].value = d.body_records[d.body_records.length - 1]?.weight || '--'
    this.$nextTick(() => {
      this.initWeightChart(d.body_records)
      this.initWorkoutChart()
    })
  },
  methods: {
    initWeightChart(records) {
      const chart = echarts.init(this.$refs.weightChart)
      chart.setOption({
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: records.map(r => r.record_date) },
        yAxis: { type: 'value', name: 'kg', min: val => val.min - 2 },
        series: [{ name: '体重', type: 'line', smooth: true, data: records.map(r => r.weight) }]
      })
    },
    initWorkoutChart() {
      // TODO: 对接后端后替换为真实本周训练数据
      const chart = echarts.init(this.$refs.workoutChart)
      chart.setOption({
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] },
        yAxis: { type: 'value', name: '分钟' },
        series: [{ name: '训练时长', type: 'bar', data: [60, 45, 0, 75, 50, 0, 90] }]
      })
    }
  }
}
</script>
