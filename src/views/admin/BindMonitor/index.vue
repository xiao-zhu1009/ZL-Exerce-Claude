<template>
  <div>
    <h2 style="margin-bottom:20px">教练-学员绑定监管</h2>

    <!-- 统计卡片 -->
    <el-row :gutter="16" style="margin-bottom:24px" v-loading="statsLoading">
      <el-col :span="8">
        <el-card shadow="never">
          <div style="text-align:center">
            <div style="font-size:32px;font-weight:bold;color:#409EFF">{{ stats.active || 0 }}</div>
            <div style="color:#909399;margin-top:4px">当前绑定中</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never">
          <div style="text-align:center">
            <div style="font-size:32px;font-weight:bold;color:#E6A23C">{{ stats.pending || 0 }}</div>
            <div style="color:#909399;margin-top:4px">待处理申请</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never">
          <div style="text-align:center">
            <div style="font-size:32px;font-weight:bold;color:#909399">{{ stats.ended || 0 }}</div>
            <div style="color:#909399;margin-top:4px">历史解绑</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 教练维度统计表 -->
    <el-card shadow="never">
      <div slot="header" style="font-weight:bold">教练维度统计</div>
      <el-table :data="coachList" v-loading="listLoading" border fit>
        <el-table-column prop="coach_id" label="ID" width="60" />
        <el-table-column prop="nickname" label="教练昵称" min-width="120" />
        <el-table-column prop="student_count" label="当前学员数" min-width="110" align="center" />
        <el-table-column prop="plan_count" label="下发计划数" min-width="110" align="center" />
      </el-table>
      <el-pagination
        v-if="total > pageSize"
        background layout="prev,pager,next"
        :total="total" :page-size="pageSize" :current-page="page"
        style="margin-top:16px;text-align:right"
        @current-change="onPageChange"
      />
    </el-card>
  </div>
</template>

<script>
import { getBindStats, getCoachSummary } from '@/api/coachBind'

export default {
  name: 'BindMonitor',
  data() {
    return {
      statsLoading: false,
      stats: {},
      listLoading: false,
      coachList: [],
      page: 1,
      pageSize: 20,
      total: 0,
    }
  },
  created() {
    this.fetchStats()
    this.fetchCoachList()
  },
  methods: {
    async fetchStats() {
      this.statsLoading = true
      try {
        const res = await getBindStats()
        this.stats = res.data || {}
      } finally { this.statsLoading = false }
    },
    async fetchCoachList() {
      this.listLoading = true
      try {
        const res = await getCoachSummary({ page: this.page, page_size: this.pageSize })
        const d = res.data || {}
        this.coachList = d.list || []
        this.total = d.total || 0
      } finally { this.listLoading = false }
    },
    onPageChange(p) {
      this.page = p
      this.fetchCoachList()
    },
  }
}
</script>
