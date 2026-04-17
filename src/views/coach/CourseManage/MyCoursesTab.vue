<template>
  <div>
    <el-button type="primary" icon="el-icon-plus" @click="$emit('open-dialog')" style="margin-bottom:16px">发布课程</el-button>
    <el-table :data="list" v-loading="loading" border fit>
      <el-table-column prop="title" label="课程名称" min-width="150" show-overflow-tooltip />
      <el-table-column prop="category" label="类型" min-width="70" />
      <el-table-column prop="start_time" label="开始时间" min-width="150" />
      <el-table-column label="价格" min-width="70">
        <template slot-scope="scope">{{ scope.row.price === '0.00' ? '免费' : '¥' + scope.row.price }}</template>
      </el-table-column>
      <el-table-column label="名额" min-width="70">
        <template slot-scope="scope">{{ scope.row.enrolled }}/{{ scope.row.max_people }}</template>
      </el-table-column>
      <el-table-column label="状态" min-width="80">
        <template slot-scope="scope">
          <el-tag :type="statusType(scope.row.status)" size="small">{{ statusLabel(scope.row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="180">
        <template slot-scope="scope">
          <el-button v-if="scope.row.status === 4" size="mini" type="warning" @click="$emit('open-dialog', scope.row)">修改</el-button>
          <el-button
            v-if="scope.row.status === 0 || scope.row.status === 4"
            size="mini"
            type="danger"
            @click="$emit('remove-course', scope.row)"
          >删除</el-button>
          <el-badge :value="scope.row.pending_count" :hidden="!scope.row.pending_count" style="margin-left:4px">
            <el-button
              v-if="scope.row.status === 1 || scope.row.status === 2"
              size="mini"
              @click="$emit('view-reservations', scope.row)"
            >预约列表</el-button>
          </el-badge>
        </template>
      </el-table-column>
    </el-table>
    <el-empty v-if="!loading && list.length === 0" description="暂无课程" />
  </div>
</template>

<script>
export default {
  name: 'MyCoursesTab',
  props: {
    list: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
    statusLabel: {
      type: Function,
      required: true,
    },
    statusType: {
      type: Function,
      required: true,
    },
  },
}
</script>
