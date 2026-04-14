<template>
  <div>
    <el-row :gutter="20" v-loading="pageLoading">
      <!-- 左列：头像 + 账号基本信息 -->
      <el-col :span="10">
        <el-card>
          <div slot="header">账号信息</div>

          <!-- 头像 -->
          <div class="avatar-block">
            <el-avatar :size="80" fit="cover" :src="displayAvatar" style="background:#c0c4cc">
              <i class="el-icon-user" style="font-size:36px" />
            </el-avatar>
            <div class="avatar-actions">
              <el-upload action="#" :show-file-list="false" accept="image/*" :http-request="handleUploadAvatar">
                <el-button size="small" type="primary" plain>上传头像</el-button>
              </el-upload>
              <el-button v-if="form.avatar" size="small" type="text" @click="clearAvatar">恢复默认</el-button>
            </div>
          </div>

          <el-form :model="form" label-width="90px">
            <el-form-item label="账号">
              <el-input :value="form.username" readonly />
            </el-form-item>
            <el-form-item label="昵称">
              <el-input v-model="form.nickname" />
            </el-form-item>
            <el-form-item label="手机号">
              <el-input v-model="form.phone" />
            </el-form-item>
            <el-form-item label="个性签名">
              <el-input v-model="form.signature" type="textarea" :rows="2" maxlength="100" show-word-limit />
            </el-form-item>
            <el-form-item label="训练目标">
              <el-input v-model="form.goal" placeholder="如：帮助学员科学减脂增肌" />
            </el-form-item>
            <el-form-item label="密码">
              <el-button size="small" @click="pwdDialog = true">修改密码</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 身体指标 -->
        <el-card style="margin-top:16px">
          <div slot="header">身体指标</div>
          <el-form :model="form" label-width="90px">
            <el-form-item label="身高 (cm)">
              <el-input v-model.number="form.height" type="number" @input="calcBmi" />
            </el-form-item>
            <el-form-item label="体重 (kg)">
              <el-input v-model.number="form.weight" type="number" @input="calcBmi" />
            </el-form-item>
            <el-form-item label="BMI">
              <el-input :value="form.bmi" readonly>
                <template slot="append">
                  <span :style="{ color: bmiColor }">{{ bmiLabel }}</span>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="体脂率 (%)">
              <el-input v-model.number="form.body_fat" type="number" />
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 右列：教练专属信息 -->
      <el-col :span="14">
        <el-card>
          <div slot="header">教练信息</div>
          <el-form :model="form" label-width="100px">
            <el-form-item label="真实姓名">
              <el-input v-model="form.real_name" placeholder="仅自己可见" />
            </el-form-item>
            <el-form-item label="性别">
              <el-radio-group v-model="form.gender">
                <el-radio :label="0">未设置</el-radio>
                <el-radio :label="1">男</el-radio>
                <el-radio :label="2">女</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="年龄">
              <el-input v-model.number="form.age" type="number" style="width:120px" />
            </el-form-item>
            <el-form-item label="从业年限">
              <el-input v-model.number="form.years_exp" type="number" style="width:120px">
                <template slot="append">年</template>
              </el-input>
            </el-form-item>
            <el-form-item label="所在城市">
              <el-input v-model="form.location" placeholder="如：北京" />
            </el-form-item>
            <el-form-item label="擅长方向">
              <el-input v-model="form.specialties" placeholder="逗号分隔，如：减脂,增肌,康复训练" />
              <!-- 快捷标签 -->
              <div style="margin-top:6px">
                <el-tag
                  v-for="tag in specialtyTags"
                  :key="tag"
                  size="small"
                  style="margin:2px;cursor:pointer"
                  :type="isTagSelected(tag) ? '' : 'info'"
                  @click="toggleTag(tag)"
                >{{ tag }}</el-tag>
              </div>
            </el-form-item>
            <el-form-item label="资质证书">
              <el-input v-model="form.certifications" type="textarea" :rows="3"
                placeholder="如：NSCA-CPT 认证私人教练、国家体育总局健身教练证..." />
            </el-form-item>
            <el-form-item label="详细介绍">
              <el-input v-model="form.intro" type="textarea" :rows="5"
                placeholder="介绍你的执教理念、服务内容、成功案例等..." maxlength="500" show-word-limit />
            </el-form-item>
            <el-form-item label="招募状态">
              <el-switch
                v-model="form.is_accepting"
                :active-value="1"
                :inactive-value="0"
                active-text="接受新学员"
                inactive-text="暂停招募"
              />
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 保存按钮 -->
        <div style="margin-top:16px;text-align:right">
          <el-button type="primary" :loading="saving" @click="saveAll">保存所有信息</el-button>
        </div>
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
          <el-input v-model="pwdForm.confirm" type="password" show-password />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="pwdDialog = false">取消</el-button>
        <el-button type="primary" :loading="pwdSaving" @click="changePassword">确认修改</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  getCoachProfile, updateCoachProfile,
  changeCoachPassword, uploadCoachAvatar
} from '@/api/coach'

export default {
  name: 'CoachProfile',
  data() {
    return {
      pageLoading: false,
      saving: false,
      // 所有字段统一放一个 form 对象
      form: {
        username: '', nickname: '', phone: '', signature: '', goal: '', avatar: '',
        height: null, weight: null, bmi: null, body_fat: null,
        real_name: '', gender: 0, age: null, years_exp: 0,
        specialties: '', certifications: '', intro: '', location: '', is_accepting: 1,
      },
      // 密码弹窗
      pwdDialog: false,
      pwdSaving: false,
      pwdForm: { old_password: '', new_password: '', confirm: '' },
      // 擅长方向快捷标签
      specialtyTags: ['减脂', '增肌', '塑形', '康复训练', '有氧耐力', '力量举', '瑜伽', '搏击'],
    }
  },
  computed: {
    displayAvatar() {
      return (this.form.avatar || '').trim() || undefined
    },
    bmiColor() {
      const b = parseFloat(this.form.bmi)
      if (!b) return '#999'
      if (b < 18.5) return '#409EFF'
      if (b < 24)   return '#67C23A'
      if (b < 28)   return '#E6A23C'
      return '#F56C6C'
    },
    bmiLabel() {
      const b = parseFloat(this.form.bmi)
      if (!b) return '--'
      if (b < 18.5) return '偏瘦'
      if (b < 24)   return '正常'
      if (b < 28)   return '超重'
      return '肥胖'
    },
  },
  created() {
    this.loadProfile()
  },
  methods: {
    async loadProfile() {
      this.pageLoading = true
      try {
        const res = await getCoachProfile()
        if (res.code === 200 && res.data) {
          Object.assign(this.form, res.data)
          this.syncStore(res.data)
        }
      } catch (e) {
        this.$message.error(e?.response?.data?.message || '加载失败')
      } finally {
        this.pageLoading = false
      }
    },
    syncStore(data) {
      if (!this.$store.state.user) return
      const u = { ...this.$store.state.user }
      if (data.nickname != null) u.nickname = data.nickname
      if (data.avatar   != null) u.avatar   = data.avatar
      this.$store.commit('SET_USER', u)
    },
    calcBmi() {
      const { height, weight } = this.form
      if (height && weight) {
        this.form.bmi = (weight / ((height / 100) ** 2)).toFixed(1)
      }
    },
    isTagSelected(tag) {
      return (this.form.specialties || '').split(',').map(s => s.trim()).includes(tag)
    },
    toggleTag(tag) {
      const arr = (this.form.specialties || '').split(',').map(s => s.trim()).filter(Boolean)
      const idx = arr.indexOf(tag)
      if (idx >= 0) arr.splice(idx, 1)
      else arr.push(tag)
      this.form.specialties = arr.join(',')
    },
    async saveAll() {
      this.saving = true
      try {
        const payload = { ...this.form }
        delete payload.username  // 账号不可改
        delete payload.bmi       // 由后端计算
        const res = await updateCoachProfile(payload)
        if (res.code === 200) {
          this.$message.success('保存成功')
          this.syncStore(this.form)
        } else {
          this.$message.error(res.message || '保存失败')
        }
      } catch (e) {
        this.$message.error(e?.response?.data?.message || '保存失败')
      } finally {
        this.saving = false
      }
    },
    async handleUploadAvatar(options) {
      const fd = new FormData()
      fd.append('file', options.file)
      try {
        const res = await uploadCoachAvatar(fd)
        if (res.code === 200) {
          this.form.avatar = res.data.avatar
          this.$message.success('头像已更新')
          this.syncStore({ avatar: res.data.avatar })
        }
      } catch (e) {
        this.$message.error(e?.response?.data?.message || '上传失败')
      }
    },
    async clearAvatar() {
      try {
        await updateCoachProfile({ avatar: '' })
        this.form.avatar = ''
        this.syncStore({ avatar: '' })
        this.$message.success('已恢复默认头像')
      } catch (e) {
        this.$message.error('操作失败')
      }
    },
    async changePassword() {
      const { old_password, new_password, confirm } = this.pwdForm
      if (!old_password) return this.$message.error('请输入旧密码')
      if (!new_password) return this.$message.error('请输入新密码')
      if (new_password !== confirm) return this.$message.error('两次新密码不一致')
      this.pwdSaving = true
      try {
        const res = await changeCoachPassword({ old_password, new_password })
        if (res.code === 200) {
          this.$message.success('密码修改成功，请重新登录')
          this.pwdDialog = false
          await this.$store.dispatch('logout')
          this.$router.replace('/login')
        } else {
          this.$message.error(res.message || '修改失败')
        }
      } catch (e) {
        this.$message.error(e?.response?.data?.message || '修改失败')
      } finally {
        this.pwdSaving = false
      }
    },
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
}
</style>
