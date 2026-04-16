<template>
  <div>
    <!-- 投稿表单 -->
    <el-card style="margin-bottom:20px">
      <div slot="header">投稿新食物（每 100g / 100ml 的营养素）</div>
      <el-form :model="form" :rules="rules" ref="form" label-width="110px" size="small" style="max-width:600px">
        <el-row :gutter="16">
          <el-col :span="14">
            <el-form-item label="食物名称" prop="name">
              <el-input
                v-model="form.name"
                placeholder="如：鸡胸肉、燕麦"
                @blur="checkDuplicate"
              />
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="单位" prop="unit">
              <el-select v-model="form.unit" style="width:100%">
                <el-option label="g（克）" value="g" />
                <el-option label="ml（毫升）" value="ml" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="分类" prop="category">
              <el-select v-model="form.category" placeholder="选择分类" style="width:100%">
                <el-option v-for="c in categories" :key="c" :label="c" :value="c" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="热量(kcal/100)" prop="calories">
              <el-input v-model.number="form.calories" type="number" min="0" placeholder="每100g/ml的热量" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="蛋白质(g/100)" prop="protein">
              <el-input v-model.number="form.protein" type="number" min="0" placeholder="每100g/ml含量" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="碳水(g/100)" prop="carbs">
              <el-input v-model.number="form.carbs" type="number" min="0" placeholder="每100g/ml含量" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="脂肪(g/100)" prop="fat">
              <el-input v-model.number="form.fat" type="number" min="0" placeholder="每100g/ml含量" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="膳食纤维(g/100)">
              <el-input v-model.number="form.fiber" type="number" min="0" placeholder="每100g/ml含量" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="submit">提交投稿</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 我的投稿列表 -->
    <el-card>
      <div slot="header" style="display:flex;align-items:center;justify-content:space-between">
        <span>我的投稿记录</span>
        <el-button size="small" icon="el-icon-refresh" @click="fetchList">刷新</el-button>
      </div>
      <el-table :data="list" v-loading="loading" border fit size="small">
        <el-table-column prop="name" label="食物名称" min-width="120" />
        <el-table-column prop="category" label="分类" min-width="80" />
        <el-table-column prop="unit" label="单位" min-width="60" />
        <el-table-column label="热量(kcal/100)" min-width="110">
          <template slot-scope="scope"><b style="color:#409EFF">{{ scope.row.calories }}</b></template>
        </el-table-column>
        <el-table-column label="蛋白质(g/100)" min-width="105">
          <template slot-scope="scope"><span style="color:#67C23A">{{ scope.row.protein }}</span></template>
        </el-table-column>
        <el-table-column label="碳水(g/100)" min-width="95">
          <template slot-scope="scope"><span style="color:#E6A23C">{{ scope.row.carbs }}</span></template>
        </el-table-column>
        <el-table-column label="脂肪(g/100)" min-width="95">
          <template slot-scope="scope"><span style="color:#F56C6C">{{ scope.row.fat }}</span></template>
        </el-table-column>
        <el-table-column label="状态" min-width="90">
          <template slot-scope="scope">
            <el-tag :type="statusType(scope.row.status)" size="small">{{ scope.row.status_label }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="驳回原因" min-width="140" show-overflow-tooltip>
          <template slot-scope="scope">
            <span style="color:#F56C6C">{{ scope.row.reject_reason }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="投稿时间" min-width="140" />
        <el-table-column label="操作" min-width="80">
          <template slot-scope="scope">
            <!-- 只有待审核(0)和已驳回(2)可以删除 -->
            <el-button
              v-if="scope.row.status !== 1"
              size="mini" type="danger" icon="el-icon-delete" circle
              @click="deleteFood(scope.row.id)"
            />
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { submitFood, getMyFoods, deleteMyFood, searchFoods } from '@/api/diet'

export default {
  name: 'FoodSubmit',
  data() {
    return {
      categories: ['主食', '肉类', '鱼类', '蛋类', '乳制品', '蔬菜', '水果', '坚果', '豆制品', '油脂', '补剂', '其他'],
      form: { name: '', unit: 'g', category: '', calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
      rules: {
        name:     [{ required: true, message: '请填写食物名称', trigger: 'blur' }],
        unit:     [{ required: true, message: '请选择单位', trigger: 'change' }],
        category: [{ required: true, message: '请选择分类', trigger: 'change' }],
        calories: [{ required: true, type: 'number', min: 0, message: '请填写热量', trigger: 'blur' }],
      },
      submitting: false,
      list: [],
      loading: false,
    }
  },
  created() { this.fetchList() },
  methods: {
    async fetchList() {
      this.loading = true
      try {
        const res = await getMyFoods()
        this.list = res.data || []
      } finally { this.loading = false }
    },

    submit() {
      this.$refs.form.validate(async valid => {
        if (!valid) return
        // 提交前再做一次查重兜底
        const duplicate = await this.findDuplicate(this.form.name)
        if (duplicate) {
          this.$message.warning(`「${duplicate.name}」已在食物库中（分类：${duplicate.category}），无需重复投稿`)
          return
        }
        this.submitting = true
        try {
          const res = await submitFood({ ...this.form })
          if (res.code === 200) {
            this.$message.success('投稿成功，等待管理员审核')
            this.resetForm()
            this.fetchList()
          } else {
            this.$message.error(res.msg || '投稿失败')
          }
        } finally { this.submitting = false }
      })
    },

    // 名称失焦时检查是否已存在于食物库
    async checkDuplicate() {
      const name = this.form.name.trim()
      if (!name) return
      const duplicate = await this.findDuplicate(name)
      if (duplicate) {
        this.$notify({
          title: '食物库已有该食物',
          message: `「${duplicate.name}」已在食物库中（分类：${duplicate.category}），用户可直接搜索使用，无需重复投稿。`,
          type: 'warning',
          duration: 5000,
        })
      }
    },

    // 精确匹配食物库，返回同名已通过的食物，没有则返回 null
    async findDuplicate(name) {
      try {
        const res = await searchFoods(name)
        const match = (res.data || []).find(f => f.name === name)
        return match || null
      } catch { return null }
    },

    resetForm() {
      this.$refs.form.resetFields()
      this.form = { name: '', unit: 'g', category: '', calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    },

    async deleteFood(id) {
      await this.$confirm('确认删除该投稿？', '提示', { type: 'warning' })
      const res = await deleteMyFood(id)
      if (res.code === 200) {
        this.$message.success('已删除')
        this.list = this.list.filter(f => f.id !== id)
      } else {
        this.$message.error(res.msg || '删除失败')
      }
    },

    statusType(s) { return { 0: 'info', 1: 'success', 2: 'danger' }[s] || 'info' }
  }
}
</script>
