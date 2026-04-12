<template>
  <div>
    <el-button icon="el-icon-arrow-left" @click="$router.back()" style="margin-bottom:16px">返回</el-button>
    <el-card v-if="action" v-loading="loading">
      <div slot="header" style="font-size:20px;font-weight:bold">{{ action.title }}</div>
      <el-row :gutter="24">
        <el-col :span="14">
          <!-- 视频区域：有 video_url 则播放，否则显示占位 -->
          <video
            v-if="action.video_url"
            :src="mediaUrl(action.video_url)"
            controls
            style="width:100%;border-radius:4px;background:#000;max-height:320px"
          />
          <div
            v-else
            style="background:#1a1a1a;height:280px;display:flex;align-items:center;justify-content:center;border-radius:4px;color:#666;font-size:14px"
          >
            暂无教学视频
          </div>

          <div style="margin-top:20px">
            <h3>动作步骤</h3>
            <el-steps direction="vertical" :active="(action.steps || []).length" style="margin-top:12px">
              <el-step
                v-for="(step, i) in (action.steps || [])"
                :key="i"
                :title="`步骤 ${i + 1}`"
                :description="step"
              />
            </el-steps>
          </div>
        </el-col>

        <el-col :span="10">
          <div style="margin-bottom:16px">
            <el-tag>{{ action.body_part }}</el-tag>
            <el-tag type="success" style="margin-left:8px">{{ action.category }}</el-tag>
            <el-tag :type="difficultyType(action.difficulty)" style="margin-left:8px">
              {{ difficultyLabel(action.difficulty) }}
            </el-tag>
          </div>

          <p style="color:#666;line-height:1.8">{{ action.description }}</p>
          <el-divider />

          <h4>注意事项</h4>
          <!-- cautions 后端返回数组，逐条渲染 -->
          <div v-for="(c, i) in (action.cautions || [])" :key="i" style="color:#E6A23C;line-height:2">
            ⚠️ {{ c }}
          </div>
          <el-divider />

          <div style="color:#999;font-size:13px">
            投稿教练：{{ action.author_name || '—' }}
          </div>
          <div style="color:#999;font-size:13px;margin-top:4px">
            浏览次数：{{ action.view_count }}
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
import { getActionDetail } from '@/api/action'

const BASE_URL = process.env.VUE_APP_API_BASE || 'http://127.0.0.1:8008/api'

export default {
  name: 'ActionDetail',
  data() {
    return {
      loading: false,
      action: null
    }
  },
  created() {
    this.fetchDetail()
  },
  methods: {
    async fetchDetail() {
      this.loading = true
      try {
        const res = await getActionDetail(this.$route.params.id)
        this.action = res.data
      } finally {
        this.loading = false
      }
    },
    // 拼接静态资源完整 URL（cover_img / video_url 存的是相对路径）
    mediaUrl(path) {
      return `${BASE_URL}/static/${path}`
    },
    difficultyLabel(d) { return ['', '初级', '中级', '高级'][d] },
    difficultyType(d) { return ['', 'success', 'warning', 'danger'][d] }
  }
}
</script>
