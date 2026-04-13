// src/api/diet.js
// 饮食模块接口：用户端文章浏览、教练端文章投稿管理、饮食记录（食物搜索/记录增删）
// getDietArticles        → GET    /diet/articles                用户端文章列表（分类+关键词+分页）
// getDietArticleDetail   → GET    /diet/articles/{id}           用户端文章详情（触发浏览数+1）
// uploadArticleCover     → POST   /coach/diet/articles/upload/cover  教练上传封面图
// publishArticle         → POST   /coach/diet/articles          教练发布新文章
// getMyArticles          → GET    /coach/diet/articles          教练查自己的投稿
// updateMyArticle        → PUT    /coach/diet/articles/{id}     教练修改被驳回的文章
// deleteMyArticle        → DELETE /coach/diet/articles/{id}     教练删除待审核/已驳回的文章
// searchFoods / getDietRecords / addDietRecord / deleteDietRecord → 饮食记录相关（仍为 mock，待后续对接）

import request from '@/utils/request'

// ── 用户端 ────────────────────────────────────────────────────────────────────

export function getDietArticles(params = {}) {
  return request.get('/diet/articles', { params })
}

export function getDietArticleDetail(id) {
  return request.get(`/diet/articles/${id}`)
}

// ── 教练端 ────────────────────────────────────────────────────────────────────

/**
 * 上传文章封面图。
 * 后端返回 { path: "diet_covers/xxx.jpg" }，前端存入 form.cover_img。
 */
export function uploadArticleCover(file) {
  const fd = new FormData()
  fd.append('file', file)
  return request.post('/coach/diet/articles/upload/cover', fd)
}

export function publishArticle(data) {
  return request.post('/coach/diet/articles', data)
}

export function getMyArticles() {
  return request.get('/coach/diet/articles')
}

export function updateMyArticle(id, data) {
  return request.put(`/coach/diet/articles/${id}`, data)
}

export function deleteMyArticle(id) {
  return request.delete(`/coach/diet/articles/${id}`)
}

// ── 饮食记录（待后续对接，暂保留 mock）────────────────────────────────────────

const mockResolve = data => Promise.resolve({ code: 200, message: 'success', data })

const mockFoods = [
  { id: 1, name: '鸡胸肉(100g)', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { id: 2, name: '米饭(100g)', calories: 116, protein: 2.6, carbs: 25.6, fat: 0.3 },
  { id: 3, name: '鸡蛋(1个)', calories: 72, protein: 6.3, carbs: 0.4, fat: 4.8 },
  { id: 4, name: '牛奶(200ml)', calories: 122, protein: 6.4, carbs: 9.6, fat: 6.4 },
  { id: 5, name: '香蕉(1根)', calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3 },
  { id: 6, name: '燕麦(100g)', calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9 }
]

export function searchFoods(keyword) {
  // TODO: return request.get('/diet/foods/search', { params: { keyword } })
  return mockResolve(mockFoods.filter(f => f.name.includes(keyword)))
}

export function getDietRecords(date) {
  // TODO: return request.get('/diet/records', { params: { date } })
  return mockResolve([
    { id: 1, meal_type: 1, food_name: '燕麦(100g)', amount: 100, calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9, record_date: date },
    { id: 2, meal_type: 2, food_name: '鸡胸肉(100g)', amount: 150, calories: 248, protein: 46.5, carbs: 0, fat: 5.4, record_date: date },
    { id: 3, meal_type: 2, food_name: '米饭(100g)', amount: 200, calories: 232, protein: 5.2, carbs: 51.2, fat: 0.6, record_date: date }
  ])
}

export function addDietRecord(data) {
  // TODO: return request.post('/diet/records', data)
  return mockResolve({ id: Date.now(), ...data })
}

export function deleteDietRecord(id) {
  // TODO: return request.delete(`/diet/records/${id}`)
  return mockResolve(null)
}
