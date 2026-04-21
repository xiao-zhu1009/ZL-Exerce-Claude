<template>
  <div class="login-wrap">
    <el-card class="login-card">
      <h2 style="text-align:center;margin-bottom:24px">💪 智能健身系统</h2>
      <el-form :model="form" :rules="rules" ref="form" label-width="0">
        <el-form-item prop="account">
          <el-input v-model="form.account" placeholder="账号 / 手机号" prefix-icon="el-icon-user" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" show-password placeholder="密码" prefix-icon="el-icon-lock" @keyup.enter.native="submit" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" style="width:100%" :loading="loading" @click="submit">登 录</el-button>
        </el-form-item>
        <div style="text-align:center">
          <router-link to="/register">还没有账号？立即注册</router-link>
          <span style="margin:0 8px;color:#ccc">|</span>
          <router-link to="/forgot-password">忘记密码</router-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { login } from '@/api/auth'

export default {
  name: 'Login',
  data() {
    return {
      loading: false,
      form: { account: '', password: '' },
      rules: {
        account: [{ required: true, message: '请输入账号或手机号', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
      }
    }
  },
  methods: {
    submit() {
      this.$refs.form.validate(async valid => {
        if (!valid) return
        this.loading = true
        try {
          // 将账号/手机号+密码发送请求
          const res = await login(this.form)
          // 拦截器已返回 res.data，即后端信封 { code, message, data }
          if (res.code !== 200) {
            this.$message.error(res.message || '登录失败')
            return
          }
          const payload = res.data || {}
          const { token, ...user } = payload
          if (!token) {
            this.$message.error('登录响应缺少 token')
            return
          }
          this.$store.dispatch('login', { token, user })
          // 根据不同用户类型跳转不同路由
          const roleMap = { user: '/user/dashboard', coach: '/coach/students', admin: '/admin/statistics' }
          this.$router.push(roleMap[user.role] || '/')
        } catch (e) {
          const d = e?.response?.data
          this.$message.error(d?.message || d?.detail || '登录失败')
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
