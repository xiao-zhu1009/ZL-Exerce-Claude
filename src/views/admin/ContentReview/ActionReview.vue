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
    <el-dialog
      :title="previewAction ? `预览：${previewAction.title}` : '动作详情预览'"
      :visible.sync="previewVisible"
      width="760px"
      top="5vh"
    >
      <!-- 加载中占位 -->
      <div v-if="previewLoading" style="text-align:center;padding:60px 0">
        <i class="el-icon-loading" style="font-size:32px;color:#409EFF" />
        <div style="margin-top:12px;color:#999">加载中...</div>
      </div>

      <div v-else-if="previewAction">
        <!-- 标签行 -->
        <div style="margin-bottom:16px">
          <el-tag>{{ previewAction.body_part }}</el-tag>
          <el-tag type="success" style="margin-left:8px">{{ previewAction.category }}</el-tag>
          <el-tag :type="difficultyType(previewAction.difficulty)" style="margin-left:8px">
            {{ difficultyLabel(previewAction.difficulty) }}
          </el-tag>
          <span style="margin-left:12px;color:#999;font-size:13px">
            投稿：{{ previewAction.author_name }}
          </span>
        </div>

        <el-row :gutter="20">
          <!-- 左列：媒体 + 步骤 -->
          <el-col :span="14">
            <!-- ── 视频/封面图展示区 ──────────────────────────────────────
                 优先展示视频（封面图作为 poster，未播放时显示）；
                 无视频但有封面图则只展示封面图；都没有则显示占位块。
            ──────────────────────────────────────────────────────────── -->
            <video
              v-if="previewAction.video_url"
              :src="mediaUrl(previewAction.video_url)"
              :poster="previewAction.cover_img ? mediaUrl(previewAction.cover_img) : ''"
              controls
              preload="metadata"
              style="width:100%;max-height:280px;border-radius:6px;background:#000;display:block"
            />
            <el-image
              v-else-if="previewAction.cover_img"
              :src="mediaUrl(previewAction.cover_img)"
              fit="cover"
              style="width:100%;max-height:280px;border-radius:6px;display:block"
            >
              <div slot="error" style="height:120px;display:flex;align-items:center;justify-content:center;color:#999;font-size:13px;background:#f5f5f5;border-radius:6px">
                封面图加载失败
              </div>
            </el-image>
            <div
              v-else
              style="height:180px;background:#1a1a1a;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#555;font-size:13px"
            >
              暂无封面图 / 视频
            </div>

            <!-- 动作步骤 -->
            <div style="margin-top:20px">
              <div style="font-weight:bold;margin-bottom:8px">动作步骤</div>
              <div v-if="!(previewAction.steps && previewAction.steps.length)" style="color:#999;font-size:13px">暂无步骤</div>
              <el-steps v-else direction="vertical" :active="previewAction.steps.length" style="margin-left:8px">
                <el-step
                  v-for="(s, i) in previewAction.steps"
                  :key="i"
                  :title="`步骤 ${i + 1}`"
                  :description="s"
                />
              </el-steps>
            </div>
          </el-col>

          <!-- 右列：简介 + 注意事项 + 驳回原因 -->
          <el-col :span="10">
            <div style="font-weight:bold;margin-bottom:8px">动作简介</div>
            <p style="color:#666;line-height:1.8;font-size:13px;min-height:40px">
              {{ previewAction.description || '暂无简介' }}
            </p>

            <el-divider />

            <div style="font-weight:bold;margin-bottom:8px">注意事项</div>
            <div v-if="!(previewAction.cautions && previewAction.cautions.length)" style="color:#999;font-size:13px">暂无</div>
            <div
              v-for="(c, i) in previewAction.cautions"
              :key="i"
              style="color:#E6A23C;line-height:2;font-size:13px"
            >⚠️ {{ c }}</div>

            <!-- 驳回原因（已驳回状态才有值） -->
            <div
              v-if="previewAction.reject_reason"
              style="margin-top:16px;padding:10px;background:#fff5f5;border-radius:4px;color:#F56C6C;font-size:13px;line-height:1.6"
            >
              <b>驳回原因：</b>{{ previewAction.reject_reason }}
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 弹窗底部：待审核状态直接在弹窗内操作，减少来回切换 -->
      <div v-if="previewAction && previewAction.status === 0" slot="footer">
        <el-button @click="previewVisible = false">关闭</el-button>
        <el-button type="danger" @click="openRejectFromPreview">驳回</el-button>
        <el-button type="success" @click="approveFromPreview">通过</el-button>
      </div>
      <div v-else slot="footer">
        <el-button @click="previewVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getAdminActions, getActionDetail, reviewAction, offlineAction } from '@/api/admin'

// 静态资源根路径，用于拼接封面图/视频完整 URL
const BASE_URL = process.env.VUE_APP_API_BASE || 'http://127.0.0.1:8009/api'

export default {
  name: 'ActionReview',
  data() {
    return {
      loading: false,
      list: [],
      total: 0,
      page: 1,
      pageSize: 20,
      activeTab: '0',
      rejectVisible: false,
      rejectReason: '',
      currentId: null,
      previewVisible: false,
      previewLoading: false,  // 预览弹窗加载状态
      previewAction: null
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
      this.page = 1
      this.fetchList()
    },
    onPageChange(p) {
      this.page = p
      this.fetchList()
    },
    async openPreview(row) {
      // 列表行只有精简字段，点预览时调详情接口拿完整数据（含 cover_img/video_url/steps/cautions）
      this.previewAction = null
      this.previewLoading = true
      this.previewVisible = true
      try {
        const res = await getActionDetail(row.id)
        this.previewAction = res.data
      } catch {
        this.$message.error('加载详情失败')
        this.previewVisible = false
      } finally {
        this.previewLoading = false
      }
    },
    async approve(row) {
      await reviewAction(row.id, { status: 1 })
      this.$message.success('已通过')
      this.fetchList()
    },
    // 弹窗内直接通过，通过后关闭弹窗并刷新列表
    async approveFromPreview() {
      await reviewAction(this.previewAction.id, { status: 1 })
      this.$message.success('已通过')
      this.previewVisible = false
      this.fetchList()
    },
    openReject(row) {
      this.currentId = row.id
      this.rejectReason = ''
      this.rejectVisible = true
    },
    // 弹窗内点驳回：关闭预览弹窗，打开驳回原因弹窗
    openRejectFromPreview() {
      this.currentId = this.previewAction.id
      this.rejectReason = ''
      this.previewVisible = false
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
    difficultyType(d) { return ['', 'success', 'warning', 'danger'][d] },
    // 拼接静态资源完整 URL，cover_img/video_url 存的是相对路径
    mediaUrl(path) { return `${BASE_URL}/static/${path}` }
  }
}
</script>
