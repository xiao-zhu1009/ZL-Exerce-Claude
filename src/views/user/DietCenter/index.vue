<template>
  <div class="diet-center">
    <el-tabs v-model="activeTab" type="border-card">
      <el-tab-pane label="我的饮食计划" name="dietPlans" lazy destroy-on-hide>
        <diet-plan />
      </el-tab-pane>
      <el-tab-pane label="饮食记录" name="record" lazy destroy-on-hide>
        <diet-record ref="dietRecord" />
      </el-tab-pane>
      <el-tab-pane label="食物库" name="foods" lazy>
        <food-library @record-added="onFoodRecordAdded" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import DietPlan from './DietPlan.vue'
import DietRecord from './DietRecord.vue'
import FoodLibrary from './FoodLibrary.vue'

export default {
  name: 'DietCenter',
  components: {
    DietPlan,
    DietRecord,
    FoodLibrary,
  },
  data() {
    return {
      activeTab: 'dietPlans',
    }
  },
  methods: {
    onFoodRecordAdded({ record_date }) {
      const panel = this.$refs.dietRecord
      if (!panel) return
      if (typeof panel.isViewingDate === 'function' && !panel.isViewingDate(record_date)) return
      if (typeof panel.fetchRecords === 'function') panel.fetchRecords()
    },
  },
}
</script>
