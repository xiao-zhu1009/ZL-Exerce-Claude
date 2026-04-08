<template>
  <div>
    <h2 style="margin-bottom:20px">个人主页</h2>
    <el-row :gutter="20">
      <!-- 基本信息 -->
      <el-col :span="12">
        <el-card>
          <div slot="header">基本信息</div>
          <el-form :model="profile" label-width="80px">
            <el-form-item label="昵称"><el-input v-model="profile.nickname" /></el-form-item>
            <el-form-item label="手机号"><el-input v-model="profile.phone" /></el-form-item>
            <el-form-item label="训练目标">
              <el-select v-model="profile.goal" style="width:100%">
                <el-option label="减脂" value="减脂" /><el-option label="增肌" value="增肌" />
                <el-option label="塑形" value="塑形" /><el-option label="维持" value="维持" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveProfile">保存</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 身体数据 -->
      <el-col :span="12">
        <el-card>
          <div slot="header">录入身体数据</div>
          <el-form :model="bodyForm" label-width="80px">
            <el-form-item label="身高(cm)"><el-input v-model.number="bodyForm.height" type="number" @input="calcBMI" /></el-form-item>
            <el-form-item label="体重(kg)"><el-input v-model.number="bodyForm.weight" type="number" @input="calcBMI" /></el-form-item>
            <el-form-item label="BMI">
              <el-input :value="bodyForm.bmi" readonly>
                <template slot="append">
                  <span :style="{ color: bmiColor }">{{ bmiLabel }}</span>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="体脂率(%)"><el-input v-model.number="bodyForm.body_fat" type="number" /></el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveBodyRecord">记录</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>

    <!-- 历史记录 -->
    <el-card style="margin-top:20px">
      <div slot="header">身体数据历史</div>
      <el-table :data="bodyRecords" size="small">
        <el-table-column prop="record_date" label="日期" />
        <el-table-column prop="height" label="身高(cm)" />
        <el-table-column prop="weight" label="体重(kg)" />
        <el-table-column prop="bmi" label="BMI" />
        <el-table-column prop="body_fat" label="体脂率(%)" />
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { getProfile, updateProfile, getBodyRecords, addBodyRecord } from '../../../api/user'

export default {
  name: 'Profile',
  data() {
    return {
      profile: { nickname: '', phone: '', goal: '' },
      bodyForm: { height: '', weight: '', bmi: '', body_fat: '' },
      bodyRecords: []
    }
  },
  computed: {
    bmiColor() {
      const b = this.bodyForm.bmi
      if (!b) return '#999'
      if (b < 18.5) return '#409EFF'
      if (b < 24) return '#67C23A'
      if (b < 28) return '#E6A23C'
      return '#F56C6C'
    },
    bmiLabel() {
      const b = this.bodyForm.bmi
      if (!b) return '--'
      if (b < 18.5) return '偏瘦'
      if (b < 24) return '正常'
      if (b < 28) return '超重'
      return '肥胖'
    }
  },
  async created() {
    // TODO: 对接后端 GET /user/profile 和 GET /user/body-records
    const [p, b] = await Promise.all([getProfile(), getBodyRecords()])
    this.profile = p.data
    this.bodyRecords = b.data
  },
  methods: {
    calcBMI() {
      const { height, weight } = this.bodyForm
      if (height && weight) {
        this.bodyForm.bmi = (weight / ((height / 100) ** 2)).toFixed(1)
      }
    },
    async saveProfile() {
      // TODO: 对接后端 PUT /user/profile
      await updateProfile(this.profile)
      this.$message.success('保存成功')
    },
    async saveBodyRecord() {
      // TODO: 对接后端 POST /user/body-record
      const res = await addBodyRecord({ ...this.bodyForm, record_date: new Date().toISOString().slice(0, 10) })
      this.bodyRecords.unshift(res.data)
      this.$message.success('记录成功')
    }
  }
}
</script>
