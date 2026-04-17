<template>
  <el-table :data="students" v-loading="loading" border fit>
    <el-table-column prop="nickname" label="学员昵称" min-width="100" />
    <el-table-column prop="goal" label="训练目标" min-width="120" show-overflow-tooltip />
    <el-table-column prop="bind_at" label="绑定时间" min-width="130">
      <template slot-scope="scope">
        {{ scope.row.bind_at ? scope.row.bind_at.slice(0, 10) : '-' }}
      </template>
    </el-table-column>
    <el-table-column label="操作" min-width="160">
      <template slot-scope="scope">
        <el-button size="mini" type="primary" @click="$emit('view-detail', scope.row.id)">查看详情</el-button>
        <el-button size="mini" type="danger" @click="$emit('end-bind', scope.row)">解绑</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
export default {
  name: 'MyStudents',
  props: {
    students: {
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
