<template>
  <div>
    <h2 style="margin-bottom:20px">动作投稿</h2>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <div slot="header">发布新动作</div>
          <el-form :model="form" label-width="90px">
            <el-form-item label="动作名称"><el-input v-model="form.title" /></el-form-item>
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
                <el-option label="初级" :value="1" /><el-option label="中级" :value="2" /><el-option label="高级" :value="3" />
              </el-select>
            </el-form-item>
            <!-- TODO: 对接后端后替换为 el-upload 组件，上传至 OSS 获取 URL -->
            <el-form-item label="视频URL"><el-input v-model="form.video_url" placeholder="暂时填写视频链接" /></el-form-item>
            <el-form-item label="动作简介"><el-input v-model="form.description" type="textarea" :rows="3" /></el-form-item>
            <el-form-item label="注意事项"><el-input v-model="form.cautions" type="textarea" :rows="2" /></el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submit">提交审核</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <div slot="header">我发布的动作</div>
          <el-table :data="myActions" size="small">
            <el-table-column prop="title" label="动作名称" />
            <el-table-column prop="body_part" label="部位" width="70" />
            <el-table-column label="状态" width="90">
              <template slot-scope="scope">
                <el-tag :type="statusType(scope.row.status)" size="small">{{ statusLabel(scope.row.status) }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { publishAction, getMyActions } from '../../../api/action'

export default {
  name: 'ActionPublish',
  data() {
    return {
      form: { title: '', body_part: '', category: '', difficulty: 1, video_url: '', description: '', cautions: '' },
      myActions: [],
      bodyParts: ['胸', '背', '腿', '肩', '手臂', '核心'],
      categories: ['力量', '有氧', '拉伸', '综合']
    }
  },
  async created() {
    // TODO: 对接后端 GET /actions/mine
    const res = await getMyActions()
    this.myActions = res.data
  },
  methods: {
    async submit() {
      if (!this.form.title) return this.$message.warning('请填写动作名称')
      // TODO: 对接后端 POST /actions（教练发布后状态为待审核）
      const res = await publishAction(this.form)
      this.myActions.unshift(res.data)
      this.form = { title: '', body_part: '', category: '', difficulty: 1, video_url: '', description: '', cautions: '' }
      this.$message.success('提交成功，等待审核')
    },
    statusLabel(s) { return ['待审核', '已上线', '已驳回', '已下架'][s] },
    statusType(s) { return ['warning', 'success', 'danger', 'info'][s] }
  }
}
</script>
