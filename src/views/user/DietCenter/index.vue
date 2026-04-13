<template>
  <div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
      <h2 style="margin:0">饮食中心</h2>
      <el-button type="primary" icon="el-icon-notebook-2" @click="$router.push('/user/diet/record')">
        我的饮食记录
      </el-button>
    </div>

    <el-tabs v-model="activeTab" @tab-click="onTabChange">

      <!-- ── Tab1：推荐餐食 ─────────────────────────────────────── -->
      <el-tab-pane label="推荐餐食" name="articles">
        <el-card style="margin-bottom:16px">
          <el-row :gutter="12">
            <el-col :span="6">
              <el-select v-model="articleFilters.category" placeholder="文章分类" clearable @change="fetchArticles">
                <el-option v-for="c in articleCategories" :key="c" :label="c" :value="c" />
              </el-select>
            </el-col>
            <el-col :span="12">
              <el-input v-model="articleFilters.keyword" placeholder="搜索文章标题" clearable @clear="fetchArticles">
                <el-button slot="append" icon="el-icon-search" @click="fetchArticles" />
              </el-input>
            </el-col>
          </el-row>
        </el-card>

        <el-row :gutter="16" v-loading="articleLoading">
          <el-col :span="8" v-for="article in articleList" :key="article.id" style="margin-bottom:16px">
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

        <el-empty v-if="!articleLoading && articleList.length === 0" description="暂无文章" />

        <div style="text-align:center;margin-top:16px" v-if="articleTotal > articleFilters.page_size">
          <el-pagination background layout="prev, pager, next"
            :total="articleTotal" :page-size="articleFilters.page_size"
            :current-page="articleFilters.page" @current-change="onArticlePageChange" />
        </div>
      </el-tab-pane>

      <!-- ── Tab2：食物库 ───────────────────────────────────────── -->
      <el-tab-pane label="食物库" name="foods">
        <el-card style="margin-bottom:16px">
          <el-row :gutter="12" type="flex" align="middle">
            <el-col :span="5">
              <el-select v-model="foodCategory" placeholder="全部分类" clearable @change="fetchFoods" style="width:100%">
                <el-option v-for="c in foodCategories" :key="c" :label="c" :value="c" />
              </el-select>
            </el-col>
            <el-col :span="12">
              <el-input v-model="foodKeyword" placeholder="搜索食物名称" clearable @clear="fetchFoods">
                <el-button slot="append" icon="el-icon-search" @click="fetchFoods" />
              </el-input>
            </el-col>
            <el-col :span="7" style="color:#909399;font-size:13px;text-align:right">
              共 {{ foodList.length }} 种食物（每 100g/ml 营养素）
            </el-col>
          </el-row>
        </el-card>

        <el-row :gutter="12" v-loading="foodLoading">
          <el-col :span="6" v-for="food in foodList" :key="food.id" style="margin-bottom:12px">
            <el-card class="food-card" shadow="hover">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
                <span style="font-weight:bold;font-size:14px">{{ food.name }}</span>
                <el-tag size="mini" type="info">{{ food.category }}</el-tag>
              </div>
              <div class="nutrient-row">
                <div class="nutrient-item" style="color:#409EFF">
                  <div class="nutrient-val">{{ food.calories }}</div>
                  <div class="nutrient-label">热量 kcal</div>
                </div>
                <div class="nutrient-item" style="color:#67C23A">
                  <div class="nutrient-val">{{ food.protein }}</div>
                  <div class="nutrient-label">蛋白质 g</div>
                </div>
                <div class="nutrient-item" style="color:#E6A23C">
                  <div class="nutrient-val">{{ food.carbs }}</div>
                  <div class="nutrient-label">碳水 g</div>
                </div>
                <div class="nutrient-item" style="color:#F56C6C">
                  <div class="nutrient-val">{{ food.fat }}</div>
                  <div class="nutrient-label">脂肪 g</div>
                </div>
              </div>
              <div style="margin-top:10px;text-align:right">
                <el-button size="mini" type="primary" plain icon="el-icon-plus"
                  @click="openQuickAdd(food)">添加到今日记录</el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-empty v-if="!foodLoading && foodList.length === 0" description="暂无食物数据" />
      </el-tab-pane>

      <!-- ── Tab3：我的饮食计划 ──────────────────────────────────── -->
      <el-tab-pane label="我的饮食计划" name="dietPlans">
        <!-- 状态筛选 -->
        <el-card style="margin-bottom:16px">
          <el-radio-group v-model="dietPlanStatus" @change="fetchDietPlans">
            <el-radio-button :label="null">全部</el-radio-button>
            <el-radio-button :label="1">进行中</el-radio-button>
            <el-radio-button :label="2">已完成</el-radio-button>
            <el-radio-button :label="0">已终止</el-radio-button>
          </el-radio-group>
        </el-card>

        <div v-loading="dietPlanLoading">
          <el-empty v-if="!dietPlanLoading && dietPlanList.length === 0" description="暂无饮食计划" :image-size="80" />
          <el-row :gutter="16">
            <el-col :span="8" v-for="plan in dietPlanList" :key="plan.id" style="margin-bottom:16px">
              <el-card class="plan-card" shadow="hover">
                <div style="display:flex;justify-content:space-between;align-items:flex-start">
                  <div style="font-size:15px;font-weight:bold;flex:1;margin-right:8px">{{ plan.title }}</div>
                  <el-tag size="mini" :type="dietPlanStatusType(plan.status)">{{ dietPlanStatusLabel(plan.status) }}</el-tag>
                </div>
                <div style="margin-top:8px;color:#606266;font-size:13px">
                  <i class="el-icon-aim" style="margin-right:4px" />目标：{{ plan.goal }}
                </div>
                <div style="margin-top:4px;color:#909399;font-size:12px">
                  <i class="el-icon-date" style="margin-right:4px" />{{ plan.start_date }} ~ {{ plan.end_date }}
                </div>
                <div v-if="plan.coach_name" style="margin-top:4px;color:#909399;font-size:12px">
                  <i class="el-icon-user" style="margin-right:4px" />教练：{{ plan.coach_name }}
                </div>
                <div v-if="plan.description" style="margin-top:8px;color:#666;font-size:12px;line-height:1.5" class="plan-desc">
                  {{ plan.description }}
                </div>
                <div style="margin-top:12px;text-align:right">
                  <el-button size="mini" type="primary" plain @click="openDietPlanDetail(plan)">查看详情</el-button>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </el-tab-pane>

    </el-tabs>

    <!-- 快捷添加弹窗 -->
    <el-dialog :title="`添加「${quickForm.food_name}」到今日记录`" :visible.sync="quickVisible" width="400px">
      <el-form :model="quickForm" label-width="80px" size="small">
        <el-form-item label="餐次">
          <el-radio-group v-model="quickForm.meal_type">
            <el-radio :label="1">早餐</el-radio>
            <el-radio :label="2">午餐</el-radio>
            <el-radio :label="3">晚餐</el-radio>
            <el-radio :label="4">加餐</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="`食用量(${quickForm.unit})`">
          <el-input-number v-model="quickForm.amount" :min="1" :max="2000" :step="10"
            style="width:160px" @change="calcQuick" />
        </el-form-item>
        <el-form-item label="营养预览">
          <div class="quick-preview">
            <span style="color:#409EFF">热量 <b>{{ quickCalc.calories }}</b> kcal</span>
            <span style="color:#67C23A">蛋白质 <b>{{ quickCalc.protein }}</b>g</span>
            <span style="color:#E6A23C">碳水 <b>{{ quickCalc.carbs }}</b>g</span>
            <span style="color:#F56C6C">脂肪 <b>{{ quickCalc.fat }}</b>g</span>
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="quickVisible = false">取消</el-button>
        <el-button type="primary" :loading="quickSubmitting" @click="submitQuick">确认添加</el-button>
      </div>
    </el-dialog>

    <!-- 饮食计划详情弹窗 -->
    <el-dialog :title="dietPlanDetail ? dietPlanDetail.title : ''" :visible.sync="dietPlanDetailVisible" width="680px">
      <div v-if="dietPlanDetail">
        <el-descriptions :column="2" border size="small" style="margin-bottom:16px">
          <el-descriptions-item label="饮食目标">{{ dietPlanDetail.goal }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag size="mini" :type="dietPlanStatusType(dietPlanDetail.status)">
              {{ dietPlanStatusLabel(dietPlanDetail.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="开始日期">{{ dietPlanDetail.start_date }}</el-descriptions-item>
          <el-descriptions-item label="结束日期">{{ dietPlanDetail.end_date }}</el-descriptions-item>
          <el-descriptions-item v-if="dietPlanDetail.coach_name" label="制定教练" :span="2">
            {{ dietPlanDetail.coach_name }}
          </el-descriptions-item>
          <el-descriptions-item v-if="dietPlanDetail.description" label="整体说明" :span="2">
            {{ dietPlanDetail.description }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 每日餐次安排 -->
        <div v-if="dietPlanDetail.content && dietPlanDetail.content.days && dietPlanDetail.content.days.length">
          <div style="font-weight:bold;margin-bottom:12px;font-size:14px">每日餐次安排</div>
          <el-collapse accordion>
            <el-collapse-item v-for="(day, idx) in dietPlanDetail.content.days" :key="idx" :name="idx">
              <template slot="title">
                <span style="font-weight:500">{{ day.label || `第 ${idx + 1} 天` }}</span>
              </template>
              <el-row :gutter="12">
                <el-col :span="12" v-if="day.breakfast">
                  <div class="meal-block">
                    <div class="meal-title"><i class="el-icon-sunrise" /> 早餐</div>
                    <div class="meal-content">{{ day.breakfast }}</div>
                  </div>
                </el-col>
                <el-col :span="12" v-if="day.lunch">
                  <div class="meal-block">
                    <div class="meal-title"><i class="el-icon-sunny" /> 午餐</div>
                    <div class="meal-content">{{ day.lunch }}</div>
                  </div>
                </el-col>
                <el-col :span="12" v-if="day.dinner" style="margin-top:8px">
                  <div class="meal-block">
                    <div class="meal-title"><i class="el-icon-moon" /> 晚餐</div>
                    <div class="meal-content">{{ day.dinner }}</div>
                  </div>
                </el-col>
                <el-col :span="12" v-if="day.snack" style="margin-top:8px">
                  <div class="meal-block">
                    <div class="meal-title"><i class="el-icon-apple" /> 加餐</div>
                    <div class="meal-content">{{ day.snack }}</div>
                  </div>
                </el-col>
              </el-row>
            </el-collapse-item>
          </el-collapse>
        </div>
        <el-empty v-else description="暂无每日餐次安排" :image-size="60" />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getDietArticles, searchFoods, addDietRecord } from '@/api/diet'
import { getDietPlans, getDietPlanDetail } from '@/api/dietPlan'

const BASE = process.env.VUE_APP_API_BASE || 'http://127.0.0.1:8009/api'

const DIET_PLAN_STATUS = {
  0: { label: '已终止', type: 'info' },
  1: { label: '进行中', type: 'success' },
  2: { label: '已完成', type: '' },
}

export default {
  name: 'DietCenter',
  data() {
    return {
      activeTab: 'articles',

      // 推荐餐食
      articleLoading: false,
      articleList: [],
      articleTotal: 0,
      articleFilters: { category: '', keyword: '', page: 1, page_size: 12 },
      articleCategories: ['增肌餐', '减脂餐', '均衡饮食', '补剂知识'],

      // 食物库
      foodLoading: false,
      foodList: [],
      foodKeyword: '',
      foodCategory: '',
      foodCategories: ['主食', '肉类', '鱼类', '蛋类', '乳制品', '蔬菜', '水果', '坚果', '豆制品', '油脂', '补剂', '其他'],
      foodLoaded: false,

      // 快捷添加
      quickVisible: false,
      quickForm: { food_id: null, food_name: '', unit: 'g', meal_type: 1, amount: 100, _food: null },
      quickSubmitting: false,

      // 饮食计划
      dietPlanLoading: false,
      dietPlanList: [],
      dietPlanStatus: null,       // null=全部 0=终止 1=进行中 2=完成
      dietPlanLoaded: false,
      dietPlanDetailVisible: false,
      dietPlanDetail: null,
    }
  },
  computed: {
    quickCalc() {
      const f = this.quickForm._food
      if (!f) return { calories: 0, protein: 0, carbs: 0, fat: 0 }
      const r = this.quickForm.amount / 100
      return {
        calories: (f.calories * r).toFixed(1),
        protein:  (f.protein  * r).toFixed(1),
        carbs:    (f.carbs    * r).toFixed(1),
        fat:      (f.fat      * r).toFixed(1),
      }
    }
  },
  created() { this.fetchArticles() },
  methods: {
    onTabChange(tab) {
      if (tab.name === 'foods' && !this.foodLoaded) this.fetchFoods()
      if (tab.name === 'dietPlans' && !this.dietPlanLoaded) this.fetchDietPlans()
    },

    // ── 推荐餐食 ──────────────────────────────────────────────────
    async fetchArticles() {
      this.articleLoading = true
      try {
        const params = { page: this.articleFilters.page, page_size: this.articleFilters.page_size }
        if (this.articleFilters.category) params.category = this.articleFilters.category
        if (this.articleFilters.keyword)  params.keyword  = this.articleFilters.keyword
        const res = await getDietArticles(params)
        this.articleList  = res.data.list
        this.articleTotal = res.data.total
      } finally { this.articleLoading = false }
    },
    onArticlePageChange(page) {
      this.articleFilters.page = page
      this.fetchArticles()
    },

    // ── 食物库 ────────────────────────────────────────────────────
    async fetchFoods() {
      this.foodLoading = true
      try {
        const res = await searchFoods(this.foodKeyword, this.foodCategory)
        this.foodList   = res.data || []
        this.foodLoaded = true
      } finally { this.foodLoading = false }
    },

    // ── 快捷添加 ──────────────────────────────────────────────────
    openQuickAdd(food) {
      this.quickForm = { food_id: food.id, food_name: food.name, unit: food.unit, meal_type: 1, amount: 100, _food: food }
      this.quickVisible = true
    },
    calcQuick() { /* 由 computed quickCalc 自动响应 */ },
    async submitQuick() {
      if (!this.quickForm.amount || this.quickForm.amount <= 0) {
        return this.$message.warning('食用量必须大于 0')
      }
      this.quickSubmitting = true
      try {
        const today = new Date().toISOString().slice(0, 10)
        const res = await addDietRecord({
          food_id:     this.quickForm.food_id,
          food_name:   this.quickForm.food_name,
          meal_type:   this.quickForm.meal_type,
          amount:      this.quickForm.amount,
          unit:        this.quickForm.unit,
          calories:    Number(this.quickCalc.calories),
          protein:     Number(this.quickCalc.protein),
          carbs:       Number(this.quickCalc.carbs),
          fat:         Number(this.quickCalc.fat),
          record_date: today,
        })
        if (res.code === 200) {
          this.$message.success(`已添加到今日${['', '早餐', '午餐', '晚餐', '加餐'][this.quickForm.meal_type]}`)
          this.quickVisible = false
        } else {
          this.$message.error(res.msg || '添加失败')
        }
      } finally { this.quickSubmitting = false }
    },

    // ── 饮食计划 ──────────────────────────────────────────────────
    async fetchDietPlans() {
      this.dietPlanLoading = true
      try {
        const res = await getDietPlans(this.dietPlanStatus)
        this.dietPlanList   = res.data || []
        this.dietPlanLoaded = true
      } catch {
        this.$message.error('加载饮食计划失败')
      } finally { this.dietPlanLoading = false }
    },
    async openDietPlanDetail(plan) {
      try {
        const res = await getDietPlanDetail(plan.id)
        this.dietPlanDetail = res.data
        this.dietPlanDetailVisible = true
      } catch {
        this.$message.error('加载详情失败')
      }
    },
    dietPlanStatusLabel(s) { return DIET_PLAN_STATUS[s]?.label || '未知' },
    dietPlanStatusType(s)  { return DIET_PLAN_STATUS[s]?.type  || '' },

    imgUrl(path) { return `${BASE}/static/${path}` }
  }
}
</script>

<style scoped>
/* 文章卡片 */
.article-card { cursor: pointer; transition: box-shadow .2s; }
.article-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.12); }
.cover { height: 120px; background: #f0f2f5; display: flex; align-items: center; justify-content: center; border-radius: 4px; overflow: hidden; }
.cover-img { width: 100%; height: 100%; object-fit: cover; }
.cover-placeholder { font-size: 16px; color: #999; }
.summary { overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }

/* 食物卡片 */
.food-card { transition: box-shadow .2s; }
.nutrient-row { display: flex; justify-content: space-between; }
.nutrient-item { text-align: center; flex: 1; }
.nutrient-val { font-size: 15px; font-weight: bold; line-height: 1.3; }
.nutrient-label { font-size: 11px; color: #909399; margin-top: 2px; }

/* 快捷添加营养预览 */
.quick-preview { display: flex; flex-wrap: wrap; gap: 12px; font-size: 13px; }

/* 饮食计划卡片 */
.plan-card { transition: box-shadow .2s; }
.plan-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.1); }
.plan-desc { overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }

/* 餐次详情 */
.meal-block { background: #f8f9fa; border-radius: 4px; padding: 10px; }
.meal-title { font-size: 13px; font-weight: 500; color: #606266; margin-bottom: 6px; }
.meal-content { font-size: 13px; color: #333; line-height: 1.6; white-space: pre-wrap; }
</style>
