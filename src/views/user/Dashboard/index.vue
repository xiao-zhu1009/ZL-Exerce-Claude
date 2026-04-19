<template>
  <div v-loading="loading" class="dashboard">

    <!-- 概览卡片 -->
    <el-row :gutter="16" style="margin-bottom:20px">
      <el-col :span="6" v-for="card in overviewCards" :key="card.label">
        <el-card class="overview-card" shadow="hover">
          <div class="card-icon" :style="{ background: card.bg }">
            <i :class="card.icon" />
          </div>
          <div class="card-body">
            <div class="card-value">{{ card.value }}</div>
            <div class="card-label">{{ card.label }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表第一行 -->
    <el-row :gutter="16" style="margin-bottom:16px">
      <el-col :span="12">
        <el-card>
          <div slot="header" class="chart-header">
            <span>体重变化趋势</span>
            <span class="chart-sub">近 30 天</span>
          </div>
          <div ref="weightChart" style="height:260px" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <div slot="header" class="chart-header">
            <span>本周训练时长</span>
            <span class="chart-sub">单位：分钟</span>
          </div>
          <div ref="workoutChart" style="height:260px" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表第二行 -->
    <el-row :gutter="16">
      <el-col :span="12">
        <el-card>
          <div slot="header" class="chart-header">
            <span>热量摄入趋势</span>
            <span class="chart-sub">近 7 天（kcal）</span>
          </div>
          <div ref="dietChart" style="height:260px" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <div slot="header" class="chart-header">
            <span>训练类型分布</span>
            <span class="chart-sub">近 30 天</span>
          </div>
          <div ref="typeChart" style="height:260px" />
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
      loading: false,
      overviewCards: [
        { label: '本周训练次数', value: '--', icon: 'el-icon-trophy',      bg: 'linear-gradient(135deg,#667eea,#764ba2)' },
        { label: '本周消耗(kcal)', value: '--', icon: 'el-icon-lightning', bg: 'linear-gradient(135deg,#f093fb,#f5576c)' },
        { label: '今日摄入(kcal)', value: '--', icon: 'el-icon-food',      bg: 'linear-gradient(135deg,#4facfe,#00f2fe)' },
        { label: '当前体重(kg)',   value: '--', icon: 'el-icon-data-line', bg: 'linear-gradient(135deg,#43e97b,#38f9d7)' },
      ],
      charts: [],  // 存储 echarts 实例，用于 resize
    }
  },
  async created() {
    this.loading = true
    try {
      const res = await getDashboard()
      if (res.code !== 200) return
      const d = res.data
      this.overviewCards[0].value = d.workout_count_week
      this.overviewCards[1].value = d.calories_burned_week
      this.overviewCards[2].value = d.calories_intake_today
      this.overviewCards[3].value = d.current_weight ?? '--'
      // 初始化echarts图表：体重变化趋势、本周训练时长、热量摄入趋势、训练类型分布
      this.$nextTick(() => {
        this.initWeightChart(d.body_records || [])
        this.initWorkoutChart(d.workout_week || [])
        this.initDietChart(d.diet_week || [])
        this.initTypeChart(d.workout_type_stats || [])
      })
    } finally {
      this.loading = false
    }
  },
  mounted() {
    // 窗口 resize 时重绘所有图表
    this._resizeHandler = () => this.charts.forEach(c => c.resize())
    window.addEventListener('resize', this._resizeHandler)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this._resizeHandler)
    this.charts.forEach(c => c.dispose())
  },
  methods: {
    initWeightChart(records) {
      const chart = echarts.init(this.$refs.weightChart)
      this.charts.push(chart)
      if (!records.length) {
        chart.setOption({ graphic: [{ type: 'text', left: 'center', top: 'middle', style: { text: '暂无体重记录', fill: '#999', fontSize: 14 } }] })
        return
      }
      chart.setOption({
        tooltip: { trigger: 'axis', formatter: p => `${p[0].axisValue}<br/>体重：${p[0].data} kg` },
        // top 需留足：y轴 name「kg」在刻度上方，过小会被容器裁切；max 略抬高避免折线顶穿网格
        grid: { left: 50, right: 20, top: 48, bottom: 40, containLabel: true },
        xAxis: { type: 'category', data: records.map(r => r.date.slice(5)), axisLabel: { fontSize: 11 } },
        yAxis: {
          type: 'value',
          name: 'kg',
          min: v => Math.floor(v.min - 1),
          max: v => Math.ceil(v.max) + 0.5,
          axisLabel: { fontSize: 11 },
        },
        series: [{
          name: '体重', type: 'line', smooth: true,
          data: records.map(r => r.weight),
          itemStyle: { color: '#667eea' },
          areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(102,126,234,0.3)' }, { offset: 1, color: 'rgba(102,126,234,0)' }] } },
        }]
      })
    },

    initWorkoutChart(weekData) {
      const chart = echarts.init(this.$refs.workoutChart)
      this.charts.push(chart)
      chart.setOption({
        tooltip: { trigger: 'axis', formatter: p => `${p[0].name}<br/>训练时长：${p[0].data} 分钟` },
        grid: { left: 50, right: 20, top: 48, bottom: 40, containLabel: true },
        xAxis: { type: 'category', data: weekData.map(d => d.day), axisLabel: { fontSize: 11 } },
        yAxis: { type: 'value', name: '分钟', axisLabel: { fontSize: 11 } },
        series: [{
          name: '训练时长', type: 'bar', barMaxWidth: 40,
          data: weekData.map(d => d.duration),
          itemStyle: {
            color: p => p.data > 0
              ? { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#f093fb' }, { offset: 1, color: '#f5576c' }] }
              : '#eee',
            borderRadius: [4, 4, 0, 0],
          },
        }]
      })
    },

    initDietChart(dietData) {
      const chart = echarts.init(this.$refs.dietChart)
      this.charts.push(chart)
      chart.setOption({
        tooltip: { trigger: 'axis', formatter: p => `${p[0].axisValue}<br/>摄入：${p[0].data} kcal` },
        grid: { left: 60, right: 20, top: 48, bottom: 40, containLabel: true },
        xAxis: { type: 'category', data: dietData.map(d => d.date.slice(5)), axisLabel: { fontSize: 11 } },
        yAxis: { type: 'value', name: 'kcal', axisLabel: { fontSize: 11 } },
        series: [{
          name: '热量摄入', type: 'line', smooth: true,
          data: dietData.map(d => d.calories),
          itemStyle: { color: '#4facfe' },
          areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(79,172,254,0.3)' }, { offset: 1, color: 'rgba(79,172,254,0)' }] } },
        }]
      })
    },

    initTypeChart(typeData) {
      const chart = echarts.init(this.$refs.typeChart)
      this.charts.push(chart)
      if (!typeData.length) {
        chart.setOption({ graphic: [{ type: 'text', left: 'center', top: 'middle', style: { text: '暂无训练记录', fill: '#999', fontSize: 14 } }] })
        return
      }
      chart.setOption({
        tooltip: { trigger: 'item', formatter: '{b}：{c} 次 ({d}%)' },
        legend: { bottom: 0, itemWidth: 12, itemHeight: 12, textStyle: { fontSize: 12 } },
        series: [{
          name: '训练类型', type: 'pie', radius: ['40%', '65%'],
          center: ['50%', '45%'],
          data: typeData.map(t => ({ name: t.type || '其他', value: t.count })),
          label: { show: false },
          emphasis: { label: { show: true, fontSize: 13, fontWeight: 'bold' } },
        }]
      })
    },
  }
}
</script>

<style scoped>
.dashboard { min-height: 100%; }

.overview-card { display: flex; align-items: center; }
.overview-card .el-card__body { display: flex; align-items: center; gap: 16px; padding: 16px 20px; width: 100%; }

.card-icon {
  width: 52px; height: 52px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.card-icon i { font-size: 24px; color: #fff; }

.card-body { flex: 1; min-width: 0; }
.card-value { font-size: 24px; font-weight: bold; color: #303133; line-height: 1.2; }
.card-label { font-size: 13px; color: #909399; margin-top: 4px; }

.chart-header { display: flex; align-items: center; justify-content: space-between; }
.chart-sub { font-size: 12px; color: #909399; font-weight: normal; }
</style>
