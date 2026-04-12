<template>
  <div>
    <h2 style="margin-bottom:20px">动作管理</h2>

    <!-- Tab 切换：按状态分类查看 -->
    <el-tabs v-model="activeTab" @tab-click="onTabChange">
      <el-tab-pane label="待审核" name="0" />
      <el-tab-pane label="已上线" name="1" />
      <el-tab-pane label="已驳回" name="2" />
      <el-tab-pane label="已下架" name="3" />
    </el-tabs>

    <el-table :data="list" v-loading="loading" style="width: 100%" fit border>
      <el-table-column prop="title" label="动作名称" min-width="120" />
      <el-table-column prop="body_part" label="部位" min-width="120" />
      <el-table-column prop="category" label="类型" min-width="120" />
      <el-table-column label="难度" min-width="120">
        <template slot-scope="scope">{{ ['', '初级', '中级', '高级'][scope.row.difficulty] }}</template>
      </el-table-column>
      <el-table-column prop="author_name" label="投稿教练" min-width="120" />
      <el-table-column prop="created_at" label="投稿时间" min-width="120" />
      <el-table-column label="操作" min-width="250">
        <template slot-scope="scope">
          <el-button size="mini" @click="openPreview(scope.row)">预览</el-button>
          <!-- 待审核：通过 / 驳回 -->
          <template v-if="scope.row.status === 0">
            <el-button size="mini" type="success" @click="approve(scope.row)">通过</el-button>
            <el-button size="mini" type="danger" @click="openReject(scope.row)">驳回</el-button>
          </template>
          <!-- 已上线：下架 -->
          <el-button
            v-if="scope.row.status === 1"
            size="mini"
            type="warning"
            @click="handleOffline(scope.row)"
          >下架</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div style="text-align:center;margin-top:16px" v-if="total > pageSize">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="total"
        :page-size="pageSize"
        :current-page="page"
        @current-change="onPageChange"
      />
    </div>

    <!-- 驳回弹窗 -->
    <el-dialog title="驳回原因" :visible.sync="rejectVisible" width="420px">
      <el-input v-model="rejectReason" type="textarea" :rows="4" placeholder="请填写驳回原因（将通知教练）" />
      <div slot="footer">
        <el-button @click="rejectVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmReject">确认驳回</el-button>
      </div>
    </el-dialog>

    <!-- 动作详情预览弹窗 -->
    <el-dialog title="动作详情预览" :visible.sync="previewVisible" width="600px">
      <div v-if="previewAction">
        <div style="margin-bottom:12px">
          <el-tag>{{ previewAction.body_part }}</el-tag>
          <el-tag type="success" style="margin-left:8px">{{ previewAction.category }}</el-tag>
          <el-tag :type="difficultyType(previewAction.difficulty)" style="margin-left:8px">
            {{ difficultyLabel(previewAction.difficulty) }}
          </el-tag>
          <span style="margin-left:12px;color:#999;font-size:13px">
            投稿：{{ previewAction.author_name }}
          </span>
        </div>
        <p style="color:#666;line-height:1.8">{{ previewAction.description }}</p>
        <el-divider content-position="left">动作步骤</el-divider>
        <ol style="padding-left:20px;line-height:2">
          <li v-for="(s, i) in (previewAction.steps || [])" :key="i">{{ s }}</li>
        </ol>
        <el-divider content-position="left">注意事项</el-divider>
        <div
          v-for="(c, i) in (previewAction.cautions || [])"
          :key="i"
          style="color:#E6A23C;line-height:2"
        >⚠️ {{ c }}</div>
        <!-- 驳回原因（已驳回状态才显示） -->
        <div
          v-if="previewAction.reject_reason"
          style="margin-top:12px;padding:8px;background:#fff5f5;border-radius:4px;color:#F56C6C;font-size:13px"
        >
          驳回原因：{{ previewAction.reject_reason }}
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getAdminActions, reviewAction, offlineAction } from '@/api/admin'

export default {
  name: 'ActionReview',
  data() {
    return {
      loading: false,
      list: [],
      total: 0,
      page: 1,
      pageSize: 20,
      activeTab: '0',       // 当前 Tab，对应 status 值
      rejectVisible: false,
      rejectReason: '',
      currentId: null,
      previewVisible: false,
      previewAction: null   // 当前预览的动作数据
    }
  },
  created() {
    this.fetchList()
  },
  methods: {
    async fetchList() {
      this.loading = true
      try {
        const res = await getAdminActions({ status: Number(this.activeTab), page: this.page, page_size: this.pageSize })
        this.list = res.data.list
        this.total = res.data.total
      } finally {
        this.loading = false
      }
    },
    onTabChange() {
      this.page = 1  // 切换 Tab 重置分页
      this.fetchList()
    },
    onPageChange(p) {
      this.page = p
      this.fetchList()
    },
    openPreview(row) {
      this.previewAction = row
      this.previewVisible = true
    },
    async approve(row) {
      await reviewAction(row.id, { status: 1 })
      this.$message.success('已通过')
      this.fetchList()
    },
    openReject(row) {
      this.currentId = row.id
      this.rejectReason = ''
      this.rejectVisible = true
    },
    async confirmReject() {
      if (!this.rejectReason) return this.$message.warning('请填写驳回原因')
      await reviewAction(this.currentId, { status: 2, reject_reason: this.rejectReason })
      this.rejectVisible = false
      this.$message.success('已驳回')
      this.fetchList()
    },
    async handleOffline(row) {
      await this.$confirm(`确认下架《${row.title}》？`, '提示', { type: 'warning' })
      await offlineAction(row.id)
      this.$message.success('已下架')
      this.fetchList()
    },
    difficultyLabel(d) { return ['', '初级', '中级', '高级'][d] },
    difficultyType(d) { return ['', 'success', 'warning', 'danger'][d] }
  }
}
</script>
