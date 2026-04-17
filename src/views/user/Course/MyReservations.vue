<template>
  <div>
    <el-table :data="myReservations" v-loading="loading" border fit>
      <el-table-column prop="course_title" label="课程名称" min-width="150" show-overflow-tooltip />
      <el-table-column prop="coach_name" label="教练" min-width="80" />
      <el-table-column prop="start_time" label="开始时间" min-width="150" />
      <el-table-column prop="location" label="地点" min-width="120" show-overflow-tooltip />
      <el-table-column label="状态" min-width="80">
        <template slot-scope="scope">
          <el-tag :type="reserveStatusType(scope.row.status)" size="small">{{ reserveStatusLabel(scope.row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="80">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.status === 1 || scope.row.status === 2"
            size="mini" type="danger"
            @click="cancelReserve(scope.row)"
          >取消</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-empty v-if="!loading && myReservations.length === 0" description="暂无预约记录" />
  </div>
</template>

<script>
import { getMyReservations, cancelReservation } from '@/api/course'

export default {
  name: 'MyReservations',
  data() {
    return {
      loading: false,
      myReservations: [],
    }
  },
  created() {
    this.fetchReservations()
  },
  methods: {
    async fetchReservations() {
      this.loading = true
      try {
        const res = await getMyReservations()
        this.myReservations = res.data || []
        const reservedSet = new Set(
          this.myReservations.filter(r => r.status === 1 || r.status === 2).map(r => r.course_id)
        )
        this.$emit('reservations-changed', reservedSet.size)
      } finally {
        this.loading = false
      }
    },
    async cancelReserve(row) {
      await this.$confirm('确认取消该预约？', '提示', { type: 'warning' })
      const res = await cancelReservation(row.reservation_id)
      if (res.code === 200) {
        this.$message.success('已取消')
        await this.fetchReservations()
      } else {
        this.$message.error(res.message || '取消失败')
      }
    },
    reserveStatusLabel(s) { return ['已取消', '待审批', '已确认', '已拒绝'][s] ?? '未知' },
    reserveStatusType(s) { return ['info', 'warning', 'success', 'danger'][s] ?? '' }
  }
}
</script>
