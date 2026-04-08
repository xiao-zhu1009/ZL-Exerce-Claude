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
            <span class="cover-placeholder">{{ article.category }}</span>
          </div>
          <div style="padding:12px">
            <div style="font-weight:bold;font-size:15px;margin-bottom:8px">{{ article.title }}</div>
            <el-tag size="mini">{{ article.category }}</el-tag>
            <div style="color:#999;font-size:12px;margin-top:8px">{{ article.view_count }} 次浏览 · {{ article.created_at }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-empty v-if="!loading && list.length === 0" description="暂无文章" />
  </div>
</template>

<script>
import { getDietArticles } from '../../../api/diet'

export default {
  name: 'DietCenter',
  data() {
    return {
      loading: false,
      list: [],
      filters: { category: '', keyword: '' },
      categories: ['增肌餐', '减脂餐', '均衡饮食', '补剂知识']
    }
  },
  created() { this.fetchList() },
  methods: {
    async fetchList() {
      this.loading = true
      try {
        // TODO: 对接后端 GET /diet/articles?category=&keyword=
        const res = await getDietArticles(this.filters)
        this.list = res.data.list
      } finally { this.loading = false }
    }
  }
}
</script>

<style scoped>
.article-card { cursor: pointer; transition: box-shadow .2s; }
.article-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.12); }
.cover { height: 100px; background: #f0f2f5; display: flex; align-items: center; justify-content: center; border-radius: 4px; }
.cover-placeholder { font-size: 16px; color: #999; }
</style>
