<template>
  <div>
    <h2 style="margin-bottom:20px">饮食中心</h2>
    <el-card style="margin-bottom:16px">
      <el-row :gutter="12">
        <el-col :span="6">
          <el-select v-model="filters.category" placeholder="文章分类" clearable @change="fetchList">
            <el-option v-for="c in categories" :key="c" :label="c" :value="c" />
          </el-select>
        </el-col>
        <el-col :span="10">
          <el-input v-model="filters.keyword" placeholder="搜索文章标题" clearable @clear="fetchList">
            <el-button slot="append" icon="el-icon-search" @click="fetchList" />
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="$router.push('/user/diet/record')">我的饮食记录</el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-row :gutter="16" v-loading="loading">
      <el-col :span="8" v-for="article in list" :key="article.id" style="margin-bottom:16px">
        <el-card class="article-card" @click.native="$router.push(`/user/diet/articles/${article.id}`)">
          <div class="cover">
            <img v-if="article.cover_img" :src="imgUrl(article.cover_img)" class="cover-img" />
            <span v-else class="cover-placeholder">{{ article.category }}</span>
          </div>
          <div style="padding:12px">
            <div style="font-weight:bold;font-size:15px;margin-bottom:8px">{{ article.title }}</div>
            <el-tag size="mini">{{ article.category }}</el-tag>
            <div style="color:#999;font-size:12px;margin-top:8px">{{ article.view_count }} 次浏览 · {{ article.created_at }}</div>
            <div v-if="article.summary" style="color:#666;font-size:13px;margin-top:6px;line-height:1.5" class="summary">{{ article.summary }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-empty v-if="!loading && list.length === 0" description="暂无文章" />

    <div style="text-align:center;margin-top:16px" v-if="total > filters.page_size">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="total"
        :page-size="filters.page_size"
        :current-page="filters.page"
        @current-change="onPageChange"
      />
    </div>
  </div>
</template>

<script>
import { getDietArticles } from '@/api/diet'

const BASE = process.env.VUE_APP_API_BASE || 'http://127.0.0.1:8009/api'

export default {
  name: 'DietCenter',
  data() {
    return {
      loading: false,
      list: [],
      total: 0,
      filters: { category: '', keyword: '', page: 1, page_size: 12 },
      categories: ['增肌餐', '减脂餐', '均衡饮食', '补剂知识']
    }
  },
  created() { this.fetchList() },
  methods: {
    async fetchList() {
      this.loading = true
      try {
        const params = {}
        if (this.filters.category) params.category = this.filters.category
        if (this.filters.keyword) params.keyword = this.filters.keyword
        params.page = this.filters.page
        params.page_size = this.filters.page_size
        const res = await getDietArticles(params)
        this.list = res.data.list
        this.total = res.data.total
      } finally { this.loading = false }
    },
    onPageChange(page) {
      this.filters.page = page
      this.fetchList()
    },
    imgUrl(path) { return `${BASE}/static/${path}` }
  }
}
</script>

<style scoped>
.article-card { cursor: pointer; transition: box-shadow .2s; }
.article-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.12); }
.cover { height: 120px; background: #f0f2f5; display: flex; align-items: center; justify-content: center; border-radius: 4px; overflow: hidden; }
.cover-img { width: 100%; height: 100%; object-fit: cover; }
.cover-placeholder { font-size: 16px; color: #999; }
.summary { overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
</style>
