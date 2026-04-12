<template>
  <div>
    <h2 style="margin-bottom:20px">数据统计</h2>
    <el-row :gutter="16" style="margin-bottom:20px">
      <el-col :span="4" v-for="card in overviewCards" :key="card.label">
        <el-card style="text-align:center">
          <div style="font-size:26px;font-weight:bold;color:#409EFF">{{ card.value }}</div>
          <div style="color:#999;margin-top:6px;font-size:13px">{{ card.label }}</div>
        </el-card>
      </el-col>
    </el-row>
    <el-card>
      <div slot="header">用户增长趋势</div>
      <!-- TODO: 对接后端 GET /admin/statistics 获取真实数据 -->
      <div ref="growthChart" style="height:300px" />
    </el-card>
  </div>
</template>

<script>
import echarts from 'echarts'
import { getStatistics } from '@/api/admin'

export default {
  name: 'Statistics',
  data() { return { overviewCards: [] } },
  async created() {
    // TODO: 对接后端 GET /admin/statistics
    const res = await getStatistics()
    const d = res.data
    this.overviewCards = [
      { label: '总用户数', value: d.total_users },
      { label: '活跃用户', value: d.active_users },
      { label: '动作总数', value: d.total_actions },
      { label: '文章总数', value: d.total_articles },
      { label: '课程总数', value: d.total_courses },
      { label: '预约总数', value: d.total_reservations }
    ]
    this.$nextTick(() => {
      const chart = echarts.init(this.$refs.growthChart)
      chart.setOption({
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: d.user_growth.map(g => g.month) },
        yAxis: { type: 'value', name: '人数' },
        series: [{ name: '活跃用户', type: 'line', smooth: true, areaStyle: {}, data: d.user_growth.map(g => g.count) }]
      })
    })
  }
}
</script>
