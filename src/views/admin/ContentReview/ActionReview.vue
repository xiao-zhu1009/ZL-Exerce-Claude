<template>
  <div>
    <h2 style="margin-bottom:20px">动作审核</h2>
    <el-table :data="list" v-loading="loading" border>
      <el-table-column prop="title" label="动作名称" />
      <el-table-column prop="body_part" label="部位" width="70" />
      <el-table-column prop="category" label="类型" width="70" />
      <el-table-column label="难度" width="70">
        <template slot-scope="scope">{{ ['', '初级', '中级', '高级'][scope.row.difficulty] }}</template>
      </el-table-column>
      <el-table-column prop="author_name" label="投稿教练" width="100" />
      <el-table-column prop="created_at" label="投稿时间" width="120" />
      <el-table-column label="操作" width="220">
        <template slot-scope="scope">
          <el-button size="mini" type="success" @click="approve(scope.row)">通过</el-button>
          <el-button size="mini" type="danger" @click="openReject(scope.row)">驳回</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog title="驳回原因" :visible.sync="rejectVisible" width="400px">
      <el-input v-model="rejectReason" type="textarea" :rows="4" placeholder="请填写驳回原因（将通知教练）" />
      <div slot="footer">
        <el-button @click="rejectVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmReject">确认驳回</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getPendingActions, reviewAction } from '../../../api/admin'

export default {
  name: 'ActionReview',
  data() { return { loading: false, list: [], rejectVisible: false, rejectReason: '', currentId: null } },
  created() { this.fetchList() },
  methods: {
    async fetchList() {
      this.loading = true
      try {
        // TODO: 对接后端 GET /admin/actions/pending
        const res = await getPendingActions()
        this.list = res.data
      } finally { this.loading = false }
    },
    async approve(row) {
      // TODO: 对接后端 PUT /admin/actions/:id/review { status: 1 }
      await reviewAction(row.id, { status: 1 })
      this.list = this.list.filter(a => a.id !== row.id)
      this.$message.success('已通过')
    },
    openReject(row) { this.currentId = row.id; this.rejectReason = ''; this.rejectVisible = true },
    async confirmReject() {
      if (!this.rejectReason) return this.$message.warning('请填写驳回原因')
      // TODO: 对接后端 PUT /admin/actions/:id/review { status: 2, reject_reason }
      await reviewAction(this.currentId, { status: 2, reject_reason: this.rejectReason })
      this.list = this.list.filter(a => a.id !== this.currentId)
      this.rejectVisible = false
      this.$message.success('已驳回')
    }
  }
}
</script>
