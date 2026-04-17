<template>
    <div>
      <!-- 状态筛选 -->
      <el-card style="margin-bottom:16px">
        <el-radio-group v-model="filterStatus" @change="fetchList">
          <el-radio-button :label="null">全部</el-radio-button>
          <el-radio-button :label="0">待审核</el-radio-button>
          <el-radio-button :label="1">已通过</el-radio-button>
          <el-radio-button :label="2">已驳回</el-radio-button>
        </el-radio-group>
      </el-card>
  
      <el-table :data="list" v-loading="loading" border fit size="small">
        <el-table-column prop="name" label="食物名称" min-width="120" />
        <el-table-column prop="category" label="分类" min-width="80" />
        <el-table-column prop="unit" label="单位" min-width="60" />
        <el-table-column label="热量(kcal)" min-width="90">
          <template slot-scope="scope"><b style="color:#409EFF">{{ scope.row.calories }}</b></template>
        </el-table-column>
        <el-table-column label="蛋白质(g)" min-width="90">
          <template slot-scope="scope"><span style="color:#67C23A">{{ scope.row.protein }}</span></template>
        </el-table-column>
        <el-table-column label="碳水(g)" min-width="80">
          <template slot-scope="scope"><span style="color:#E6A23C">{{ scope.row.carbs }}</span></template>
        </el-table-column>
        <el-table-column label="脂肪(g)" min-width="80">
          <template slot-scope="scope"><span style="color:#F56C6C">{{ scope.row.fat }}</span></template>
        </el-table-column>
        <el-table-column label="状态" min-width="90">
          <template slot-scope="scope">
            <el-tag :type="statusType(scope.row.status)" size="small">{{ scope.row.status_label }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="驳回原因" min-width="140" show-overflow-tooltip>
          <template slot-scope="scope">
            <span style="color:#F56C6C">{{ scope.row.reject_reason }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="投稿时间" min-width="140" />
        <el-table-column label="操作" min-width="160">
          <template slot-scope="scope">
            <template v-if="scope.row.status === 0">
              <el-button size="mini" type="success" @click="approve(scope.row)">通过</el-button>
              <el-button size="mini" type="danger" @click="openReject(scope.row)">驳回</el-button>
            </template>
            <span v-else style="color:#c0c4cc;font-size:12px">已处理</span>
          </template>
        </el-table-column>
      </el-table>
  
      <!-- 驳回弹窗 -->
      <el-dialog title="驳回原因" :visible.sync="rejectVisible" width="400px">
        <el-input v-model="rejectReason" type="textarea" :rows="4" placeholder="请填写驳回原因（将通知教练）" />
        <div slot="footer">
          <el-button @click="rejectVisible = false">取消</el-button>
          <el-button type="danger" :loading="operating" @click="confirmReject">确认驳回</el-button>
        </div>
      </el-dialog>
    </div>
  </template>
  
  <script>
  import { getAdminFoods, approveFood, rejectFood } from '@/api/diet'
  
  export default {
    name: 'FoodReview',
    data() {
      return {
        filterStatus: null,
        list: [],
        loading: false,
        rejectVisible: false,
        rejectReason: '',
        currentFood: null,
        operating: false,
      }
    },
    created() { this.fetchList() },
    methods: {
      async fetchList() {
        this.loading = true
        try {
          const res = await getAdminFoods(this.filterStatus !== null ? this.filterStatus : undefined)
          this.list = res.data || []
        } finally { this.loading = false }
      },
  
      async approve(row) {
        await this.$confirm(`确认通过「${row.name}」？通过后将进入系统食物库。`, '确认', { type: 'success' })
        const res = await approveFood(row.id)
        if (res.code === 200) {
          this.$message.success('已通过')
          this.fetchList()
        } else {
          this.$message.error(res.msg || '操作失败')
        }
      },
  
      openReject(row) {
        this.currentFood = row
        this.rejectReason = ''
        this.rejectVisible = true
      },
  
      async confirmReject() {
        if (!this.rejectReason.trim()) return this.$message.warning('请填写驳回原因')
        this.operating = true
        try {
          const res = await rejectFood(this.currentFood.id, this.rejectReason.trim())
          if (res.code === 200) {
            this.$message.success('已驳回')
            this.rejectVisible = false
            this.fetchList()
          } else {
            this.$message.error(res.msg || '操作失败')
          }
        } finally { this.operating = false }
      },
  
      statusType(s) { return { 0: 'info', 1: 'success', 2: 'danger' }[s] || 'info' }
    }
  }
  </script>
  