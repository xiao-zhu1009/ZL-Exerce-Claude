<template>
  <div>
    <h2 style="margin-bottom:20px">文章投稿</h2>
    <el-row :gutter="20">
      <!-- 左侧：发布/编辑表单 -->
      <el-col :span="13">
        <el-card>
          <div slot="header">{{ editId ? '修改文章（重新提交审核）' : '发布饮食文章' }}</div>
          <el-form :model="form" label-width="90px">
            <el-form-item label="文章标题">
              <el-input v-model="form.title" placeholder="请输入文章标题" />
            </el-form-item>
            <el-form-item label="文章分类">
              <el-select v-model="form.category" style="width:100%">
                <el-option v-for="c in categories" :key="c" :label="c" :value="c" />
              </el-select>
            </el-form-item>
            <el-form-item label="封面图">
              <el-upload
                action="#"
                :show-file-list="false"
                :before-upload="beforeCoverUpload"
                :http-request="uploadCover"
                accept="image/jpeg,image/png,image/webp"
              >
                <img v-if="form.cover_img" :src="imgUrl(form.cover_img)" class="cover-preview" />
                <el-button v-else size="small" :loading="coverUploading">{{ coverUploading ? '上传中...' : '点击上传封面' }}</el-button>
              </el-upload>
              <div style="color:#999;font-size:12px;margin-top:4px">支持 JPG/PNG/WebP，不超过 5MB</div>
            </el-form-item>
            <el-form-item label="文章摘要">
              <el-input v-model="form.summary" type="textarea" :rows="2" placeholder="简短描述文章内容（选填）" maxlength="500" show-word-limit />
            </el-form-item>
            <el-form-item label="文章正文">
              <el-input v-model="form.content" type="textarea" :rows="12" placeholder="请输入文章内容" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="submitting" @click="submit">{{ editId ? '重新提交审核' : '提交审核' }}</el-button>
              <el-button v-if="editId" @click="cancelEdit">取消修改</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 右侧：我的投稿列表 -->
      <el-col :span="11">
        <el-card>
          <div slot="header">我发布的文章</div>
          <el-table :data="myArticles" size="small" v-loading="listLoading" style="width: 100%;" fit>
            <el-table-column prop="title" label="标题" min-width="180" />
            <el-table-column prop="category" label="分类" min-width="120" />
            <el-table-column label="状态" min-width="120">
              <template slot-scope="scope">
                <el-tag :type="statusType(scope.row.status)" size="small">{{ statusLabel(scope.row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" min-width="200">
              <template slot-scope="scope">
                <!-- 已驳回：可修改 -->
                <el-button v-if="scope.row.status === 2" size="mini" type="warning" @click="startEdit(scope.row)">修改</el-button>
                <!-- 待审核/已驳回：可删除 -->
                <el-button v-if="scope.row.status === 0 || scope.row.status === 2" size="mini" type="danger" @click="remove(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <!-- 驳回原因提示 -->
          <el-alert
            v-if="rejectTip"
            :title="`驳回原因：${rejectTip}`"
            type="error"
            show-icon
            :closable="false"
            style="margin-top:12px"
          />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import {
  publishArticle, getMyArticles, updateMyArticle,
  deleteMyArticle, uploadArticleCover
} from '@/api/diet'

const BASE = process.env.VUE_APP_API_BASE || 'http://127.0.0.1:8009/api'

export default {
  name: 'ArticlePublish',
  data() {
    return {
      form: { title: '', category: '', cover_img: '', summary: '', content: '' },
      myArticles: [],
      categories: ['增肌餐', '减脂餐', '均衡饮食', '补剂知识'],
      editId: null,       // 非 null 时为修改模式
      rejectTip: '',      // 当前选中驳回文章的驳回原因
      coverUploading: false,
      submitting: false,
      listLoading: false
    }
  },
  created() { this.fetchMyArticles() },
  methods: {
    async fetchMyArticles() {
      this.listLoading = true
      try {
        const res = await getMyArticles()
        this.myArticles = res.data
      } finally { this.listLoading = false }
    },

    // 封面上传前校验（el-upload before-upload 返回 false 阻止默认行为，由 http-request 接管）
    beforeCoverUpload(file) {
      const ok = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
      if (!ok) this.$message.error('封面图请上传 JPG、PNG 或 WebP 格式')
      return ok
    },

    async uploadCover({ file }) {
      this.coverUploading = true
      try {
        const res = await uploadArticleCover(file)
        if (res.code === 200) {
          this.form.cover_img = res.data.path
          this.$message.success('封面上传成功')
        } else {
          this.$message.error(res.message || '上传失败')
        }
      } finally { this.coverUploading = false }
    },

    async submit() {
      if (!this.form.title) return this.$message.warning('请填写文章标题')
      if (!this.form.category) return this.$message.warning('请选择文章分类')
      this.submitting = true
      try {
        if (this.editId) {
          // 修改被驳回的文章
          const res = await updateMyArticle(this.editId, this.form)
          if (res.code === 200) {
            this.$message.success('已重新提交审核')
            this.cancelEdit()
            this.fetchMyArticles()
          } else {
            this.$message.error(res.message || '提交失败')
          }
        } else {
          // 发布新文章
          const res = await publishArticle(this.form)
          if (res.code === 200) {
            this.$message.success('提交成功，等待审核')
            this.form = { title: '', category: '', cover_img: '', summary: '', content: '' }
            this.fetchMyArticles()
          } else {
            this.$message.error(res.message || '提交失败')
          }
        }
      } finally { this.submitting = false }
    },

    startEdit(row) {
      this.editId = row.id
      this.rejectTip = row.reject_reason || ''
      this.form = {
        title: row.title,
        category: row.category,
        cover_img: row.cover_img || '',
        summary: row.summary || '',
        content: row.content || ''
      }
    },

    cancelEdit() {
      this.editId = null
      this.rejectTip = ''
      this.form = { title: '', category: '', cover_img: '', summary: '', content: '' }
    },

    async remove(row) {
      await this.$confirm('确认删除该文章？', '提示', { type: 'warning' })
      const res = await deleteMyArticle(row.id)
      if (res.code === 200) {
        this.$message.success('已删除')
        this.myArticles = this.myArticles.filter(a => a.id !== row.id)
      } else {
        this.$message.error(res.message || '删除失败')
      }
    },

    imgUrl(path) { return `${BASE}/static/${path}` },
    statusLabel(s) { return ['待审核', '已上线', '已驳回', '已下架'][s] ?? '未知' },
    statusType(s) { return ['warning', 'success', 'danger', 'info'][s] ?? '' }
  }
}
</script>

<style scoped>
.cover-preview { width: 120px; height: 80px; object-fit: cover; border-radius: 4px; display: block; }
</style>
