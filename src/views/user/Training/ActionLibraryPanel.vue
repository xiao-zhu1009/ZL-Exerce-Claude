<template>
  <div>
    <el-card style="margin-bottom:16px">
      <el-row :gutter="12">
        <el-col :span="5">
          <el-select v-model="filters.body_part" placeholder="训练部位" clearable @change="onFilter">
            <el-option v-for="p in bodyParts" :key="p" :label="p" :value="p" />
          </el-select>
        </el-col>
        <el-col :span="5">
          <el-select v-model="filters.category" placeholder="动作类型" clearable @change="onFilter">
            <el-option v-for="c in categories" :key="c" :label="c" :value="c" />
          </el-select>
        </el-col>
        <el-col :span="5">
          <el-select v-model="filters.difficulty" placeholder="难度" clearable @change="onFilter">
            <el-option label="初级" :value="1" />
            <el-option label="中级" :value="2" />
            <el-option label="高级" :value="3" />
          </el-select>
        </el-col>
        <el-col :span="7">
          <el-input v-model="filters.keyword" placeholder="搜索动作名称" clearable @clear="onFilter">
            <el-button slot="append" icon="el-icon-search" @click="onFilter" />
          </el-input>
        </el-col>
        <el-col :span="2">
          <el-button @click="resetFilters">重置</el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-row :gutter="16" v-loading="loading">
      <el-col :span="6" v-for="action in list" :key="action.id" style="margin-bottom:16px">
        <el-card class="action-card" @click.native="goDetail(action.id)">
          <div class="cover">
            <img v-if="action.cover_img" :src="imgUrl(action.cover_img)" class="cover-img" />
            <span v-else class="cover-placeholder">{{ action.body_part }}</span>
          </div>
          <div style="padding:12px">
            <div style="font-weight:bold;font-size:15px">{{ action.title }}</div>
            <div style="margin-top:6px">
              <el-tag size="mini">{{ action.body_part }}</el-tag>
              <el-tag size="mini" type="success" style="margin-left:4px">{{ action.category }}</el-tag>
              <el-tag size="mini" :type="difficultyType(action.difficulty)" style="margin-left:4px">
                {{ difficultyLabel(action.difficulty) }}
              </el-tag>
            </div>
            <div style="color:#999;font-size:12px;margin-top:8px">{{ action.view_count }} 次浏览</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-empty v-if="!loading && list.length === 0" description="暂无动作" />

    <div style="text-align:center;margin-top:16px" v-if="total > pageSize">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="total"
        :page-size="pageSize"
        :current-page="page"
        @current-change="onPageChange"
      />
    </div>
  </div>
</template>

<script>
import { getActions } from '@/api/action'

const BASE_URL = process.env.VUE_APP_API_BASE || 'http://127.0.0.1:8009/api'

export default {
  name: 'ActionLibraryPanel',
  data() {
    return {
      loading: false,
      list: [],
      total: 0,
      page: 1,
      pageSize: 12,
      filters: { body_part: '', category: '', difficulty: '', keyword: '' },
      bodyParts: ['胸', '背', '腿', '肩', '手臂', '核心'],
      categories: ['力量', '有氧', '拉伸', '综合'],
      loaded: false,
    }
  },

  // lazy Tab 首次挂载时再请求，与父组件无关
  mounted() {
    this.ensureLoaded()
  },

  methods: {
    /** 供外部可选手动刷新；默认由 mounted 触发首次加载 */
    ensureLoaded() {
      if (!this.loaded) this.fetchList()
    },
    goDetail(id) {
      this.$router.push(`/user/training/actions/${id}`)
    },
    async fetchList() {
      this.loading = true
      try {
        const params = { ...this.filters, page: this.page, page_size: this.pageSize }
        Object.keys(params).forEach(k => { if (params[k] === '') delete params[k] })
        const res = await getActions(params)
        this.list = res.data.list
        this.total = res.data.total
        this.loaded = true
      } finally {
        this.loading = false
      }
    },
    onFilter() {
      this.page = 1
      this.fetchList()
    },
    onPageChange(p) {
      this.page = p
      this.fetchList()
    },
    resetFilters() {
      this.filters = { body_part: '', category: '', difficulty: '', keyword: '' }
      this.page = 1
      this.fetchList()
    },
    imgUrl(path) {
      return `${BASE_URL}/static/${path}`
    },
    difficultyLabel(d) { return ['', '初级', '中级', '高级'][d] },
    difficultyType(d) { return ['', 'success', 'warning', 'danger'][d] }
  }
}
</script>

<style scoped>
.action-card { cursor: pointer; transition: box-shadow .2s; }
.action-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.12); }
.cover {
  height: 120px;
  background: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  overflow: hidden;
}
.cover-img { width: 100%; height: 100%; object-fit: cover; }
.cover-placeholder { font-size: 24px; color: #999; }
</style>
