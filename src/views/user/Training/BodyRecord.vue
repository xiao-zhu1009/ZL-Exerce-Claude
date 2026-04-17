<template>
  <div class="body-record">
    <!-- 工具栏 -->
    <div class="toolbar">
      <el-select v-model="days" size="small" style="width:120px" @change="fetchRecords">
        <el-option label="近30天" :value="30" />
        <el-option label="近90天" :value="90" />
        <el-option label="近180天" :value="180" />
        <el-option label="近365天" :value="365" />
      </el-select>
      <el-button type="primary" size="small" icon="el-icon-plus" @click="openCreate">记录指标</el-button>
    </div>

    <!-- 趋势图 -->
    <div v-if="records.length > 1" ref="chart" class="chart-box" />
    <el-empty v-else-if="!loading && records.length === 0" description="暂无记录，点击「记录指标」开始" style="padding:20px 0" />

    <!-- 记录列表 -->
    <el-table :data="records.slice().reverse()" v-loading="loading" stripe size="small" style="width:100%;margin-top:16px">
      <el-table-column prop="record_date" label="日期" width="120" />
      <el-table-column label="体重(kg)" width="100">
        <template slot-scope="{ row }">{{ row.weight != null ? row.weight : '—' }}</template>
      </el-table-column>
      <el-table-column label="体脂率(%)" width="100">
        <template slot-scope="{ row }">{{ row.body_fat != null ? row.body_fat + '%' : '—' }}</template>
      </el-table-column>
      <el-table-column label="腰围(cm)" width="100">
        <template slot-scope="{ row }">{{ row.waist != null ? row.waist : '—' }}</template>
      </el-table-column>
      <el-table-column label="胸围(cm)" width="100">
        <template slot-scope="{ row }">{{ row.chest != null ? row.chest : '—' }}</template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" show-overflow-tooltip />
      <el-table-column label="操作" width="110">
        <template slot-scope="{ row }">
          <el-button type="primary" size="mini" icon="el-icon-edit" circle @click="openEdit(row)" />
          <el-button type="danger" size="mini" icon="el-icon-delete" circle @click="handleDelete(row.id)" />
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      :title="editId ? '修改身体指标' : '记录身体指标'"
      :visible.sync="dialogVisible"
      width="400px"
      @close="resetForm"
    >
      <!-- 新增时有上次数据，提示用户 -->
      <div v-if="!editId && lastRecord" class="last-hint">
        以上次记录（{{ lastRecord.record_date }}）为基准，修改变化的数值即可
      </div>

      <el-form :model="form" :rules="rules" ref="form" label-width="100px">
        <el-form-item label="记录日期" prop="record_date">
          <el-date-picker v-model="form.record_date" type="date" value-format="yyyy-MM-dd"
            placeholder="选择日期" style="width:100%" />
        </el-form-item>
        <el-form-item label="体重 (kg)">
          <el-input-number v-model="form.weight" :min="1" :max="500" :precision="1" style="width:100%" />
        </el-form-item>
        <el-form-item label="体脂率 (%)">
          <el-input-number v-model="form.body_fat" :min="1" :max="80" :precision="1" style="width:100%" />
        </el-form-item>
        <el-form-item label="腰围 (cm)">
          <el-input-number v-model="form.waist" :min="30" :max="200" :precision="1" style="width:100%" />
        </el-form-item>
        <el-form-item label="胸围 (cm)">
          <el-input-number v-model="form.chest" :min="30" :max="200" :precision="1" style="width:100%" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="可选" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import echarts from 'echarts'
import { getBodyRecords, getLatestBodyRecord, addBodyRecord, updateBodyRecord, deleteBodyRecord } from '@/api/training'

export default {
  name: 'BodyRecord',
  data() {
    return {
      records: [],
      loading: false,
      days: 90,
      dialogVisible: false,
      submitting: false,
      editId: null,
      lastRecord: null,   // 最近一条记录，新增时预填用
      chart: null,
      form: { record_date: this.todayStr(), weight: null, body_fat: null, waist: null, chest: null, remark: '' },
      rules: {
        record_date: [{ required: true, message: '请选择日期', trigger: 'change' }],
      }
    }
  },
  created() {
    this.fetchRecords()
  },
  beforeDestroy() {
    this.chart && this.chart.dispose()
  },
  methods: {
    todayStr() {
      const d = new Date()
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    },

    async fetchRecords() {
      this.loading = true
      try {
        const res = await getBodyRecords(this.days)
        this.records = res.data || []
        this.$nextTick(this.renderChart)
      } finally {
        this.loading = false
      }
    },

    async openCreate() {
      this.editId = null
      // 拉取最近一条记录预填，日期改为今天
      try {
        const res = await getLatestBodyRecord()
        this.lastRecord = res.data || null
      } catch {
        this.lastRecord = null
      }
      if (this.lastRecord) {
        this.form = {
          record_date: this.todayStr(),
          weight:   this.lastRecord.weight,
          body_fat: this.lastRecord.body_fat,
          waist:    this.lastRecord.waist,
          chest:    this.lastRecord.chest,
          remark:   '',
        }
      } else {
        this.form = { record_date: this.todayStr(), weight: null, body_fat: null, waist: null, chest: null, remark: '' }
      }
      this.dialogVisible = true
    },

    openEdit(row) {
      this.editId = row.id
      this.lastRecord = null
      this.form = {
        record_date: row.record_date,
        weight:      row.weight,
        body_fat:    row.body_fat,
        waist:       row.waist,
        chest:       row.chest,
        remark:      row.remark || '',
      }
      this.dialogVisible = true
    },

    resetForm() {
      this.$refs.form && this.$refs.form.resetFields()
      this.editId = null
      this.lastRecord = null
    },

    async handleSubmit() {
      await this.$refs.form.validate()
      this.submitting = true
      try {
        if (this.editId) {
          await updateBodyRecord(this.editId, this.form)
          this.$message.success('修改成功')
        } else {
          await addBodyRecord(this.form)
          this.$message.success('记录成功')
        }
        this.dialogVisible = false
        this.fetchRecords()
      } finally {
        this.submitting = false
      }
    },

    async handleDelete(id) {
      await this.$confirm('确认删除该条记录？', '提示', { type: 'warning' })
      await deleteBodyRecord(id)
      this.$message.success('已删除')
      this.fetchRecords()
    },

    renderChart() {
      if (this.records.length < 2) return
      if (!this.$refs.chart) return
      if (!this.chart) this.chart = echarts.init(this.$refs.chart)

      const dates   = this.records.map(r => r.record_date)
      const weights = this.records.map(r => r.weight)
      const fats    = this.records.map(r => r.body_fat)
      const waists  = this.records.map(r => r.waist)
      const chests  = this.records.map(r => r.chest)

      // 体重/腰围/胸围量级相近，共用左轴；体脂率差异大，单独右轴
      this.chart.setOption({
        tooltip: {          trigger: 'axis',
          formatter: params => {
            const date = params[0].axisValue
            const lines = params
              .filter(p => p.value != null)
              .map(p => `${p.marker}${p.seriesName}：<b>${p.value}</b>`)
            return `${date}<br/>${lines.join('<br/>')}`
          }
        },
        legend: {
          data: ['体重(kg)', '腰围(cm)', '胸围(cm)', '体脂率(%)'],
          top: 6,
          itemWidth: 14,
          textStyle: { fontSize: 12 },
        },
        grid: { left: 50, right: 50, top: 44, bottom: 48 },
        xAxis: {
          type: 'category',
          data: dates,
          axisLabel: { rotate: 30, fontSize: 11 },
          boundaryGap: false,
        },
        yAxis: [
          {
            // 左轴：体重/腰围/胸围，自动贴近数据范围
            type: 'value',
            name: 'kg / cm',
            nameTextStyle: { fontSize: 11 },
            scale: true,          // scale:true 让轴不从0开始，放大细节变化
            splitLine: { lineStyle: { type: 'dashed' } },
            axisLabel: { fontSize: 11 },
          },
          {
            // 右轴：体脂率
            type: 'value',
            name: '%',
            nameTextStyle: { fontSize: 11 },
            scale: true,
            splitLine: { show: false },
            axisLabel: { fontSize: 11, formatter: '{value}%' },
          },
        ],
        series: [
          {
            name: '体重(kg)', type: 'line', smooth: true, yAxisIndex: 0,
            data: weights, symbol: 'circle', symbolSize: 6,
            itemStyle: { color: '#409EFF' },
            lineStyle: { width: 2 },
            areaStyle: { color: 'rgba(64,158,255,0.06)' },
            connectNulls: true,   // 有空值时连线不断开
          },
          {
            name: '腰围(cm)', type: 'line', smooth: true, yAxisIndex: 0,
            data: waists, symbol: 'circle', symbolSize: 6,
            itemStyle: { color: '#F56C6C' },
            lineStyle: { width: 2 },
            connectNulls: true,
          },
          {
            name: '胸围(cm)', type: 'line', smooth: true, yAxisIndex: 0,
            data: chests, symbol: 'circle', symbolSize: 6,
            itemStyle: { color: '#67C23A' },
            lineStyle: { width: 2 },
            connectNulls: true,
          },
          {
            name: '体脂率(%)', type: 'line', smooth: true, yAxisIndex: 1,
            data: fats, symbol: 'circle', symbolSize: 6,
            itemStyle: { color: '#E6A23C' },
            lineStyle: { width: 2, type: 'dashed' },
            connectNulls: true,
          },
        ],
      })
      this.$nextTick(() => this.chart && this.chart.resize())
    },
  }
}
</script>

<style scoped>
.body-record {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}
.toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
}
.chart-box {
  width: 1400px;
  max-width: 100%;
  min-width: 0;
  height: 400px;
  margin-top: 16px;
  box-sizing: border-box;
}
.last-hint {
  background: #f0f9eb;
  border: 1px solid #e1f3d8;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 13px;
  color: #67c23a;
  margin-bottom: 16px;
}
</style>
