<template>
  <div class="training-chart">
    <!-- 时间范围切换 -->
    <div class="toolbar">
      <span class="label">趋势图范围：</span>
      <el-radio-group v-model="trendDays" size="small" @change="fetchTrend">
        <el-radio-button :label="7">近7天</el-radio-button>
        <el-radio-button :label="14">近14天</el-radio-button>
        <el-radio-button :label="30">近30天</el-radio-button>
      </el-radio-group>
      <span class="label" style="margin-left: 24px">类型分布范围：</span>
      <el-radio-group v-model="typeDays" size="small" @change="fetchType">
        <el-radio-button :label="7">近7天</el-radio-button>
        <el-radio-button :label="30">近30天</el-radio-button>
        <el-radio-button :label="90">近90天</el-radio-button>
      </el-radio-group>
    </div>

    <div class="charts-row">
      <!-- 训练时长柱状图 -->
      <div class="chart-wrap">
        <div class="chart-title">训练时长（分钟）</div>
        <div ref="durationChart" class="chart" />
      </div>
      <!-- 卡路里折线图 -->
      <div class="chart-wrap">
        <div class="chart-title">卡路里消耗（kcal）</div>
        <div ref="caloriesChart" class="chart" />
      </div>
      <!-- 训练类型饼图 -->
      <div class="chart-wrap">
        <div class="chart-title">训练类型分布</div>
        <div ref="typeChart" class="chart" />
      </div>
    </div>
  </div>
</template>

<script>
import echarts from "echarts";
import { getDailyStats, getTypeStats } from "@/api/training";

export default {
  name: "TrainingChart",
  data() {
    return {
      trendDays: 7,
      typeDays: 30,
      durationChart: null,
      caloriesChart: null,
      typeChart: null,
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.initCharts();
      this.fetchTrend();
      this.fetchType();
    });
    this._onWinResize = () => this.resizeCharts();
    window.addEventListener("resize", this._onWinResize);
    if (typeof ResizeObserver !== "undefined") {
      this._chartResizeObserver = new ResizeObserver(() =>
        this.resizeCharts(),
      );
      this._chartResizeObserver.observe(this.$el);
    }
  },
  beforeDestroy() {
    window.removeEventListener("resize", this._onWinResize);
    if (this._chartResizeObserver) {
      this._chartResizeObserver.disconnect();
      this._chartResizeObserver = null;
    }
    // 销毁 ECharts 实例，防止内存泄漏
    [this.durationChart, this.caloriesChart, this.typeChart].forEach(
      (c) => c && c.dispose(),
    );
  },
  methods: {
    resizeCharts() {
      [this.durationChart, this.caloriesChart, this.typeChart].forEach(
        (c) => c && c.resize(),
      );
    },
    initCharts() {
      this.durationChart = echarts.init(this.$refs.durationChart);
      this.caloriesChart = echarts.init(this.$refs.caloriesChart);
      this.typeChart = echarts.init(this.$refs.typeChart);
      this.$nextTick(() => this.resizeCharts());
    },
    async fetchTrend() {
      const res = await getDailyStats(this.trendDays);
      const list = res.data || [];
      const dates = list.map((d) => d.date.slice(5)); // 截取 MM-DD
      const durations = list.map((d) => d.duration);
      const calories = list.map((d) => d.calories);

      this.durationChart.setOption({
        tooltip: { trigger: "axis" },
        xAxis: { type: "category", data: dates, axisLabel: { rotate: 30 } },
        yAxis: { type: "value", name: "分钟" },
        series: [
          {
            name: "训练时长",
            type: "bar",
            data: durations,
            itemStyle: { color: "#409EFF" },
            barMaxWidth: 40,
          },
        ],
        grid: { left: 50, right: 20, bottom: 50 },
      });

      this.caloriesChart.setOption({
        tooltip: { trigger: "axis" },
        xAxis: { type: "category", data: dates, axisLabel: { rotate: 30 } },
        yAxis: { type: "value", name: "kcal" },
        series: [
          {
            name: "卡路里",
            type: "line",
            data: calories,
            smooth: true,
            areaStyle: { opacity: 0.15 },
            itemStyle: { color: "#E6A23C" },
            lineStyle: { color: "#E6A23C" },
          },
        ],
        grid: { left: 55, right: 20, bottom: 50 },
      });
      this.$nextTick(() => this.resizeCharts());
    },
    async fetchType() {
      const res = await getTypeStats(this.typeDays);
      const list = res.data || [];

      this.typeChart.setOption({
        tooltip: { trigger: "item", formatter: "{b}: {c}次 ({d}%)" },
        legend: { bottom: 0, type: "scroll" },
        series: [
          {
            name: "训练类型",
            type: "pie",
            radius: ["40%", "65%"], // 环形饼图
            data: list.length ? list : [{ name: "暂无数据", value: 1 }],
            label: { formatter: "{b}\n{d}%" },
          },
        ],
      });
      this.$nextTick(() => this.resizeCharts());
    },
  },
};
</script>

<style scoped>
/* 根节点占满父级（Tabs 内容区）宽度，子元素 width:100% 才有参照 */
.training-chart {
  width: 100%;
  box-sizing: border-box;
}

.toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}
.label {
  font-size: 13px;
  color: #606266;
}

.charts-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: stretch;
}

/*
  flex 子项默认 min-width:auto，最小宽度≈内容最小宽度，会卡住内部 width:100%。
  卡片自身：flex + min-width:0 + max-width:100%，占满一行分配宽度且可换行收缩。
  卡片内部：column flex，图表容器 width:100% 相对卡片内容区（已含 padding）拉满。
*/
.chart-wrap {
  display: flex;
  flex-direction: column;
  flex: 1 1 280px;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
  background: #fff;
  border-radius: 6px;
  padding: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.chart-title {
  flex: 0 0 auto;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.chart {
  flex: 0 0 auto;
  width: 100%;
  min-width: 0;
  height: 260px;
  box-sizing: border-box;
}
</style>
