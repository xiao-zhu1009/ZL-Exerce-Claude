<template>
    <div>
      <!-- 状态筛选 -->
      <el-card style="margin-bottom:16px">
        <el-radio-group v-model="filterStatus" @change="fetchList">
          <el-radio-button :label="null">全部</el-radio-button>
          <el-radio-button :label="0">待审核</el-radio-button>
          <el-radio-button :label="1">已上线</el-radio-button>
          <el-radio-button :label="2">已驳回</el-radio-button>
          <el-radio-button :label="3">已下架</el-radio-button>
        </el-radio-group>
      </el-card>

      <el-table :data="list" v-loading="loading" border fit>
        <el-table-column prop="title" label="文章标题" min-width="160" show-overflow-tooltip />
        <el-table-column prop="category" label="分类" min-width="80" />
        <el-table-column prop="author_name" label="投稿教练" min-width="90" />
        <el-table-column prop="created_at" label="投稿时间" min-width="150" />
        <el-table-column label="状态" min-width="80">
          <template slot-scope="scope">
            <el-tag :type="statusType(scope.row.status)" size="small">{{ statusLabel(scope.row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="200">
          <template slot-scope="scope">
            <el-button size="mini" @click="preview(scope.row)">预览</el-button>
            <el-button v-if="scope.row.status === 0" size="mini" type="success" @click="approve(scope.row)">通过</el-button>
            <el-button v-if="scope.row.status === 0" size="mini" type="danger" @click="openReject(scope.row)">驳回</el-button>
            <el-button v-if="scope.row.status === 1" size="mini" type="warning" @click="offline(scope.row)">下架</el-button>
          </template>
        </el-table-column>
      </el-table>
  
      <div style="text-align:center;margin-top:16px" v-if="total > pageSize">
        <el-pagination background layout="prev, pager, next" :total="total" :page-size="pageSize" :current-page="page" @current-change="onPageChange" />
      </div>
  
      <!-- 驳回弹窗 -->
      <el-dialog title="驳回原因" :visible.sync="rejectVisible" width="400px">
        <el-input v-model="rejectReason" type="textarea" :rows="4" placeholder="请填写驳回原因（将通知教练）" />
        <div slot="footer">
          <el-button @click="rejectVisible = false">取消</el-button>
          <el-button type="danger" :loading="operating" @click="confirmReject">确认驳回</el-button>
        </div>
      </el-dialog>
  
      <!-- 文章预览弹窗 -->
      <el-dialog :title="previewData.title" :visible.sync="previewVisible" width="700px">
        <div v-loading="previewLoading">
          <div style="margin-bottom:12px">
            <el-tag size="small">{{ previewData.category }}</el-tag>
            <span style="color:#999;font-size:13px;margin-left:12px">{{ previewData.author_name }} · {{ previewData.created_at }}</span>
          </div>
          <img v-if="previewData.cover_img" :src="imgUrl(previewData.cover_img)" style="width:100%;max-height:200px;object-fit:cover;border-radius:4px;margin-bottom:12px" />
          <p v-if="previewData.summary" style="color:#666;margin-bottom:12px">{{ previewData.summary }}</p>
          <div class="article-content" v-html="previewData.content" />
        </div>
      </el-dialog>
    </div>
  </template>
  
  <script>
  import { getAdminArticles, getArticleDetail, reviewArticle, offlineArticle } from '@/api/admin'
  
  const BASE = process.env.VUE_APP_API_BASE || 'http://127.0.0.1:8009/api'
  
  export default {
    name: 'ArticleReview',
    data() {
      return {
        loading: false,
        list: [],
        total: 0,
        page: 1,
        pageSize: 20,
        filterStatus: null,
        // 驳回
        rejectVisible: false,
        rejectReason: '',
        currentId: null,
        operating: false,
        // 预览
        previewVisible: false,
        previewLoading: false,
        previewData: {}
      }
    },
    created() { this.fetchList() },
    methods: {
      async fetchList() {
        this.loading = true
        try {
          const params = { page: this.page, page_size: this.pageSize }
          if (this.filterStatus !== null) params.status = this.filterStatus
          const res = await getAdminArticles(params)
          this.list = res.data.list
          this.total = res.data.total
        } finally { this.loading = false }
      },
  
      onPageChange(p) { this.page = p; this.fetchList() },
  
      async approve(row) {
        await this.$confirm(`确认通过文章《${row.title}》？`, '提示', { type: 'success' })
        const res = await reviewArticle(row.id, { status: 1 })
        if (res.code === 200) { this.$message.success('已通过'); this.fetchList() }
        else this.$message.error(res.message || '操作失败')
      },
  
      openReject(row) { this.currentId = row.id; this.rejectReason = ''; this.rejectVisible = true },
  
      async confirmReject() {
        if (!this.rejectReason.trim()) return this.$message.warning('请填写驳回原因')
        this.operating = true
        try {
          const res = await reviewArticle(this.currentId, { status: 2, reject_reason: this.rejectReason })
          if (res.code === 200) {
            this.$message.success('已驳回')
            this.rejectVisible = false
            this.fetchList()
          } else {
            this.$message.error(res.message || '操作失败')
          }
        } finally { this.operating = false }
      },
  
      async offline(row) {
        await this.$confirm(`确认下架文章《${row.title}》？`, '提示', { type: 'warning' })
        const res = await offlineArticle(row.id)
        if (res.code === 200) { this.$message.success('已下架'); this.fetchList() }
        else this.$message.error(res.message || '操作失败')
      },
  
      async preview(row) {
        this.previewData = {}
        this.previewVisible = true
        this.previewLoading = true
        try {
          const res = await getArticleDetail(row.id)
          if (res.code === 200) this.previewData = res.data
        } finally { this.previewLoading = false }
      },
  
      imgUrl(path) { return `${BASE}/static/${path}` },
      statusLabel(s) { return ['待审核', '已上线', '已驳回', '已下架'][s] ?? '未知' },
      statusType(s) { return ['warning', 'success', 'danger', 'info'][s] ?? '' }
    }
  }
  </script>
  
  <style scoped>
  .article-content { line-height: 1.8; color: #333; }
  .article-content img { max-width: 100%; }
  </style>
  