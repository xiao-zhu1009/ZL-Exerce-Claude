<template>
  <div>
    <el-button icon="el-icon-arrow-left" @click="$router.back()" style="margin-bottom:16px">返回</el-button>
    <el-card v-if="article" v-loading="loading">
      <div slot="header">
        <div style="display:flex;align-items:flex-start;gap:16px">
          <img v-if="article.cover_img" :src="imgUrl(article.cover_img)" style="width:120px;height:80px;object-fit:cover;border-radius:4px;flex-shrink:0" />
          <div>
            <h2 style="margin:0 0 8px">{{ article.title }}</h2>
            <el-tag size="small">{{ article.category }}</el-tag>
            <span style="color:#999;font-size:13px;margin-left:12px">{{ article.view_count }} 次浏览 · {{ article.author_name }} · {{ article.created_at }}</span>
            <p v-if="article.summary" style="color:#666;margin:8px 0 0;font-size:14px">{{ article.summary }}</p>
          </div>
        </div>
      </div>
      <div class="article-content" v-html="article.content" />
    </el-card>
    <el-empty v-if="!loading && !article" description="文章不存在" />
  </div>
</template>

<script>
import { getDietArticleDetail } from '@/api/diet'

const BASE = process.env.VUE_APP_API_BASE || 'http://127.0.0.1:8009/api'

export default {
  name: 'ArticleDetail',
  data() { return { loading: false, article: null } },
  created() { this.fetchDetail() },
  methods: {
    async fetchDetail() {
      this.loading = true
      try {
        const res = await getDietArticleDetail(this.$route.params.id)
        if (res.code === 200) this.article = res.data
      } finally { this.loading = false }
    },
    imgUrl(path) { return `${BASE}/static/${path}` }
  }
}
</script>

<style scoped>
.article-content { line-height: 1.8; color: #333; }
.article-content img { max-width: 100%; }
</style>
