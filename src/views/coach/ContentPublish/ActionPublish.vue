<template>
  <div>
    <h2 style="margin-bottom:20px">动作投稿</h2>
    <el-row :gutter="20">

      <!-- 左：发布表单 -->
      <el-col :span="13">
        <el-card>
          <div slot="header">{{ editId ? '修改动作（重新提交审核）' : '发布新动作' }}</div>
          <el-form :model="form" label-width="90px">
            <el-form-item label="动作名称">
              <el-input v-model="form.title" placeholder="请输入动作名称" />
            </el-form-item>
            <el-form-item label="训练部位">
              <el-select v-model="form.body_part" style="width:100%">
                <el-option v-for="p in bodyParts" :key="p" :label="p" :value="p" />
              </el-select>
            </el-form-item>
            <el-form-item label="动作类型">
              <el-select v-model="form.category" style="width:100%">
                <el-option v-for="c in categories" :key="c" :label="c" :value="c" />
              </el-select>
            </el-form-item>
            <el-form-item label="难度">
              <el-select v-model="form.difficulty" style="width:100%">
                <el-option label="初级" :value="1" />
                <el-option label="中级" :value="2" />
                <el-option label="高级" :value="3" />
              </el-select>
            </el-form-item>
            <el-form-item label="视频URL">
              <el-input v-model="form.video_url" placeholder="填写视频链接（后续支持上传）" />
            </el-form-item>
            <el-form-item label="动作简介">
              <el-input v-model="form.description" type="textarea" :rows="2" />
            </el-form-item>

            <!-- 步骤：动态增删列表 -->
            <el-form-item label="动作步骤">
              <div v-for="(step, i) in form.steps" :key="i" style="display:flex;margin-bottom:6px">
                <el-input v-model="form.steps[i]" :placeholder="`步骤 ${i + 1}`" size="small" />
                <el-button
                  icon="el-icon-minus"
                  size="mini"
                  type="danger"
                  plain
                  style="margin-left:6px"
                  @click="removeStep(i)"
                />
              </div>
              <el-button size="mini" icon="el-icon-plus" @click="addStep">添加步骤</el-button>
            </el-form-item>

            <!-- 注意事项：动态增删列表 -->
            <el-form-item label="注意事项">
              <div v-for="(c, i) in form.cautions" :key="i" style="display:flex;margin-bottom:6px">
                <el-input v-model="form.cautions[i]" :placeholder="`注意事项 ${i + 1}`" size="small" />
                <el-button
                  icon="el-icon-minus"
                  size="mini"
                  type="danger"
                  plain
                  style="margin-left:6px"
                  @click="removeCaution(i)"
                />
              </div>
              <el-button size="mini" icon="el-icon-plus" @click="addCaution">添加注意事项</el-button>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" :loading="submitting" @click="submit">
                {{ editId ? '重新提交审核' : '提交审核' }}
              </el-button>
              <el-button v-if="editId" @click="cancelEdit">取消修改</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 右：我的投稿列表 -->
      <el-col :span="11">
        <el-card>
          <div slot="header">我发布的动作</div>
          <el-table :data="myActions" size="small">
            <el-table-column prop="title" label="动作名称" show-overflow-tooltip />
            <el-table-column prop="body_part" label="部位" width="60" />
            <el-table-column label="状态" width="80">
              <template slot-scope="scope">
                <el-tag :type="statusType(scope.row.status)" size="small">
                  {{ statusLabel(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="110">
              <template slot-scope="scope">
                <!-- 被驳回时可修改 -->
                <el-button
                  v-if="scope.row.status === 2"
                  size="mini"
                  type="warning"
                  @click="startEdit(scope.row)"
                >修改</el-button>
                <!-- 待审核/已驳回可删除 -->
                <el-button
                  v-if="scope.row.status === 0 || scope.row.status === 2"
                  size="mini"
                  type="danger"
                  @click="handleDelete(scope.row)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <!-- 驳回原因展开提示 -->
          <div
            v-for="a in myActions.filter(a => a.status === 2 && a.reject_reason)"
            :key="'r' + a.id"
            style="margin-top:6px;padding:6px 10px;background:#fff5f5;border-radius:4px;font-size:12px;color:#F56C6C"
          >
            《{{ a.title }}》驳回原因：{{ a.reject_reason }}
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { publishAction, getMyActions, updateMyAction, deleteMyAction } from '@/api/action'

export default {
  name: 'ActionPublish',
  data() {
    return {
      submitting: false,
      editId: null,  // 非 null 时为修改模式
      form: {
        title: '', body_part: '', category: '', difficulty: 1,
        video_url: '', description: '',
        steps: [],     // 步骤列表
        cautions: []   // 注意事项列表
      },
      myActions: [],
      bodyParts: ['胸', '背', '腿', '肩', '手臂', '核心'],
      categories: ['力量', '有氧', '拉伸', '综合']
    }
  },
  async created() {
    await this.loadMyActions()
  },
  methods: {
    async loadMyActions() {
      const res = await getMyActions()
      this.myActions = res.data
    },
    async submit() {
      if (!this.form.title) return this.$message.warning('请填写动作名称')
      if (!this.form.body_part) return this.$message.warning('请选择训练部位')
      // 过滤掉空字符串的步骤和注意事项
      const data = {
        ...this.form,
        steps: this.form.steps.filter(s => s.trim()),
        cautions: this.form.cautions.filter(c => c.trim())
      }
      this.submitting = true
      try {
        if (this.editId) {
          await updateMyAction(this.editId, data)
          this.$message.success('已重新提交审核')
        } else {
          await publishAction(data)
          this.$message.success('提交成功，等待审核')
        }
        this.cancelEdit()
        await this.loadMyActions()
      } finally {
        this.submitting = false
      }
    },
    startEdit(row) {
      // 将被驳回的动作数据填入表单
      this.editId = row.id
      this.form = {
        title: row.title,
        body_part: row.body_part,
        category: row.category,
        difficulty: row.difficulty,
        video_url: row.video_url || '',
        description: row.description || '',
        steps: row.steps ? [...row.steps] : [],
        cautions: row.cautions ? [...row.cautions] : []
      }
    },
    cancelEdit() {
      this.editId = null
      this.form = {
        title: '', body_part: '', category: '', difficulty: 1,
        video_url: '', description: '', steps: [], cautions: []
      }
    },
    async handleDelete(row) {
      await this.$confirm(`确认删除《${row.title}》？`, '提示', { type: 'warning' })
      await deleteMyAction(row.id)
      this.$message.success('已删除')
      await this.loadMyActions()
    },
    addStep() { this.form.steps.push('') },
    removeStep(i) { this.form.steps.splice(i, 1) },
    addCaution() { this.form.cautions.push('') },
    removeCaution(i) { this.form.cautions.splice(i, 1) },
    statusLabel(s) { return ['待审核', '已上线', '已驳回', '已下架'][s] },
    statusType(s) { return ['warning', 'success', 'danger', 'info'][s] }
  }
}
</script>
