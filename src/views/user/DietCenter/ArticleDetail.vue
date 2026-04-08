<template>
  <div>
    <el-button icon="el-icon-arrow-left" @click="$router.back()" style="margin-bottom:16px">返回</el-button>
    <el-card v-if="article" v-loading="loading">
      <div slot="header">
        <h2 style="margin:0">{{ article.title }}</h2>
        <div style="margin-top:8px">
          <el-tag size="small">{{ article.category }}</el-tag>
          <span style="color:#999;font-size:13px;margin-left:12px">{{ article.view_count }} 次浏览 · {{ article.created_at }}</span>
        </div>
      </div>
      <!-- TODO: 对接后端后，content 字段为富文本 HTML，直接 v-html 渲染 -->
      <div class="article-content" v-html="article.content" />
    </el-card>
  </div>
</template>

<script>
import { getDietArticleDetail } from '../../../api/diet'

export default {
  name: 'ArticleDetail',
  data() { return { loading: false, article: null } },
  created() { this.fetchDetail() },
  methods: {
    async fetchDetail() {
      this.loading = true
      try {
        // TODO: 对接后端 GET /diet/articles/:id
        const res = await getDietArticleDetail(this.$route.params.id)
        this.article = res.data
      } finally { this.loading = false }
    }
  }
}
</script>

<style scoped>
.article-content { line-height: 1.8; color: #333; }
</style>
