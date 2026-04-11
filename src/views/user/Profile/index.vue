<template>
  <div>
    <h2 style="margin-bottom:20px">个人主页</h2>
    <el-row :gutter="20">
      <!-- 账号信息 -->
      <el-col :span="12">
        <el-card>
          <div slot="header">账号信息</div>
          <div style="text-align:center;margin-bottom:20px">
            <el-avatar :size="80" style="background:#c0c4cc">
              <i class="el-icon-user" style="font-size:36px" />
            </el-avatar>
          </div>
          <el-form :model="profile" label-width="90px">
            <el-form-item label="账号">
              <el-input v-model="profile.username" readonly />
            </el-form-item>
            <el-form-item label="昵称">
              <el-input v-model="profile.nickname" />
            </el-form-item>
            <el-form-item label="手机号">
              <el-input v-model="profile.phone" />
            </el-form-item>
            <el-form-item label="个性签名">
              <el-input v-model="profile.signature" type="textarea" :rows="3" maxlength="100" show-word-limit />
            </el-form-item>
            <el-form-item label="密码">
              <el-button size="small" @click="pwdDialog = true">修改密码</el-button>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveProfile">保存账号信息</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 身体指标 -->
      <el-col :span="12">
        <el-card>
          <div slot="header">身体指标</div>
          <el-form :model="body" label-width="90px">
            <el-form-item label="身高 (cm)">
              <el-input v-model.number="body.height" type="number" @input="calcAuto" />
            </el-form-item>
            <el-form-item label="体重 (kg)">
              <el-input v-model.number="body.weight" type="number" @input="calcAuto" />
            </el-form-item>
            <el-form-item label="BMI">
              <el-input :value="body.bmi" readonly>
                <template slot="append">
                  <span :style="{ color: bmiColor }">{{ bmiLabel }}</span>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="体脂率 (%)">
              <el-input v-model.number="body.body_fat" type="number" />
            </el-form-item>
            <el-form-item label="腰围 (cm)">
              <el-input v-model.number="body.waist" type="number" @input="calcAuto" />
            </el-form-item>
            <el-form-item label="臀围 (cm)">
              <el-input v-model.number="body.hip" type="number" @input="calcAuto" />
            </el-form-item>
            <el-form-item label="腰臀比">
              <el-input :value="body.whr" readonly />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveBody">保存身体指标</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>

    <!-- 修改密码弹窗 -->
    <el-dialog title="修改密码" :visible.sync="pwdDialog" width="400px">
      <el-form :model="pwdForm" label-width="100px">
        <el-form-item label="旧密码">
          <el-input v-model="pwdForm.old_password" type="password" show-password />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="pwdForm.new_password" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认新密码">
          <el-input v-model="pwdForm.confirm_password" type="password" show-password />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="pwdDialog = false">取消</el-button>
        <el-button type="primary" @click="changePassword">确认修改</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'

export default {
  name: 'Profile',
  data() {
    return {
      profile: { username: '', nickname: '', phone: '', signature: '', avatar: '' },
      body: { height: null, weight: null, bmi: null, body_fat: null, waist: null, hip: null, whr: null },
      pwdDialog: false,
      pwdForm: { old_password: '', new_password: '', confirm_password: '' }
    }
  },
  computed: {
    bmiColor() {
      const b = parseFloat(this.body.bmi)
      if (!b) return '#999'
      if (b < 18.5) return '#409EFF'
      if (b < 24) return '#67C23A'
      if (b < 28) return '#E6A23C'
      return '#F56C6C'
    },
    bmiLabel() {
      const b = parseFloat(this.body.bmi)
      if (!b) return '--'
      if (b < 18.5) return '偏瘦'
      if (b < 24) return '正常'
      if (b < 28) return '超重'
      return '肥胖'
    }
  },
  created() {
    this.loadProfile()
    this.loadBodyStats()
  },
  methods: {
    async loadProfile() {
      const res = await request.get('/user/profile')
      this.profile = res.data
    },
    async loadBodyStats() {
      const res = await request.get('/user/body-stats')
      if (res.data) Object.assign(this.body, res.data)
    },
    calcAuto() {
      const { height, weight, waist, hip } = this.body
      if (height && weight) this.body.bmi = (weight / ((height / 100) ** 2)).toFixed(1)
      if (waist && hip) this.body.whr = (waist / hip).toFixed(2)
    },
    async saveProfile() {
      const { nickname, phone, signature } = this.profile
      await request.put('/user/profile', { nickname, phone, signature })
      this.$message.success('账号信息已保存')
    },
    async saveBody() {
      const { height, weight, body_fat, waist, hip } = this.body
      const res = await request.put('/user/body-stats', { height, weight, body_fat, waist, hip })
      if (res.data) Object.assign(this.body, res.data)
      this.$message.success('身体指标已保存')
    },
    async changePassword() {
      const { old_password, new_password, confirm_password } = this.pwdForm
      if (!old_password) return this.$message.error('请输入旧密码')
      if (!new_password) return this.$message.error('请输入新密码')
      if (new_password !== confirm_password) return this.$message.error('两次新密码不一致')
      if (old_password === new_password) return this.$message.error('新密码不能与旧密码相同')
      try {
        await request.put('/user/password', { old_password, new_password })
        this.pwdDialog = false
        this.pwdForm = { old_password: '', new_password: '', confirm_password: '' }
        this.$message.success('密码修改成功，请使用新密码重新登录')
        await this.$store.dispatch('logout')
        this.$router.replace('/login')
      } catch (e) {
        const d = e.response?.data?.detail
        let msg = '修改失败'
        if (typeof d === 'string') msg = d
        else if (Array.isArray(d) && d[0]?.msg) msg = d[0].msg
        this.$message.error(msg)
      }
    }
  }
}
</script>
