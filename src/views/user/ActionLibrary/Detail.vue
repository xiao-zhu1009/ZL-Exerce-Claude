<template>
  <div>
    <el-button icon="el-icon-arrow-left" @click="$router.back()" style="margin-bottom:16px">返回</el-button>
    <el-card v-if="action" v-loading="loading">
      <div slot="header" style="font-size:20px;font-weight:bold">{{ action.title }}</div>
      <el-row :gutter="24">
        <el-col :span="14">
          <!-- TODO: 对接后端后替换为真实视频 URL，使用 <video> 标签播放 -->
          <div style="background:#000;height:300px;display:flex;align-items:center;justify-content:center;border-radius:4px;color:#fff;font-size:14px">
            {{ action.video_url ? '视频加载中...' : '暂无教学视频' }}
          </div>
          <div style="margin-top:20px">
            <h3>动作步骤</h3>
            <el-steps direction="vertical" :active="action.steps.length" style="margin-top:12px">
              <el-step v-for="(step, i) in action.steps" :key="i" :title="`步骤 ${i+1}`" :description="step" />
            </el-steps>
          </div>
        </el-col>
        <el-col :span="10">
          <div style="margin-bottom:16px">
            <el-tag>{{ action.body_part }}</el-tag>
            <el-tag type="success" style="margin-left:8px">{{ action.category }}</el-tag>
            <el-tag :type="difficultyType(action.difficulty)" style="margin-left:8px">{{ difficultyLabel(action.difficulty) }}</el-tag>
          </div>
          <p style="color:#666;line-height:1.8">{{ action.description }}</p>
          <el-divider />
          <h4>注意事项</h4>
          <p style="color:#E6A23C;line-height:1.8">⚠️ {{ action.cautions }}</p>
          <el-divider />
          <div style="color:#999;font-size:13px">浏览次数：{{ action.view_count }}</div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
import { getActionDetail } from '../../../api/action'

export default {
  name: 'ActionDetail',
  data() { return { loading: false, action: null } },
  created() { this.fetchDetail() },
  methods: {
    async fetchDetail() {
      this.loading = true
      try {
        // TODO: 对接后端 GET /actions/:id（同时触发浏览量+1）
        const res = await getActionDetail(this.$route.params.id)
        this.action = res.data
      } finally { this.loading = false }
    },
    difficultyLabel(d) { return ['', '初级', '中级', '高级'][d] },
    difficultyType(d) { return ['', 'success', 'warning', 'danger'][d] }
  }
}
</script>
