<template>
  <div class="login-wrap">
    <el-card class="login-card">
      <h2 style="text-align:center;margin-bottom:24px">重置密码</h2>

      <!-- Step 1: 手机号 + 验证码 -->
      <el-form v-if="step === 1" :model="phoneForm" :rules="phoneRules" ref="phoneForm" label-width="0">
        <el-form-item prop="phone">
          <el-input v-model="phoneForm.phone" placeholder="已注册的手机号" prefix-icon="el-icon-mobile-phone" />
        </el-form-item>
        <el-form-item prop="code">
          <div style="display:flex;gap:8px">
            <el-input v-model="phoneForm.code" placeholder="验证码" prefix-icon="el-icon-message" />
            <el-button :disabled="countdown > 0 || !/^1[3-9]\d{9}$/.test(phoneForm.phone)" @click="sendCode" style="white-space:nowrap">
              {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" style="width:100%" :loading="loading" @click="verifyStep">下一步</el-button>
        </el-form-item>
        <div style="text-align:center">
          <router-link to="/login">返回登录</router-link>
        </div>
      </el-form>

      <!-- Step 2: 设置新密码 -->
      <el-form v-if="step === 2" :model="resetForm" :rules="resetRules" ref="resetForm" label-width="0">
        <el-form-item>
          <el-input :value="phoneForm.phone" disabled prefix-icon="el-icon-mobile-phone" />
        </el-form-item>
        <el-form-item prop="newPassword">
          <el-input v-model="resetForm.newPassword" type="password" show-password placeholder="新密码（至少6位）" prefix-icon="el-icon-lock" />
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <el-input v-model="resetForm.confirmPassword" type="password" show-password placeholder="确认新密码" prefix-icon="el-icon-lock" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" style="width:100%" :loading="loading" @click="submit">确认重置</el-button>
        </el-form-item>
        <div style="text-align:center">
          <el-button type="text" @click="step = 1">返回上一步</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { forgotPasswordSendCode, forgotPasswordReset } from '@/api/auth'

export default {
  name: 'ForgotPassword',
  data() {
    const confirmValidator = (rule, value, callback) => {
      if (value !== this.resetForm.newPassword) {
        callback(new Error('两次密码不一致'))
      } else {
        callback()
      }
    }
    return {
      step: 1,
      loading: false,
      countdown: 0,
      phoneForm: { phone: '', code: '' },
      resetForm: { newPassword: '', confirmPassword: '' },
      phoneRules: {
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
        ],
        code: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
      },
      resetRules: {
        newPassword: [{ required: true, min: 6, message: '密码至少6位', trigger: 'blur' }],
        confirmPassword: [{ required: true, validator: confirmValidator, trigger: 'blur' }]
      }
    }
  },
  methods: {
    sendCode() {
      this.$refs.phoneForm.validateField('phone', async err => {
        if (err) return
        try {
          const res = await forgotPasswordSendCode({ phone: this.phoneForm.phone })
          if (res.code !== 200) {
            this.$message.error(res.message || '发送失败')
            return
          }
          this.$message.success(res.message || '验证码已发送')
          this.countdown = 60
          const timer = setInterval(() => {
            this.countdown--
            if (this.countdown <= 0) clearInterval(timer)
          }, 1000)
        } catch (e) {
          const d = e?.response?.data
          this.$message.error(d?.message || d?.detail || '发送失败，请重试')
        }
      })
    },
    verifyStep() {
      this.$refs.phoneForm.validate(valid => {
        if (!valid) return
        this.step = 2
      })
    },
    submit() {
      this.$refs.resetForm.validate(async valid => {
        if (!valid) return
        this.loading = true
        try {
          const res = await forgotPasswordReset({
            phone: this.phoneForm.phone,
            code: this.phoneForm.code,
            new_password: this.resetForm.newPassword
          })
          if (res.code !== 200) {
            this.$message.error(res.message || '重置失败')
            return
          }
          this.$message.success('密码重置成功，请重新登录')
          this.$router.push('/login')
        } catch (e) {
          const d = e?.response?.data
          this.$message.error(d?.message || d?.detail || '重置失败')
        } finally {
          this.loading = false
        }
      })
    }
  }
}
</script>

<style scoped>
.login-wrap { height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.login-card { width: 380px; padding: 20px; }
</style>
