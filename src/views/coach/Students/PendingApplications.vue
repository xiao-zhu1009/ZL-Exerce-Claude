<template>
  <el-table :data="requests" v-loading="loading" border fit>
    <el-table-column prop="nickname" label="学员昵称" min-width="100" />
    <el-table-column prop="request_msg" label="申请留言" min-width="180" show-overflow-tooltip />
    <el-table-column prop="created_at" label="申请时间" min-width="130">
      <template slot-scope="scope">
        {{ scope.row.created_at ? scope.row.created_at.slice(0, 10) : '-' }}
      </template>
    </el-table-column>
    <el-table-column label="操作" min-width="160">
      <template slot-scope="scope">
        <el-button size="mini" type="success" @click="$emit('approve', scope.row)">同意</el-button>
        <el-button size="mini" type="danger" @click="$emit('reject', scope.row)">拒绝</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
export default {
  name: 'PendingApplications',
  props: {
    requests: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
}
</script>
