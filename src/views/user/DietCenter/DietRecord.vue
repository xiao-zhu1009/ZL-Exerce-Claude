<template>
  <div>
    <h2 style="margin-bottom:20px">饮食记录</h2>

    <el-tabs v-model="activeTab" @tab-click="onTabChange">

      <!-- ── Tab1：每日详情 ─────────────────────────────────────── -->
      <el-tab-pane label="每日详情" name="daily">
        <!-- 顶部：日期选择 + 当日营养汇总 -->
        <el-card style="margin-bottom:16px">
          <el-row :gutter="16" align="middle" type="flex">
            <el-col :span="6">
              <el-date-picker v-model="date" type="date" value-format="yyyy-MM-dd"
                placeholder="选择日期" @change="fetchRecords" style="width:100%" />
            </el-col>
            <el-col :span="14">
              <span style="margin-right:24px">总热量：<b style="color:#409EFF;font-size:16px">{{ totalCalories }}</b> kcal</span>
              <span style="margin-right:20px">蛋白质：<b style="color:#67C23A">{{ totalProtein }}g</b></span>
              <span style="margin-right:20px">碳水：<b style="color:#E6A23C">{{ totalCarbs }}g</b></span>
              <span>脂肪：<b style="color:#F56C6C">{{ totalFat }}g</b></span>
            </el-col>
            <el-col :span="4" style="text-align:right">
              <el-button type="primary" icon="el-icon-plus" @click="openDialog">添加记录</el-button>
            </el-col>
          </el-row>
        </el-card>

        <!-- 按餐次展示 -->
        <el-card v-for="meal in meals" :key="meal.type" style="margin-bottom:12px">
          <div slot="header" style="display:flex;align-items:center;justify-content:space-between">
            <span>{{ meal.label }}
              <el-tag size="small" type="info" style="margin-left:8px">{{ mealCalories(meal.type) }} kcal</el-tag>
            </span>
          </div>
          <el-empty v-if="recordsByMeal(meal.type).length === 0" description="暂无记录" :image-size="48" />
          <el-table v-else :data="recordsByMeal(meal.type)" size="small" fit border>
            <el-table-column prop="food_name" label="食物" min-width="120" show-overflow-tooltip />
            <el-table-column label="食用量" min-width="80">
              <template slot-scope="scope">{{ scope.row.amount }}{{ scope.row.unit || 'g' }}</template>
            </el-table-column>
            <el-table-column label="热量(kcal)" min-width="90">
              <template slot-scope="scope"><b style="color:#409EFF">{{ toNum(scope.row.calories) }}</b></template>
            </el-table-column>
            <el-table-column label="蛋白质(g)" min-width="90">
              <template slot-scope="scope"><span style="color:#67C23A">{{ toNum(scope.row.protein) }}</span></template>
            </el-table-column>
            <el-table-column label="碳水(g)" min-width="80">
              <template slot-scope="scope"><span style="color:#E6A23C">{{ toNum(scope.row.carbs) }}</span></template>
            </el-table-column>
            <el-table-column label="脂肪(g)" min-width="80">
              <template slot-scope="scope"><span style="color:#F56C6C">{{ toNum(scope.row.fat) }}</span></template>
            </el-table-column>
            <el-table-column label="操作" min-width="100">
              <template slot-scope="scope">
                <el-button size="mini" type="primary" icon="el-icon-edit" circle @click="openEditDialog(scope.row)" style="margin-right:4px" />
                <el-button size="mini" type="danger" icon="el-icon-delete" circle @click="deleteRecord(scope.row.id)" />
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <!-- ── Tab2：近期趋势 ─────────────────────────────────────── -->
      <el-tab-pane label="近期趋势" name="trend">
        <!-- 时间范围选择 -->
        <el-card style="margin-bottom:16px">
          <el-row :gutter="12" align="middle" type="flex">
            <el-col :span="4" style="color:#606266;font-size:14px">查看范围：</el-col>
            <el-col :span="12">
              <el-radio-group v-model="trendDays" @change="fetchTrend" size="small">
                <el-radio-button :label="7">近 7 天</el-radio-button>
                <el-radio-button :label="14">近 14 天</el-radio-button>
                <el-radio-button :label="30">近 30 天</el-radio-button>
              </el-radio-group>
            </el-col>
            <el-col :span="8" style="text-align:right;color:#909399;font-size:13px">
              {{ trendDateRange }}
            </el-col>
          </el-row>
        </el-card>

        <!-- 区间汇总统计 -->
        <el-row :gutter="12" style="margin-bottom:16px">
          <el-col :span="6">
            <el-card shadow="never" class="stat-card">
              <div class="stat-label">平均热量</div>
              <div class="stat-value" style="color:#409EFF">{{ trendAvg.calories }} <small>kcal/天</small></div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="never" class="stat-card">
              <div class="stat-label">平均蛋白质</div>
              <div class="stat-value" style="color:#67C23A">{{ trendAvg.protein }} <small>g/天</small></div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="never" class="stat-card">
              <div class="stat-label">平均碳水</div>
              <div class="stat-value" style="color:#E6A23C">{{ trendAvg.carbs }} <small>g/天</small></div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="never" class="stat-card">
              <div class="stat-label">平均脂肪</div>
              <div class="stat-value" style="color:#F56C6C">{{ trendAvg.fat }} <small>g/天</small></div>
            </el-card>
          </el-col>
        </el-row>

        <!-- ECharts 图表 -->
        <el-card style="margin-bottom:16px" v-loading="trendLoading">
          <div slot="header">每日营养趋势</div>
          <div ref="trendChart" style="height:300px" /></el-card>

        <!-- 明细表格 -->
        <el-card v-loading="trendLoading">
          <div slot="header">每日明细</div>
          <el-table :data="trendData" size="small" fit border>
            <el-table-column prop="date" label="日期" min-width="100" />
            <el-table-column label="热量(kcal)" min-width="100">
              <template slot-scope="scope">
                <b :style="{ color: scope.row.calories ? '#409EFF' : '#c0c4cc' }">{{ scope.row.calories || '—' }}</b>
              </template>
            </el-table-column>
            <el-table-column label="蛋白质(g)" min-width="100">
              <template slot-scope="scope">
                <span :style="{ color: scope.row.protein ? '#67C23A' : '#c0c4cc' }">{{ scope.row.protein || '—' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="碳水(g)" min-width="90">
              <template slot-scope="scope">
                <span :style="{ color: scope.row.carbs ? '#E6A23C' : '#c0c4cc' }">{{ scope.row.carbs || '—' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="脂肪(g)" min-width="90">
              <template slot-scope="scope">
                <span :style="{ color: scope.row.fat ? '#F56C6C' : '#c0c4cc' }">{{ scope.row.fat || '—' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="" min-width="80">
              <template slot-scope="scope">
                <!-- 点击跳转到该天详情 -->
                <el-button v-if="scope.row.calories" size="mini" type="text"
                  @click="jumpToDate(scope.row.date)">查看详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 添加记录弹窗 -->
    <el-dialog title="添加饮食记录" :visible.sync="dialogVisible" width="860px" top="5vh" @close="resetDialog">
      <el-form inline style="margin-bottom:12px">
        <el-form-item label="餐次">
          <el-radio-group v-model="dialogMealType">
            <el-radio-button :label="1">早餐</el-radio-button>
            <el-radio-button :label="2">午餐</el-radio-button>
            <el-radio-button :label="3">晚餐</el-radio-button>
            <el-radio-button :label="4">加餐</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item style="float:right">
          <el-button size="small" icon="el-icon-plus" @click="addRow">添加一行</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="rows" border size="small">
        <el-table-column label="食物名称" min-width="160">
          <template slot-scope="scope">
            <el-autocomplete
              v-model="scope.row.food_name"
              :fetch-suggestions="(kw, cb) => searchFood(kw, cb, scope.$index)"
              placeholder="搜索或手动输入"
              size="small" style="width:100%"
              @select="item => onFoodSelect(item, scope.$index)"
              @input="() => { scope.row._food = null }"
            >
              <template slot-scope="{ item }">
                <span>{{ item.name }}</span>
                <span style="color:#999;font-size:12px;margin-left:8px">{{ item.category }}</span>
              </template>
            </el-autocomplete>
          </template>
        </el-table-column>
        <el-table-column label="食用量(g)" min-width="100">
          <template slot-scope="scope">
            <el-input v-model.number="scope.row.amount" size="small" type="number" min="1" @input="recalc(scope.$index)" />
          </template>
        </el-table-column>
        <el-table-column label="热量(kcal)" min-width="100">
          <template slot-scope="scope">
            <el-input v-model.number="scope.row.calories" size="small" type="number" min="0" :class="scope.row._food ? 'auto-filled' : ''" />
          </template>
        </el-table-column>
        <el-table-column label="蛋白质(g)" min-width="100">
          <template slot-scope="scope">
            <el-input v-model.number="scope.row.protein" size="small" type="number" min="0" :class="scope.row._food ? 'auto-filled' : ''" />
          </template>
        </el-table-column>
        <el-table-column label="碳水(g)" min-width="90">
          <template slot-scope="scope">
            <el-input v-model.number="scope.row.carbs" size="small" type="number" min="0" :class="scope.row._food ? 'auto-filled' : ''" />
          </template>
        </el-table-column>
        <el-table-column label="脂肪(g)" min-width="90">
          <template slot-scope="scope">
            <el-input v-model.number="scope.row.fat" size="small" type="number" min="0" :class="scope.row._food ? 'auto-filled' : ''" />
          </template>
        </el-table-column>
        <el-table-column label="" width="44">
          <template slot-scope="scope">
            <el-button size="mini" type="danger" icon="el-icon-close" circle
              :disabled="rows.length === 1" @click="removeRow(scope.$index)" />
          </template>
        </el-table-column>
      </el-table>

      <div style="margin-top:12px;padding:10px 12px;background:#f5f7fa;border-radius:4px;font-size:13px">
        本次合计：
        <b style="color:#409EFF">{{ batchCalories }} kcal</b>
        <span style="margin-left:16px;color:#67C23A">蛋白质 {{ batchProtein }}g</span>
        <span style="margin-left:12px;color:#E6A23C">碳水 {{ batchCarbs }}g</span>
        <span style="margin-left:12px;color:#F56C6C">脂肪 {{ batchFat }}g</span>
      </div>

      <div slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitBatch">
          确认添加（{{ rows.length }} 项）
        </el-button>
      </div>
    </el-dialog>

    <!-- 编辑记录弹窗 -->
    <el-dialog title="修改饮食记录" :visible.sync="editVisible" width="480px">
      <el-form :model="editForm" label-width="80px" size="small">
        <el-form-item label="食物名称">
          <el-input v-model="editForm.food_name" placeholder="食物名称" />
        </el-form-item>
        <el-form-item label="餐次">
          <el-radio-group v-model="editForm.meal_type">
            <el-radio :label="1">早餐</el-radio>
            <el-radio :label="2">午餐</el-radio>
            <el-radio :label="3">晚餐</el-radio>
            <el-radio :label="4">加餐</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="食用量(g)">
          <el-input v-model.number="editForm.amount" type="number" min="1" />
        </el-form-item>
        <el-form-item label="热量(kcal)">
          <el-input v-model.number="editForm.calories" type="number" min="0" />
        </el-form-item>
        <el-form-item label="蛋白质(g)">
          <el-input v-model.number="editForm.protein" type="number" min="0" />
        </el-form-item>
        <el-form-item label="碳水(g)">
          <el-input v-model.number="editForm.carbs" type="number" min="0" />
        </el-form-item>
        <el-form-item label="脂肪(g)">
          <el-input v-model.number="editForm.fat" type="number" min="0" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" :loading="editSubmitting" @click="submitEdit">保存修改</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getDietRecords, addDietRecord, updateDietRecord, deleteDietRecord, searchFoods, getDietRangeSummary } from '@/api/diet'
import * as echarts from 'echarts'

const emptyRow = () => ({ food_name: '', amount: 100, calories: 0, protein: 0, carbs: 0, fat: 0, _food: null })

export default {
  name: 'DietRecord',
  data() {
    return {
      activeTab: 'daily',
      date: new Date().toISOString().slice(0, 10),
      records: [],
      meals: [
        { type: 1, label: '早餐' }, { type: 2, label: '午餐' },
        { type: 3, label: '晚餐' }, { type: 4, label: '加餐' }
      ],
      // 弹窗
      dialogVisible: false,
      dialogMealType: 1,
      rows: [emptyRow()],
      submitting: false,
      // 编辑弹窗
      editVisible: false,
      editForm: {},
      editSubmitting: false,
      // 趋势
      trendDays: 7,
      trendData: [],
      trendLoading: false,
      _chart: null   // echarts 实例
    }
  },
  computed: {
    totalCalories() { return this.records.reduce((s, r) => s + Number(r.calories), 0).toFixed(0) },
    totalProtein()  { return this.records.reduce((s, r) => s + Number(r.protein), 0).toFixed(1) },
    totalCarbs()    { return this.records.reduce((s, r) => s + Number(r.carbs), 0).toFixed(1) },
    totalFat()      { return this.records.reduce((s, r) => s + Number(r.fat), 0).toFixed(1) },
    batchCalories() { return this.rows.reduce((s, r) => s + Number(r.calories || 0), 0).toFixed(0) },
    batchProtein()  { return this.rows.reduce((s, r) => s + Number(r.protein || 0), 0).toFixed(1) },
    batchCarbs()    { return this.rows.reduce((s, r) => s + Number(r.carbs || 0), 0).toFixed(1) },
    batchFat()      { return this.rows.reduce((s, r) => s + Number(r.fat || 0), 0).toFixed(1) },
    // 趋势区间文字
    trendDateRange() {
      if (!this.trendData.length) return ''
      return `${this.trendData[0].date} ~ ${this.trendData[this.trendData.length - 1].date}`
    },
    // 有记录的天数均值（排除 0 值天，避免拉低平均）
    trendAvg() {      const active = this.trendData.filter(d => d.calories > 0)
      if (!active.length) return { calories: '—', protein: '—', carbs: '—', fat: '—' }
      const avg = k => (active.reduce((s, d) => s + d[k], 0) / active.length).toFixed(1)
      return { calories: avg('calories'), protein: avg('protein'), carbs: avg('carbs'), fat: avg('fat') }
    }
  },
  created() { this.fetchRecords() },
  methods: {
    onTabChange(tab) {
      if (tab.name === 'trend' && !this.trendData.length) this.fetchTrend()
    },

    async fetchRecords() {
      const res = await getDietRecords(this.date)
      this.records = res.data || []
    },

    async fetchTrend() {
      this.trendLoading = true
      try {
        const res = await getDietRangeSummary({ days: this.trendDays })
        this.trendData = res.data || []
        this.$nextTick(() => this.renderChart())
      } finally { this.trendLoading = false }
    },

    renderChart() {
      const el = this.$refs.trendChart
      if (!el) return
      if (!this._chart) {
        this._chart = echarts.init(el)
        // 窗口缩放时自适应
        window.addEventListener('resize', () => this._chart && this._chart.resize())
      }
      const dates    = this.trendData.map(d => d.date.slice(5))  // MM-DD
      const calories = this.trendData.map(d => d.calories)
      const protein  = this.trendData.map(d => d.protein)
      const carbs    = this.trendData.map(d => d.carbs)
      const fat      = this.trendData.map(d => d.fat)

      this._chart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'cross' },
          formatter(params) {
            let s = `<b>${params[0].axisValue}</b><br/>`
            params.forEach(p => { s += `${p.marker}${p.seriesName}：<b>${p.value}</b>${p.seriesName === '热量' ? ' kcal' : ' g'}<br/>` })
            return s
          }
        },
        legend: { data: ['热量', '蛋白质', '碳水', '脂肪'], bottom: 0 },
        grid: { left: 50, right: 50, top: 20, bottom: 40 },
        xAxis: { type: 'category', data: dates, axisLabel: { fontSize: 11 } },
        yAxis: [
          { type: 'value', name: 'kcal', nameTextStyle: { color: '#409EFF' }, axisLabel: { color: '#409EFF' } },
          { type: 'value', name: 'g',    nameTextStyle: { color: '#999' },    axisLabel: { color: '#999' }, splitLine: { show: false } }
        ],
        series: [
          {
            name: '热量', type: 'bar', yAxisIndex: 0,
            data: calories,
            itemStyle: { color: '#409EFF', borderRadius: [3, 3, 0, 0] },
            label: { show: true, position: 'top', fontSize: 11, color: '#409EFF',
              formatter: v => v.value ? v.value : '' }
          },
          { name: '蛋白质', type: 'line', yAxisIndex: 1, data: protein,
            smooth: true, symbol: 'circle', symbolSize: 5,
            lineStyle: { color: '#67C23A' }, itemStyle: { color: '#67C23A' } },
          { name: '碳水',   type: 'line', yAxisIndex: 1, data: carbs,
            smooth: true, symbol: 'circle', symbolSize: 5,
            lineStyle: { color: '#E6A23C' }, itemStyle: { color: '#E6A23C' } },
          { name: '脂肪',   type: 'line', yAxisIndex: 1, data: fat,
            smooth: true, symbol: 'circle', symbolSize: 5,
            lineStyle: { color: '#F56C6C' }, itemStyle: { color: '#F56C6C' } },
        ]
      }, true)
    },

    // 点击趋势表格"查看详情"跳到每日详情 tab
    jumpToDate(date) {
      this.date = date
      this.activeTab = 'daily'
      this.fetchRecords()
    },

    openDialog() {
      this.dialogMealType = 1
      this.rows = [emptyRow()]
      this.dialogVisible = true
    },

    openEditDialog(row) {
      // 深拷贝，避免直接修改 records 里的对象
      this.editForm = {
        id: row.id,
        food_name: row.food_name,
        meal_type: row.meal_type,
        amount: Number(row.amount),
        calories: Number(row.calories),
        protein: Number(row.protein),
        carbs: Number(row.carbs),
        fat: Number(row.fat),
      }
      this.editVisible = true
    },

    async submitEdit() {
      if (!this.editForm.food_name || !this.editForm.food_name.trim()) {
        return this.$message.warning('食物名称不能为空')
      }
      if (!this.editForm.amount || this.editForm.amount <= 0) {
        return this.$message.warning('食用量必须大于 0')
      }
      this.editSubmitting = true
      try {
        const { id, ...fields } = this.editForm
        const res = await updateDietRecord(id, fields)
        if (res.code === 200) {
          // 用返回的最新数据替换 records 中对应项
          const idx = this.records.findIndex(r => r.id === id)
          if (idx !== -1) this.$set(this.records, idx, { ...this.records[idx], ...res.data })
          this.editVisible = false
          this.$message.success('修改成功')
          if (this.trendData.length) this.fetchTrend()
        } else {
          this.$message.error(res.message || '修改失败')
        }
      } finally {
        this.editSubmitting = false
      }
    },
    resetDialog() { this.rows = [emptyRow()] },
    addRow()  { this.rows.push(emptyRow()) },
    removeRow(i) { this.rows.splice(i, 1) },

    async searchFood(keyword, cb) {
      if (!keyword) return cb([])
      try {
        const res = await searchFoods(keyword)
        cb((res.data || []).map(f => ({ ...f, value: f.name })))
      } catch { cb([]) }
    },

    onFoodSelect(food, index) {
      const row = this.rows[index]
      row._food = food
      row.food_name = food.name
      this.recalc(index)
    },

    recalc(index) {
      const row = this.rows[index]
      if (!row._food) return
      const ratio = (row.amount || 0) / 100
      row.calories = +(row._food.calories * ratio).toFixed(1)
      row.protein  = +(row._food.protein  * ratio).toFixed(1)
      row.carbs    = +(row._food.carbs    * ratio).toFixed(1)
      row.fat      = +(row._food.fat      * ratio).toFixed(1)
    },

    async submitBatch() {
      const invalid = this.rows.find(r => !r.food_name.trim() || !r.amount || r.amount <= 0)
      if (invalid) return this.$message.warning('请填写完整的食物名称和食用量')
      this.submitting = true
      try {
        const results = []
        for (const row of this.rows) {
          const res = await addDietRecord({
            food_id: row._food ? row._food.id : null,
            food_name: row.food_name.trim(),
            meal_type: this.dialogMealType,
            amount: row.amount,
            calories: row.calories || 0,
            protein: row.protein || 0,
            carbs: row.carbs || 0,
            fat: row.fat || 0,
            record_date: this.date
          })
          if (res.code === 200) results.push(res.data)
          else throw new Error(res.message || '添加失败')
        }
        this.records.push(...results)
        this.dialogVisible = false
        this.$message.success(`成功添加 ${results.length} 条记录`)
        // 若趋势已加载，刷新一次
        if (this.trendData.length) this.fetchTrend()
      } catch (e) {
        this.$message.error(e.message || '部分记录添加失败')
      } finally { this.submitting = false }
    },

    async deleteRecord(id) {
      await this.$confirm('确认删除该条记录？', '提示', { type: 'warning' })
      const res = await deleteDietRecord(id)
      if (res.code === 200) {
        this.records = this.records.filter(r => r.id !== id)
        if (this.trendData.length) this.fetchTrend()
      } else {
        this.$message.error(res.message || '删除失败')
      }
    },

    recordsByMeal(type) { return this.records.filter(r => r.meal_type === type) },
    mealCalories(type)  { return this.recordsByMeal(type).reduce((s, r) => s + Number(r.calories), 0).toFixed(0) },
    toNum(v)            { return Number(v).toFixed(1) }
  }
}
</script>

<style scoped>
.auto-filled >>> .el-input__inner { background: #f0f9eb; color: #67C23A; }

.stat-card { text-align: center; padding: 4px 0; }
.stat-label { font-size: 13px; color: #909399; margin-bottom: 6px; }
.stat-value { font-size: 22px; font-weight: bold; line-height: 1.2; }
.stat-value small { font-size: 12px; font-weight: normal; color: #909399; }
</style>
