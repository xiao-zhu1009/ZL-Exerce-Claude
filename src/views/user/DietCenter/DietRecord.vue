<template>
  <div>
    <h2 style="margin-bottom:20px">饮食记录</h2>
    <el-card style="margin-bottom:16px">
      <el-row :gutter="16" align="middle" type="flex">
        <el-col :span="6">
          <el-date-picker v-model="date" type="date" value-format="yyyy-MM-dd" placeholder="选择日期" @change="fetchRecords" style="width:100%" />
        </el-col>
        <el-col :span="18">
          <span style="margin-right:20px">总热量：<b style="color:#409EFF">{{ totalCalories }} kcal</b></span>
          <span style="margin-right:20px">蛋白质：<b style="color:#67C23A">{{ totalProtein }}g</b></span>
          <span style="margin-right:20px">碳水：<b style="color:#E6A23C">{{ totalCarbs }}g</b></span>
          <span>脂肪：<b style="color:#F56C6C">{{ totalFat }}g</b></span>
        </el-col>
      </el-row>
    </el-card>

    <!-- 添加记录 -->
    <el-card style="margin-bottom:16px">
      <div slot="header">添加饮食记录</div>
      <el-row :gutter="12">
        <el-col :span="4">
          <el-select v-model="form.meal_type" placeholder="餐次">
            <el-option label="早餐" :value="1" /><el-option label="午餐" :value="2" />
            <el-option label="晚餐" :value="3" /><el-option label="加餐" :value="4" />
          </el-select>
        </el-col>
        <el-col :span="8">
          <!-- TODO: 对接后端 GET /diet/foods/search?keyword= 实现食物搜索 -->
          <el-autocomplete v-model="form.food_name" :fetch-suggestions="searchFood" placeholder="搜索食物" @select="onFoodSelect" style="width:100%">
            <template slot-scope="{ item }">{{ item.name }}</template>
          </el-autocomplete>
        </el-col>
        <el-col :span="4">
          <el-input v-model.number="form.amount" placeholder="食用量(g)" type="number" @input="calcNutrition" />
        </el-col>
        <el-col :span="4">
          <el-input :value="form.calories" placeholder="卡路里" readonly>
            <template slot="append">kcal</template>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addRecord">添加</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 按餐次展示 -->
    <el-card v-for="meal in meals" :key="meal.type" style="margin-bottom:12px">
      <div slot="header">{{ meal.label }}（{{ mealCalories(meal.type) }} kcal）</div>
      <el-table :data="recordsByMeal(meal.type)" size="small">
        <el-table-column prop="food_name" label="食物" />
        <el-table-column prop="amount" label="食用量(g)" width="100" />
        <el-table-column prop="calories" label="热量(kcal)" width="110" />
        <el-table-column prop="protein" label="蛋白质(g)" width="110" />
        <el-table-column prop="carbs" label="碳水(g)" width="100" />
        <el-table-column prop="fat" label="脂肪(g)" width="100" />
        <el-table-column label="操作" width="80">
          <template slot-scope="scope">
            <el-button size="mini" type="danger" @click="deleteRecord(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { getDietRecords, addDietRecord, deleteDietRecord, searchFoods } from '@/api/diet'

export default {
  name: 'DietRecord',
  data() {
    return {
      date: new Date().toISOString().slice(0, 10),
      records: [],
      form: { meal_type: 1, food_name: '', amount: 100, calories: 0, protein: 0, carbs: 0, fat: 0 },
      selectedFood: null,
      meals: [
        { type: 1, label: '早餐' }, { type: 2, label: '午餐' },
        { type: 3, label: '晚餐' }, { type: 4, label: '加餐' }
      ]
    }
  },
  computed: {
    totalCalories() { return this.records.reduce((s, r) => s + r.calories, 0).toFixed(0) },
    totalProtein() { return this.records.reduce((s, r) => s + r.protein, 0).toFixed(1) },
    totalCarbs() { return this.records.reduce((s, r) => s + r.carbs, 0).toFixed(1) },
    totalFat() { return this.records.reduce((s, r) => s + r.fat, 0).toFixed(1) }
  },
  created() { this.fetchRecords() },
  methods: {
    async fetchRecords() {
      // TODO: 对接后端 GET /diet/records?date=
      const res = await getDietRecords(this.date)
      this.records = res.data
    },
    async searchFood(keyword, cb) {
      // TODO: 对接后端 GET /diet/foods/search?keyword=
      const res = await searchFoods(keyword)
      cb(res.data.map(f => ({ ...f, value: f.name })))
    },
    onFoodSelect(food) {
      this.selectedFood = food
      this.form.food_name = food.name
      this.calcNutrition()
    },
    calcNutrition() {
      if (!this.selectedFood) return
      const ratio = this.form.amount / 100
      this.form.calories = +(this.selectedFood.calories * ratio).toFixed(1)
      this.form.protein = +(this.selectedFood.protein * ratio).toFixed(1)
      this.form.carbs = +(this.selectedFood.carbs * ratio).toFixed(1)
      this.form.fat = +(this.selectedFood.fat * ratio).toFixed(1)
    },
    async addRecord() {
      if (!this.form.food_name) return this.$message.warning('请选择食物')
      // TODO: 对接后端 POST /diet/records
      const res = await addDietRecord({ ...this.form, record_date: this.date })
      this.records.push(res.data)
      this.form = { meal_type: 1, food_name: '', amount: 100, calories: 0, protein: 0, carbs: 0, fat: 0 }
      this.selectedFood = null
      this.$message.success('添加成功')
    },
    async deleteRecord(id) {
      // TODO: 对接后端 DELETE /diet/records/:id
      await deleteDietRecord(id)
      this.records = this.records.filter(r => r.id !== id)
    },
    recordsByMeal(type) { return this.records.filter(r => r.meal_type === type) },
    mealCalories(type) { return this.recordsByMeal(type).reduce((s, r) => s + r.calories, 0).toFixed(0) }
  }
}
</script>
