<template>
  <div class="login-wrap">
    <el-card class="login-card">
      <h2 style="text-align:center;margin-bottom:24px">注册账号</h2>
      <el-form :model="form" :rules="rules" ref="form" label-width="0">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="用户名" prefix-icon="el-icon-user" />
        </el-form-item>
        <el-form-item prop="nickname">
          <el-input v-model="form.nickname" placeholder="昵称" prefix-icon="el-icon-s-custom" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="密码" prefix-icon="el-icon-lock" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" style="width:100%" :loading="loading" @click="submit">注 册</el-button>
        </el-form-item>
        <div style="text-align:center">
          <router-link to="/login">已有账号？去登录</router-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { register } from '../../api/auth'

export default {
  name: 'Register',
  data() {
    return {
      loading: false,
      form: { username: '', nickname: '', password: '' },
      rules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
        password: [{ required: true, min: 6, message: '密码至少6位', trigger: 'blur' }]
      }
    }
  },
  methods: {
    submit() {
      this.$refs.form.validate(async valid => {
        if (!valid) return
        this.loading = true
        try {
          // TODO: 对接后端 POST /auth/register
          await register(this.form)
          this.$message.success('注册成功，请登录')
          this.$router.push('/login')
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
