<template>
  <div>
    <el-row :gutter="16" style="margin-bottom:20px">
      <el-col :span="4" v-for="card in overviewCards" :key="card.label">
        <el-card style="text-align:center">
          <div style="font-size:26px;font-weight:bold;color:#409EFF">{{ card.value }}</div>
          <div style="color:#999;margin-top:6px;font-size:13px">{{ card.label }}</div>
        </el-card>
      </el-col>
    </el-row>
    <el-card>
      <div slot="header" style="display:flex;align-items:center;justify-content:space-between">
        <span>用户增长趋势</span>
        <el-radio-group v-model="granularity" size="small" @change="loadChart">
          <el-radio-button label="day">按日</el-radio-button>
          <el-radio-button label="month">按月</el-radio-button>
        </el-radio-group>
      </div>
      <div ref="growthChart" style="height:300px" />
    </el-card>
  </div>
</template>

<script>
import echarts from 'echarts'
import { getStatistics } from '@/api/admin'

export default {
  name: 'Statistics',
  data() {
    return {
      overviewCards: [],
      granularity: 'day', // 默认按日；month=近6月，day=近30天
      chart: null
    }
  },
  async created() {
    // 加载概览卡片（只需请求一次，粒度切换不影响卡片数据）
    const res = await getStatistics('day')
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
      this.chart = echarts.init(this.$refs.growthChart)
      this._renderChart(d.user_growth)
    })
  },
  methods: {
    // 切换粒度时重新请求并刷新图表
    async loadChart(granularity) {
      const res = await getStatistics(granularity)
      this._renderChart(res.data.user_growth)
    },
    _renderChart(growth) {
      this.chart.setOption({
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: growth.map(g => g.label) },
        yAxis: { type: 'value', name: '人数' },
        series: [{
          name: '新增用户',
          type: 'line',
          smooth: true,
          areaStyle: {},
          data: growth.map(g => g.count)
        }]
      })
    }
  }
}
</script>
