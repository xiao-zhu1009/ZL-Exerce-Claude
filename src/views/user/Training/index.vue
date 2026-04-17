<template>
  <div class="training-center">
    <el-tabs v-model="activeTab" type="border-card" @tab-click="onMainTabClick">
      <el-tab-pane label="训练记录" name="log">
        <workout-log />
      </el-tab-pane>
      <el-tab-pane label="身体记录" name="body">
        <body-record />
      </el-tab-pane>
      <el-tab-pane label="训练计划" name="plan">
        <training-plan />
      </el-tab-pane>
      <el-tab-pane label="数据统计" name="chart">
        <training-chart />
      </el-tab-pane>
      <el-tab-pane label="动作库" name="actions" lazy>
        <action-library-panel ref="actionPanel" />
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
  watch: {
    "$route.query.tab": {
      immediate: true,
      handler() {
        this.applyRouteTab();
      },
    },
    activeTab(val) {
      if (val === "actions") {
        this.$nextTick(() => {
          if (this.$refs.actionPanel) this.$refs.actionPanel.ensureLoaded();
        });
      }
    },
  },
  created() {
    this.applyRouteTab();
  },
  mounted() {
    // created 阶段 lazy 子组件未挂载，若初始 tab 已是 actions 需在 mounted 补触发
    if (this.activeTab === "actions") {
      this.$nextTick(() => {
        if (this.$refs.actionPanel) this.$refs.actionPanel.ensureLoaded();
      });
    }
  },
  methods: {
    applyRouteTab() {
      const t = (this.$route.query.tab || "").toString();
      if (t === "actions") this.activeTab = "actions";
    },
    onMainTabClick(tab) {
      if (tab.name === "actions") {
        this.$refs.actionPanel && this.$refs.actionPanel.ensureLoaded();
      }
      const q = { ...this.$route.query };
      if (tab.name === "actions") {
        q.tab = "actions";
      } else {
        delete q.tab;
      }
      const same = JSON.stringify(q) === JSON.stringify(this.$route.query);
      if (!same) {
        this.$router
          .replace({ path: "/user/training", query: q })
          .catch(() => {});
      }
    },
  },
};
</script>

<style scoped>
/* .training-center {
  padding: 20px;
} */
.page-header {
  margin-bottom: 16px;
}
.page-header h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}
</style>
