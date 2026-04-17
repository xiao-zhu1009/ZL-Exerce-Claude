<template>
  <div>
    <div v-if="!currentCourse" class="empty-wrap">
      <el-empty description="请选择课程查看预约审批" />
    </div>
    <template v-else>
      <div class="header-row">
        <span class="course-title">当前课程：{{ currentCourse.title }}</span>
      </div>

      <el-table :data="reservations" v-loading="loading" border fit>
        <el-table-column prop="student_name" label="学员" min-width="120" />
        <el-table-column prop="phone" label="手机号" min-width="120" />
        <el-table-column prop="reserve_note" label="备注" min-width="180" show-overflow-tooltip />
        <el-table-column prop="created_at" label="预约时间" min-width="160" />
        <el-table-column label="状态" min-width="90">
          <template slot-scope="scope">
            <el-tag :type="reserveStatusType(scope.row.status)" size="small">
              {{ reserveStatusLabel(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="160">
          <template slot-scope="scope">
            <el-button
              v-if="scope.row.status === 1"
              size="mini"
              type="success"
              @click="$emit('approve', scope.row, 2)"
            >
              通过
            </el-button>
            <el-button
              v-if="scope.row.status === 1"
              size="mini"
              type="danger"
              @click="$emit('open-reject', scope.row)"
            >
              拒绝
            </el-button>
            <span v-if="scope.row.status === 3 && scope.row.cancel_reason" class="reject-reason">
              原因：{{ scope.row.cancel_reason }}
            </span>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="!loading && reservations.length === 0" description="暂无预约记录" />
    </template>
  </div>
</template>

<script>
export default {
  name: 'ReservationApprovalTab',
  props: {
    currentCourse: {
      type: Object,
      default: null,
    },
    reservations: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
    reserveStatusLabel: {
      type: Function,
      required: true,
    },
    reserveStatusType: {
      type: Function,
      required: true,
    },
  },
}
</script>

<style scoped>
.empty-wrap {
  padding: 20px 0;
}

.header-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.course-title {
  color: #606266;
}

.reject-reason {
  color: #f56c6c;
  font-size: 12px;
}
</style>
