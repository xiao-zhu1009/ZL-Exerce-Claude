<template>
  <div>
    <!-- 筛选栏 -->
    <el-card style="margin-bottom:16px">
      <el-row :gutter="12">
        <el-col :span="6">
          <el-select v-model="filters.category" placeholder="全部分类" clearable @change="onSearch" style="width:100%">
            <el-option v-for="c in categories" :key="c" :label="c" :value="c" />
          </el-select>
        </el-col>
        <el-col :span="12">
          <el-input v-model="filters.keyword" placeholder="搜索文章标题" clearable @clear="onSearch">
            <el-button slot="append" icon="el-icon-search" @click="onSearch" />
          </el-input>
        </el-col>
      </el-row>
    </el-card>

    <!-- 文章列表 -->
    <el-row :gutter="16" v-loading="loading">
      <el-col v-for="article in list" :key="article.id" :span="8" style="margin-bottom:16px">
        <el-card class="article-card" shadow="hover" @click.native="$router.push(`/user/articles/${article.id}`)">
          <div class="cover">
            <img v-if="article.cover_img" :src="imgUrl(article.cover_img)" class="cover-img" />
            <span v-else class="cover-placeholder">{{ article.category }}</span>
          </div>
          <div style="padding:12px">
            <div style="font-weight:bold;font-size:15px;margin-bottom:8px;line-height:1.4" class="title-clamp">
              {{ article.title }}
            </div>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
              <el-tag size="mini">{{ article.category }}</el-tag>
              <span style="color:#999;font-size:12px">{{ article.author_name }}</span>
            </div>
            <div style="color:#999;font-size:12px;margin-bottom:6px">
              <i class="el-icon-view" /> {{ article.view_count }} 次浏览 · {{ article.created_at }}
            </div>
            <div v-if="article.summary" class="summary">{{ article.summary }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-empty v-if="!loading && list.length === 0" description="暂无文章" />

    <div style="text-align:center;margin-top:16px" v-if="total > filters.page_size">
      <el-pagination background layout="prev, pager, next"
        :total="total" :page-size="filters.page_size"
        :current-page="filters.page" @current-change="onPageChange" />
    </div>
  </div>
</template>

<script>
import { getDietArticles } from '@/api/diet'

const BASE = process.env.VUE_APP_API_BASE || 'http://127.0.0.1:8009/api'

export default {
  name: 'ArticleLibrary',
  data() {
    return {
      loading: false,
      list: [],
      total: 0,
      filters: { category: '', keyword: '', page: 1, page_size: 12 },
      categories: ['饮食', '训练', '新手', '误区', '身材管理', '健康', '工具', '计划'],
    }
  },
  created() {
    this.fetchList()
  },
  methods: {
    async fetchList() {
      this.loading = true
      try {
        const params = { page: this.filters.page, page_size: this.filters.page_size }
        if (this.filters.category) params.category = this.filters.category
        if (this.filters.keyword) params.keyword = this.filters.keyword
        const res = await getDietArticles(params)
        this.list = res.data.list || []
        this.total = res.data.total || 0
      } finally {
        this.loading = false
      }
    },
    onSearch() {
      this.filters.page = 1
      this.fetchList()
    },
    onPageChange(page) {
      this.filters.page = page
      this.fetchList()
    },
    imgUrl(path) { return `${BASE}/static/${path}` },
  }
}
</script>

<style scoped>
.article-card { cursor: pointer; transition: box-shadow .2s; }
.article-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.12); }
.cover { height: 140px; background: #f0f2f5; display: flex; align-items: center; justify-content: center; border-radius: 4px 4px 0 0; overflow: hidden; margin: -20px -20px 0; }
.cover-img { width: 100%; height: 100%; object-fit: cover; }
.cover-placeholder { font-size: 16px; color: #999; }
.title-clamp { overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.summary { color: #666; font-size: 13px; line-height: 1.5; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
</style>
