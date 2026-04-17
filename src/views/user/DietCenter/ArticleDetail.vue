<template>
  <div class="article-detail-page">
    <div class="back-bar">
      <el-button type="text" icon="el-icon-arrow-left" @click="$router.back()" class="back-btn">返回列表</el-button>
    </div>

    <div v-if="loading" class="loading-wrap" v-loading="loading" element-loading-text="加载中..." />

    <template v-if="!loading && article">
      <!-- 封面大图 -->
      <div v-if="article.cover_img" class="cover-wrap">
        <img :src="imgUrl(article.cover_img)" class="cover-img" />
        <div class="cover-mask" />
      </div>

      <div class="content-wrap">
        <!-- 标题区 -->
        <div class="article-header">
          <el-tag size="small" type="success" class="category-tag">{{ article.category }}</el-tag>
          <h1 class="article-title">{{ article.title }}</h1>
          <p v-if="article.summary" class="article-summary">{{ article.summary }}</p>
          <div class="article-meta">
            <span><i class="el-icon-user" /> {{ article.author_name }}</span>
            <span><i class="el-icon-time" /> {{ article.created_at }}</span>
            <span><i class="el-icon-view" /> {{ article.view_count }} 次浏览</span>
          </div>
        </div>

        <!-- 分割线 -->
        <el-divider />

        <!-- 正文 -->
        <div class="article-body" v-html="article.content" />
      </div>
    </template>

    <el-empty v-if="!loading && !article" description="文章不存在" class="empty-wrap" />
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
.article-detail-page {
  max-width: 820px;
  margin: 0 auto;
  padding-bottom: 48px;
}

.back-bar {
  padding: 8px 0 12px;
}

.back-btn {
  font-size: 14px;
  color: #606266;
  padding: 0;
}

.back-btn:hover {
  color: #409EFF;
}

.loading-wrap {
  height: 300px;
}

/* 封面 */
.cover-wrap {
  position: relative;
  width: 100%;
  height: 320px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 0;
  box-shadow: 0 4px 20px rgba(0,0,0,0.12);
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.cover-mask {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60%;
  background: linear-gradient(to top, rgba(0,0,0,0.35), transparent);
}

/* 内容区 */
.content-wrap {
  background: #fff;
  border-radius: 12px;
  padding: 32px 40px;
  margin-top: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}

.article-header {
  margin-bottom: 4px;
}

.category-tag {
  margin-bottom: 12px;
}

.article-title {
  font-size: 26px;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.4;
  margin: 0 0 12px;
}

.article-summary {
  font-size: 15px;
  color: #666;
  line-height: 1.7;
  margin: 0 0 16px;
  padding: 12px 16px;
  background: #f7f8fa;
  border-left: 3px solid #409EFF;
  border-radius: 0 6px 6px 0;
}

.article-meta {
  display: flex;
  gap: 20px;
  font-size: 13px;
  color: #999;
}

.article-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 正文 */
.article-body {
  font-size: 15px;
  line-height: 1.9;
  color: #333;
}

.article-body >>> img {
  max-width: 100%;
  border-radius: 8px;
  margin: 12px 0;
}

.article-body >>> h1,
.article-body >>> h2,
.article-body >>> h3 {
  color: #1a1a1a;
  margin: 24px 0 12px;
}

.article-body >>> p {
  margin: 0 0 16px;
}

.article-body >>> blockquote {
  border-left: 3px solid #ddd;
  margin: 16px 0;
  padding: 8px 16px;
  color: #666;
  background: #fafafa;
}

.empty-wrap {
  margin-top: 80px;
}
</style>
