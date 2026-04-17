<template>
  <div>
    <el-tabs v-model="activeTab">
      <el-tab-pane label="找教练" name="list">
        <find-coach
          :loading="listLoading"
          :coaches="coaches"
          :keyword.sync="keyword"
          :page="page"
          :page-size="pageSize"
          :total="total"
          :bind-status-map="bindStatusMap"
          @search="fetchCoaches"
          @view-detail="viewDetail"
          @apply="handleApply"
          @page-change="onPageChange"
        />
      </el-tab-pane>

      <el-tab-pane label="我的教练" name="mine">
        <my-coach
          :loading="mineLoading"
          :my-coach="myCoach"
          :pending-apply="pendingApply"
          @view-detail="viewDetail"
          @unbind="handleUnbind"
        />
      </el-tab-pane>
    </el-tabs>

    <!-- 教练详情弹窗 -->
    <el-dialog :visible.sync="detailVisible" width="560px" :title="detailInfo ? detailInfo.nickname + ' 的主页' : '教练详情'">
      <div v-loading="detailLoading">
        <div v-if="detailInfo" class="coach-detail">
          <!-- 头部 -->
          <div class="detail-header">
            <el-avatar :size="80" :src="detailInfo.avatar">
              <i class="el-icon-user" />
            </el-avatar>
            <div class="detail-header-info">
              <div class="detail-name">{{ detailInfo.nickname }}</div>
              <div class="detail-tags">
                <el-tag v-if="detailInfo.location" size="small" type="info">
                  <i class="el-icon-location-outline" /> {{ detailInfo.location }}
                </el-tag>
                <el-tag v-if="detailInfo.years_exp" size="small" type="info">
                  从业 {{ detailInfo.years_exp }} 年
                </el-tag>
                <el-tag :type="detailInfo.is_accepting ? 'success' : 'warning'" size="small">
                  {{ detailInfo.is_accepting ? '接受新学员' : '暂停招募' }}
                </el-tag>
              </div>
              <div v-if="detailInfo.signature" style="color:#606266;font-size:13px;margin-top:6px">
                {{ detailInfo.signature }}
              </div>
            </div>
          </div>

          <el-divider />

          <!-- 擅长方向 -->
          <div v-if="detailInfo.specialties" class="detail-section">
            <div class="detail-label">擅长方向</div>
            <div>
              <el-tag
                v-for="s in detailInfo.specialties.split(',')"
                :key="s" size="small" style="margin:2px"
              >{{ s.trim() }}</el-tag>
            </div>
          </div>

          <!-- 资质证书 -->
          <div v-if="detailInfo.certifications" class="detail-section">
            <div class="detail-label">资质证书</div>
            <div style="color:#606266;font-size:13px;white-space:pre-wrap">{{ detailInfo.certifications }}</div>
          </div>

          <!-- 详细介绍 -->
          <div v-if="detailInfo.intro" class="detail-section">
            <div class="detail-label">个人介绍</div>
            <div style="color:#606266;font-size:13px;white-space:pre-wrap">{{ detailInfo.intro }}</div>
          </div>

          <!-- 身体数据（教练自己展示用） -->
          <div v-if="detailInfo.height || detailInfo.weight" class="detail-section">
            <div class="detail-label">体能数据</div>
            <span v-if="detailInfo.height" style="margin-right:16px;font-size:13px;color:#606266">
              身高 {{ detailInfo.height }} cm
            </span>
            <span v-if="detailInfo.weight" style="font-size:13px;color:#606266">
              体重 {{ detailInfo.weight }} kg
            </span>
          </div>
        </div>
      </div>
      <div slot="footer">
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button
          type="primary"
          :disabled="!!bindStatusMap[detailInfo && detailInfo.id]"
          @click="detailInfo && handleApply(detailInfo)"
        >
          {{ (detailInfo && bindStatusMap[detailInfo.id]) || '申请绑定' }}
        </el-button>
      </div>
    </el-dialog>

    <!-- 申请绑定弹窗 -->
    <el-dialog title="申请绑定教练" :visible.sync="applyVisible" width="400px">
      <div style="margin-bottom:12px;color:#606266">
        申请绑定：<strong>{{ applyTarget && applyTarget.nickname }}</strong>
      </div>
      <el-input v-model="applyMsg" type="textarea" :rows="3"
        placeholder="留言给教练（可选）" maxlength="100" show-word-limit />
      <div slot="footer">
        <el-button @click="applyVisible = false">取消</el-button>
        <el-button type="primary" :loading="applyLoading" @click="submitApply">提交申请</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getCoaches, applyBind, getMyCoach, unbindCoach } from '@/api/coachBind'
import { getCoachPublicProfile } from '@/api/coach'
import FindCoach from './FindCoach.vue'
import MyCoach from './MyCoach.vue'

export default {
  name: 'CoachZone',
  components: {
    FindCoach,
    MyCoach,
  },
  data() {
    return {
      activeTab: 'list',
      listLoading: false,
      coaches: [],
      keyword: '',
      page: 1,
      pageSize: 12,
      total: 0,
      mineLoading: false,
      myCoach: null,       // active 绑定信息
      pendingApply: null,  // pending 申请信息
      // 教练详情弹窗
      detailVisible: false,
      detailLoading: false,
      detailInfo: null,
      // 申请弹窗
      applyVisible: false,
      applyTarget: null,
      applyMsg: '',
      applyLoading: false,
    }
  },
  computed: {
    // 根据 active/pending 状态生成按钮文字映射 { coachId: label }
    bindStatusMap() {
      const map = {}
      if (this.myCoach) {
        map[this.myCoach.coach_id] = '已绑定'
      }
      if (this.pendingApply) {
        // 若该教练已有 pending 申请，标记"申请中"
        if (!map[this.pendingApply.coach_id]) {
          map[this.pendingApply.coach_id] = '申请中'
        }
      }
      return map
    },
  },
  created() {
    this.fetchCoaches()
    this.fetchMyCoach()
  },
  methods: {
    async fetchCoaches() {
      this.listLoading = true
      try {
        const res = await getCoaches({ keyword: this.keyword || undefined, page: this.page, page_size: this.pageSize })
        const d = res.data || {}
        this.coaches = d.list || []
        this.total = d.total || 0
      } finally {
        this.listLoading = false
      }
    },
    async fetchMyCoach() {
      this.mineLoading = true
      try {
        const res = await getMyCoach()
        const d = res.data || {}
        this.myCoach = d.active || null
        this.pendingApply = d.pending || null
      } finally {
        this.mineLoading = false
      }
    },
    onPageChange(p) {
      this.page = p
      this.fetchCoaches()
    },
    async viewDetail(coachId) {
      this.detailVisible = true
      this.detailInfo = null
      this.detailLoading = true
      try {
        const res = await getCoachPublicProfile(coachId)
        this.detailInfo = res.data || null
      } catch {
        this.$message.error('加载失败')
        this.detailVisible = false
      } finally {
        this.detailLoading = false
      }
    },
    handleApply(coach) {
      // 已绑定该教练，不可重复操作
      if (this.myCoach && this.myCoach.coach_id === coach.id) return

      // 已有 pending 申请且目标是同一教练，提示等待
      if (this.pendingApply && this.pendingApply.coach_id === coach.id) {
        this.$message.warning('已向该教练提交申请，请等待处理')
        return
      }

      // 已有 pending 申请但想申请其他教练，提示先撤销
      if (this.pendingApply && this.pendingApply.coach_id !== coach.id) {
        this.$confirm(
          `您已向「${this.pendingApply.nickname}」提交了申请，申请其他教练将自动撤销原申请，确认继续？`,
          '提示', { type: 'warning', confirmButtonText: '继续申请', cancelButtonText: '取消' }
        ).then(() => {
          this.applyTarget = coach
          this.applyMsg = ''
          this.applyVisible = true
        }).catch(() => {})
        return
      }

      this.applyTarget = coach
      this.applyMsg = ''
      this.applyVisible = true
    },
    async submitApply() {
      this.applyLoading = true
      try {
        const res = await applyBind({ coach_id: this.applyTarget.id, request_msg: this.applyMsg })
        if (res.code !== 200) {
          this.$message.error(res.message || '申请失败')
          return
        }
        this.$message.success(res.message || '申请已提交')
        this.applyVisible = false
        this.fetchMyCoach()
      } catch (e) {
        this.$message.error(e?.response?.data?.message || '申请失败')
      } finally {
        this.applyLoading = false
      }
    },
    async handleUnbind() {
      await this.$confirm('确认解除与该教练的绑定？', '提示', { type: 'warning' })
      try {
        await unbindCoach(this.myCoach.bind_id)
        this.$message.success('已解绑')
        this.myCoach = null
        this.fetchCoaches()
        this.fetchMyCoach()
      } catch (e) {
        this.$message.error(e?.response?.data?.message || '操作失败')
      }
    },
  }
}
</script>

<style scoped>
.coach-detail { padding: 0 4px; }
.detail-header { display: flex; gap: 20px; align-items: flex-start; }
.detail-header-info { flex: 1; }
.detail-name { font-size: 20px; font-weight: bold; margin-bottom: 8px; }
.detail-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.detail-section { margin-bottom: 16px; }
.detail-label { font-weight: 600; color: #303133; margin-bottom: 8px; font-size: 14px; }
</style>
