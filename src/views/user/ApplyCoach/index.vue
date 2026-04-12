<template>
  <div>
    <h2 style="margin-bottom:20px">申请成为教练</h2>
    <el-card style="max-width:600px">

      <!-- 已是教练 -->
      <el-result v-if="isCoach" icon="success" title="您已是教练" sub-title="可前往教练端管理课程和学员">
        <template slot="extra">
          <el-button type="primary" @click="$router.push('/coach/students')">前往教练端</el-button>
        </template>
      </el-result>

      <!-- 待审中 -->
      <el-result v-else-if="application && application.status === 'pending'"
        icon="info" title="审核中" sub-title="您的申请已提交，请耐心等待管理员审核">
        <template slot="extra">
          <div style="color:#909399;font-size:13px">申请时间：{{ application.created_at }}</div>
        </template>
      </el-result>

      <!-- 已通过（role 还未刷新的过渡态） -->
      <el-result v-else-if="application && application.status === 'approved'"
        icon="success" title="申请已通过" sub-title="您的教练权限已生效，重新登录后可进入教练端">
        <template slot="extra">
          <el-button type="primary" @click="reLogin">重新登录</el-button>
        </template>
      </el-result>

      <!-- 教练权限被撤销 -->
      <el-result v-else-if="application && application.status === 'revoked'"
        icon="warning" title="教练权限已被撤销" sub-title="您的教练权限已被管理员撤销，如有疑问请联系管理员，或重新提交申请">
        <template slot="extra">
          <el-button type="primary" @click="application = null">重新申请</el-button>
        </template>
      </el-result>

      <!-- 已拒绝 / 无申请：显示表单 -->
      <div v-else>
        <el-alert
          v-if="application && application.status === 'rejected'"
          type="error"
          :title="`上次申请被拒绝：${application.reject_reason || '无说明'}`"
          style="margin-bottom:20px"
          :closable="false"
        />
        <el-form :model="form" label-width="90px">
          <el-form-item label="申请说明">
            <el-input
              v-model="form.reason"
              type="textarea"
              :rows="4"
              maxlength="500"
              show-word-limit
              placeholder="请说明您的健身资质、教学经验等"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="submitting" @click="submit">提交申请</el-button>
          </el-form-item>
        </el-form>
      </div>

    </el-card>
  </div>
</template>

<script>
import request from '@/utils/request'

export default {
  name: 'ApplyCoach',
  data() {
    return {
      application: null,   // 最新申请记录
      form: { reason: '' },
      submitting: false
    }
  },
  computed: {
    // 以 store 中 role 为准（deps.py 已改为从库读取，登录后 role 实时准确）
    isCoach() {
      return this.$store.getters.role === 'coach'
    }
  },
  created() {
    this.loadApplication()
  },
  methods: {
    async loadApplication() {
      try {
        const res = await request.get('/coach-application/my')
        if (res.code === 200) this.application = res.data
      } catch (_) { /* 未申请过时 data=null，忽略错误 */ }
    },
    async submit() {
      if (!this.form.reason.trim()) return this.$message.error('请填写申请说明')
      this.submitting = true
      try {
        const res = await request.post('/coach-application/apply', this.form)
        if (res.code !== 200) return this.$message.error(res.msg || '提交失败')
        this.$message.success('申请已提交')
        await this.loadApplication()
      } catch (e) {
        this.$message.error(e?.response?.data?.detail || '提交失败')
      } finally {
        this.submitting = false
      }
    },
    reLogin() {
      this.$store.dispatch('logout')
      this.$router.push('/login')
    }
  }
}
</script>
