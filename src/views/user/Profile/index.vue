<template>
  <div>
    <h2 style="margin-bottom:20px">个人主页</h2>
    <el-row :gutter="20">
      <!-- 账号信息 -->
      <el-col :span="12">
        <el-card>
          <div slot="header">账号信息</div>
          <div class="avatar-block">
            <el-avatar :size="80" fit="cover" :src="displayAvatar" style="background:#c0c4cc">
              <i class="el-icon-user" style="font-size:36px" />
            </el-avatar>
            <div class="avatar-actions">
              <!-- :http-request="uploadAvatar"覆盖action后的url接口路径，可以自定义上传行为 -->
              <el-upload
                class="avatar-uploader"
                action="#"
                :show-file-list="false"
                accept="image/*"
                name="file"
                :http-request="uploadAvatar"
              >
                <el-button size="small" type="primary" plain>上传头像</el-button>
              </el-upload>
              <el-button
                v-if="profile.avatar"
                size="small"
                type="text"
                @click="clearAvatar"
              >恢复默认</el-button>
            </div>
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
    },
    /** 无自定义头像时不传 src，显示默认图标插槽 */
    displayAvatar() {
      const a = (this.profile.avatar || '').trim()
      return a || undefined
    }
  },
  created() {
    this.loadProfile()
    this.loadBodyStats()
  },
  methods: {
    async loadProfile() {
      try {
        const res = await request.get('/user/profile')
        if (res.code !== 200) {
          this.$message.error(res.message || '加载失败')
          return
        }
        Object.assign(this.profile, res.data || {})
        this.syncUserToStore(res.data)
      } catch (e) {
        const d = e?.response?.data
        this.$message.error(d?.message || d?.detail || '加载失败')
      }
    },
    syncUserToStore(data) {
      if (!data || !this.$store.state.user) return
      const u = { ...this.$store.state.user }
      if (data.nickname != null) u.nickname = data.nickname
      if (data.avatar != null) u.avatar = data.avatar
      this.$store.commit('SET_USER', u)
    },
    async loadBodyStats() {
      try {
        const res = await request.get('/user/body-stats')
        if (res.code !== 200) return
        if (res.data) Object.assign(this.body, res.data)
      } catch (_) { /* 忽略 */ }
    },
    calcAuto() {
      const { height, weight, waist, hip } = this.body
      if (height && weight) this.body.bmi = (weight / ((height / 100) ** 2)).toFixed(1)
      if (waist && hip) this.body.whr = (waist / hip).toFixed(2)
    },
    async saveProfile() {
      const { nickname, phone, signature } = this.profile
      try {
        const res = await request.put('/user/profile', { nickname, phone, signature })
        if (res.code !== 200) {
          this.$message.error(res.message || '保存失败')
          return
        }
        this.$message.success(res.message || '账号信息已保存')
        this.syncUserToStore({ nickname, phone, signature })
      } catch (e) {
        const d = e?.response?.data
        this.$message.error(d?.message || d?.detail || '保存失败')
      }
    },
    async uploadAvatar(options) {
      const raw = options.file
      const formData = new FormData()
      formData.append('file', raw)
      try {
        const res = await request.post('/user/avatar', formData)
        if (res.code !== 200) {
          this.$message.error(res.message || '上传失败')
          throw new Error(res.message || 'upload fail')
        }
        const url = res.data && res.data.avatar
        if (url) this.profile.avatar = url
        this.$message.success(res.message || '头像已更新')
        this.syncUserToStore({ avatar: url })
      } catch (e) {
        const d = e?.response?.data
        this.$message.error(d?.message || d?.detail || e.message || '上传失败')
        throw e
      }
    },
    async clearAvatar() {
      try {
        const res = await request.put('/user/profile', { avatar: '' })
        if (res.code !== 200) {
          this.$message.error(res.message || '操作失败')
          return
        }
        this.profile.avatar = ''
        this.$message.success('已恢复默认头像')
        this.syncUserToStore({ avatar: '' })
      } catch (e) {
        const d = e?.response?.data
        this.$message.error(d?.message || d?.detail || '操作失败')
      }
    },
    async saveBody() {
      const { height, weight, body_fat, waist, hip } = this.body
      try {
        const res = await request.put('/user/body-stats', { height, weight, body_fat, waist, hip })
        if (res.code !== 200) {
          this.$message.error(res.message || '保存失败')
          return
        }
        if (res.data) Object.assign(this.body, res.data)
        this.$message.success(res.message || '身体指标已保存')
      } catch (e) {
        const d = e?.response?.data
        this.$message.error(d?.message || d?.detail || '保存失败')
      }
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
        const d = e?.response?.data
        this.$message.error(d?.message || d?.detail || '修改失败')
      }
    }
  }
}
</script>

<style scoped>
.avatar-block {
  text-align: center;
  margin-bottom: 20px;
}
.avatar-actions {
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}
.avatar-uploader {
  display: inline-block;
}
</style>
