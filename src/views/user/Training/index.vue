<template>
  <div class="training-center">
    <el-tabs v-model="activeTab" type="border-card">
      <el-tab-pane label="训练记录" name="log" lazy>
        <workout-log />
      </el-tab-pane>
      <el-tab-pane label="身体记录" name="body" lazy>
        <body-record />
      </el-tab-pane>
      <el-tab-pane label="训练计划" name="plan" lazy>
        <training-plan />
      </el-tab-pane>
      <el-tab-pane label="数据统计" name="chart" lazy>
        <training-chart />
      </el-tab-pane>
      <el-tab-pane label="动作库" name="actions" lazy>
        <action-library-panel />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import WorkoutLog from "./WorkoutLog.vue";
import TrainingPlan from "./TrainingPlan.vue";
import TrainingChart from "./TrainingChart.vue";
import ActionLibraryPanel from "./ActionLibraryPanel.vue";
import BodyRecord from "./BodyRecord.vue";

export default {
  name: "TrainingCenter",
  components: {
    WorkoutLog,
    TrainingPlan,
    TrainingChart,
    ActionLibraryPanel,
    BodyRecord,
  },
  data() {
    return {
      activeTab: "log",
    };
  },
  created() {
    this.initActiveTabFromQuery();
  },
  methods: {
    // 仅处理从动作详情返回时带回的 ?tab=actions，手动切换 tab 不再改 URL
    initActiveTabFromQuery() {
      const { tab, ...restQuery } = this.$route.query;
      if (tab === "actions") {
        this.activeTab = tab;
        // 读取一次后清理 tab 参数，避免后续 URL 一直保留 tab
        this.$router.replace({ query: restQuery }).catch(() => {});
      }
    },
  },
};
</script>

<style scoped>
.page-header {
  margin-bottom: 16px;
}
.page-header h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}
</style>
