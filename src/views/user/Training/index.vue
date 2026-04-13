<template>
  <div class="training-center">
    <div class="page-header">
      <h2>训练中心</h2>
    </div>

    <el-tabs v-model="activeTab" type="border-card">
      <el-tab-pane label="训练记录" name="log">
        <workout-log />
      </el-tab-pane>
      <el-tab-pane label="训练计划" name="plan">
        <training-plan />
      </el-tab-pane>
      <el-tab-pane label="数据统计" name="chart">
        <training-chart />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import WorkoutLog from './WorkoutLog.vue'
import TrainingPlan from './TrainingPlan.vue'
import TrainingChart from './TrainingChart.vue'

export default {
  name: 'TrainingCenter',
  components: { WorkoutLog, TrainingPlan, TrainingChart },
  data() {
    return {
      activeTab: 'log'
    }
  }
}
</script>

<style scoped>
.training-center {
  padding: 20px;
}
.page-header {
  margin-bottom: 16px;
}
.page-header h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}
</style>
