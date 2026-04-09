<template>
  <div class="login-wrap">
    <el-card class="login-card">
      <h2 style="text-align:center;margin-bottom:24px">💪 智能健身系统</h2>
      <el-form :model="form" :rules="rules" ref="form" label-width="0">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="用户名（user01 / coach01 / admin）" prefix-icon="el-icon-user" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="密码（123456）" prefix-icon="el-icon-lock" @keyup.enter.native="submit" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" style="width:100%" :loading="loading" @click="submit">登 录</el-button>
        </el-form-item>
        <div style="text-align:center">
          <router-link to="/register">还没有账号？立即注册</router-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { login } from '../../api/auth'

export default {
  name: 'Login',
  data() {
    return {
      loading: false,
      form: { username: '', password: '' },
      rules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
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
          // TODO: 对接后端 POST /auth/login，返回 { token, user }
          const res = await login(this.form)
          console.log('传给后端登录对象后端返回的数据',res)
          const { token, ...user } = res.data
          this.$store.dispatch('login', { token, user })
          const roleMap = { user: '/user/dashboard', coach: '/coach/students', admin: '/admin/statistics' }
          this.$router.push(roleMap[user.role] || '/')
        } catch {
          this.$message.error('用户名或密码错误')
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
