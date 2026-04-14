<template>
  <div>
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

            <!-- ── 封面图上传 ──────────────────────────────────────────────
                 el-upload 的 :before-upload 钩子拦截默认上传行为，
                 改为手动调用 handleCoverUpload，上传成功后把后端返回的
                 相对路径写入 form.cover_img。
                 :auto-upload="false" + before-upload 返回 false = 完全手动控制。
            ──────────────────────────────────────────────────────────────── -->
            <el-form-item label="封面图">
              <el-upload
                action="#"
                :show-file-list="false"
                :before-upload="handleCoverUpload"
                accept="image/jpeg,image/png,image/webp"
              >
                <!-- 已有封面图时显示预览，否则显示上传按钮 -->
                <img
                  v-if="form.cover_img"
                  :src="mediaUrl(form.cover_img)"
                  class="cover-preview"
                />
                <div v-else class="upload-placeholder">
                  <i class="el-icon-plus" style="font-size:24px;color:#999" />
                  <div style="font-size:12px;color:#999;margin-top:4px">点击上传封面图</div>
                </div>
              </el-upload>
              <!-- 上传中显示进度 -->
              <div v-if="coverUploading" style="margin-top:4px;font-size:12px;color:#409EFF">
                <i class="el-icon-loading" /> 封面图上传中...
              </div>
              <!-- 已上传成功显示文件路径提示 -->
              <div v-if="form.cover_img && !coverUploading" style="margin-top:4px;font-size:12px;color:#67C23A">
                ✓ 封面图已上传
              </div>
            </el-form-item>

            <!-- ── 视频上传 ────────────────────────────────────────────────
                 视频文件较大，使用 uploadActionVideo 的 onProgress 回调
                 实时更新 videoProgress（0~100），用 el-progress 展示进度条。
                 上传完成后 form.video_url 存储相对路径，提交时一起带给后端。
            ──────────────────────────────────────────────────────────────── -->
            <el-form-item label="教学视频">
              <el-upload
                action="#"
                :show-file-list="false"
                :before-upload="handleVideoUpload"
                accept="video/mp4,video/webm"
              >
                <el-button size="small" icon="el-icon-video-camera">
                  {{ form.video_url ? '重新上传视频' : '上传视频' }}
                </el-button>
              </el-upload>

              <!-- 上传进度条：videoProgress > 0 且未完成时显示 -->
              <el-progress
                v-if="videoUploading"
                :percentage="videoProgress"
                style="margin-top:8px"
              />

              <!-- 视频上传成功后显示本地预览，让教练确认上传的是正确视频 -->
              <div v-if="form.video_url && !videoUploading" style="margin-top:8px">
                <video
                  :src="mediaUrl(form.video_url)"
                  controls
                  style="width:100%;max-height:180px;border-radius:4px;background:#000"
                />
                <div style="font-size:12px;color:#67C23A;margin-top:4px">✓ 视频已上传</div>
              </div>
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
          <el-table :data="myActions" size="small" fit style="width: 100%">
            <el-table-column prop="title" label="动作名称" min-width="150" />
            <el-table-column prop="body_part" label="部位" min-width="120" />
            <el-table-column label="状态" min-width="150">
              <template slot-scope="scope">
                <el-tag :type="statusType(scope.row.status)" size="small">
                  {{ statusLabel(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" min-width="200">
              <template slot-scope="scope">
                <el-button
                  v-if="scope.row.status === 2"
                  size="mini"
                  type="warning"
                  @click="startEdit(scope.row)"
                >修改</el-button>
                <el-button
                  v-if="scope.row.status === 0 || scope.row.status === 2"
                  size="mini"
                  type="danger"
                  @click="handleDelete(scope.row)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
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
import { publishAction, getMyActions, updateMyAction, deleteMyAction, uploadActionCover, uploadActionVideo } from '@/api/action'

// 后端静态资源根路径，用于拼接封面图/视频的完整可访问 URL
// 例：form.cover_img = "action_covers/1_abc.jpg"
//     完整 URL = BASE_URL + "/static/" + "action_covers/1_abc.jpg"
const BASE_URL = process.env.VUE_APP_API_BASE || 'http://127.0.0.1:8009/api'

export default {
  name: 'ActionPublish',
  data() {
    return {
      submitting: false,
      editId: null,

      // cover_img / video_url 存储后端返回的相对路径（如 "action_covers/1_abc.jpg"）
      // 提交表单时直接带给后端，后端存入数据库
      form: {
        title: '', body_part: '', category: '', difficulty: 1,
        cover_img: '',   // 封面图相对路径，上传成功后由 handleCoverUpload 写入
        video_url: '',   // 视频相对路径，上传成功后由 handleVideoUpload 写入
        description: '',
        steps: [],
        cautions: []
      },

      // 封面图上传状态
      coverUploading: false,

      // 视频上传状态和进度（0~100）
      videoUploading: false,
      videoProgress: 0,

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

    /**
     * 封面图上传处理。
     * el-upload 的 before-upload 钩子在用户选择文件后触发，返回 false 阻止默认上传，
     * 改为手动调用 uploadActionCover 接口。
     */
    async handleCoverUpload(file) {
      // 前端二次校验（后端也会校验，这里提前给用户反馈）
      const allowed = ['image/jpeg', 'image/png', 'image/webp']
      if (!allowed.includes(file.type)) {
        this.$message.error('封面图请上传 JPG、PNG 或 WebP 格式')
        return false  // 返回 false 阻止 el-upload 的默认上传行为
      }
      if (file.size > 5 * 1024 * 1024) {
        this.$message.error('封面图不能超过 5MB')
        return false
      }

      this.coverUploading = true
      try {
        const res = await uploadActionCover(file)
        // 后端返回 { path: "action_covers/1_abc.jpg" }，存入 form.cover_img
        this.form.cover_img = res.data.path
        this.$message.success('封面图上传成功')
      } catch {
        this.$message.error('封面图上传失败，请重试')
      } finally {
        this.coverUploading = false
      }
      return false  // 始终返回 false，阻止 el-upload 自己发请求
    },

    /**
     * 视频上传处理。
     * 视频文件较大，通过 onProgress 回调实时更新 videoProgress 显示进度条。
     */
    async handleVideoUpload(file) {
      const allowed = ['video/mp4', 'video/webm']
      if (!allowed.includes(file.type)) {
        this.$message.error('视频请上传 MP4 或 WebM 格式')
        return false
      }
      if (file.size > 200 * 1024 * 1024) {
        this.$message.error('视频不能超过 200MB')
        return false
      }

      this.videoUploading = true
      this.videoProgress = 0
      try {
        // 传入 onProgress 回调，uploadActionVideo 内部通过 axios onUploadProgress 更新进度
        const res = await uploadActionVideo(file, p => { this.videoProgress = p })
        // 后端返回 { path: "action_videos/1_abc.mp4" }，存入 form.video_url
        this.form.video_url = res.data.path
        this.$message.success('视频上传成功')
      } catch {
        this.$message.error('视频上传失败，请重试')
      } finally {
        this.videoUploading = false
      }
      return false
    },

    async submit() {
      if (!this.form.title) return this.$message.warning('请填写动作名称')
      if (!this.form.body_part) return this.$message.warning('请选择训练部位')
      const data = {
        ...this.form,
        steps: this.form.steps.filter(s => s.trim()),
        cautions: this.form.cautions.filter(c => c.trim())
      }
      this.submitting = true
      try {
        // 修改动作重新提交审核接口
        if (this.editId) {
          await updateMyAction(this.editId, data)
          this.$message.success('已重新提交审核')
        } else {
          // 教练端动作投稿提交动作审核接口
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
      this.editId = row.id
      this.form = {
        title: row.title,
        body_part: row.body_part,
        category: row.category,
        difficulty: row.difficulty,
        // 修改模式回显已有的封面图/视频路径，预览区域会自动显示
        cover_img: row.cover_img || '',
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
        cover_img: '', video_url: '', description: '', steps: [], cautions: []
      }
    },

    async handleDelete(row) {
      await this.$confirm(`确认删除《${row.title}》？`, '提示', { type: 'warning' })
      await deleteMyAction(row.id)
      this.$message.success('已删除')
      await this.loadMyActions()
    },

    // 拼接静态资源完整 URL：相对路径 → 可访问的 HTTP 地址
    // 例：mediaUrl("action_covers/1_abc.jpg") → "http://127.0.0.1:8008/api/static/action_covers/1_abc.jpg"
    mediaUrl(path) {
      return `${BASE_URL}/static/${path}`
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

<style scoped>
/* 封面图预览区域：固定尺寸，图片铺满 */
.cover-preview {
  width: 160px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
  display: block;
}

/* 未上传时的占位点击区域，样式与 el-upload 默认风格一致 */
.upload-placeholder {
  width: 160px;
  height: 100px;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.upload-placeholder:hover {
  border-color: #409EFF;
}
</style>
