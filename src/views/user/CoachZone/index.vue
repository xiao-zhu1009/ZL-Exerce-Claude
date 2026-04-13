<template>
  <div>
    <h2 style="margin-bottom:20px">教练专区</h2>

    <el-tabs v-model="activeTab">
      <!-- ── 找教练 ── -->
      <el-tab-pane label="找教练" name="list">
        <div style="display:flex;gap:12px;margin-bottom:16px">
          <el-input v-model="keyword" placeholder="搜索教练昵称" clearable style="width:220px"
            @keyup.enter.native="fetchCoaches" />
          <el-button type="primary" @click="fetchCoaches">搜索</el-button>
        </div>

        <el-row :gutter="16" v-loading="listLoading">
          <el-col v-for="c in coaches" :key="c.id" :span="6" style="margin-bottom:16px">
            <el-card shadow="hover" body-style="padding:16px;text-align:center">
              <el-avatar :size="64" :src="c.avatar" style="margin-bottom:8px">
                <i class="el-icon-user" />
              </el-avatar>
              <div style="font-weight:bold;font-size:15px;margin-bottom:4px">{{ c.nickname }}</div>
              <div style="color:#909399;font-size:12px;min-height:32px;padding:0 4px;overflow:hidden;
                text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical">
                {{ c.signature || '暂无简介' }}
              </div>
              <div style="margin-top:10px;display:flex;gap:6px;justify-content:center">
                <el-button size="mini" @click="viewDetail(c.id)">查看详情</el-button>
                <el-button
                  size="mini" type="primary"
                  :disabled="!!bindStatusMap[c.id]"
                  @click="handleApply(c)"
                >{{ bindStatusMap[c.id] || '申请绑定' }}</el-button>
              </div>
            </el-card>
          </el-col>
          <el-col v-if="!listLoading && coaches.length === 0" :span="24">
            <el-empty description="暂无教练" />
          </el-col>
        </el-row>

        <el-pagination
          v-if="total > pageSize" background layout="prev,pager,next"
          :total="total" :page-size="pageSize" :current-page="page"
          style="margin-top:16px;text-align:right"
          @current-change="onPageChange"
        />
      </el-tab-pane>

      <!-- ── 我的教练 ── -->
      <el-tab-pane label="我的教练" name="mine">
        <div v-loading="mineLoading">
          <el-card v-if="myCoach" style="max-width:480px">
            <div style="display:flex;align-items:center;gap:20px;margin-bottom:16px">
              <el-avatar :size="72" :src="myCoach.avatar">
                <i class="el-icon-user" />
              </el-avatar>
              <div>
                <div style="font-size:18px;font-weight:bold">{{ myCoach.nickname }}</div>
                <div style="color:#909399;font-size:13px;margin-top:4px">{{ myCoach.signature || '暂无简介' }}</div>
                <div style="color:#67C23A;font-size:12px;margin-top:6px">
                  <i class="el-icon-check" /> 绑定于 {{ myCoach.bind_at ? myCoach.bind_at.slice(0,10) : '-' }}
                </div>
              </div>
            </div>
            <div style="display:flex;gap:10px">
              <el-button size="small" @click="viewDetail(myCoach.coach_id)">查看主页</el-button>
              <el-button size="small" type="danger" @click="handleUnbind">解除绑定</el-button>
            </div>
          </el-card>
          <el-empty v-else description="暂未绑定教练，去「找教练」申请吧" />
        </div>
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

export default {
  name: 'CoachZone',
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
      myCoach: null,
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
    // 根据 myCoach 状态生成按钮文字映射 { coachId: '已绑定' | '申请中' }
    bindStatusMap() {
      const map = {}
      if (this.myCoach) {
        map[this.myCoach.coach_id] = '已绑定'
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
        this.myCoach = res.data || null
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
      if (this.myCoach && this.myCoach.coach_id === coach.id) return
      this.applyTarget = coach
      this.applyMsg = ''
      this.applyVisible = true
    },
    async submitApply() {
      this.applyLoading = true
      try {
        const res = await applyBind({ coach_id: this.applyTarget.id, request_msg: this.applyMsg })
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
