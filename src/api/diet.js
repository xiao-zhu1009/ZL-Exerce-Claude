// src/api/diet.js
// 饮食模块接口：用户端文章浏览、教练端文章投稿管理、饮食记录（食物搜索/记录增删）、食物库投稿审核
// getDietArticles        → GET    /diet/articles
// getDietArticleDetail   → GET    /diet/articles/{id}
// uploadArticleCover     → POST   /coach/diet/articles/upload/cover
// publishArticle         → POST   /coach/diet/articles
// getMyArticles          → GET    /coach/diet/articles
// updateMyArticle        → PUT    /coach/diet/articles/{id}
// deleteMyArticle        → DELETE /coach/diet/articles/{id}
// searchFoods            → GET    /diet/foods/search?keyword=
// getDietRecords         → GET    /diet/records?record_date=
// getDietRangeSummary    → GET    /diet/records/range
// addDietRecord          → POST   /diet/records
// updateDietRecord       → PUT    /diet/records/{id}
// deleteDietRecord       → DELETE /diet/records/{id}
// submitFood             → POST   /coach/foods          教练投稿食物
// getMyFoods             → GET    /coach/foods          教练查自己的投稿
// deleteMyFood           → DELETE /coach/foods/{id}     教练删除投稿
// getAdminFoods          → GET    /admin/foods          管理员查投稿列表
// approveFood            → PUT    /admin/foods/{id}/approve
// rejectFood             → PUT    /admin/foods/{id}/reject

import request from '@/utils/request'

// ── 用户端文章 ────────────────────────────────────────────────────────────────

export function getDietArticles(params = {}) {
  return request.get('/diet/articles', { params })
}

export function getDietArticleDetail(id) {
  return request.get(`/diet/articles/${id}`)
}

// ── 教练端文章 ────────────────────────────────────────────────────────────────

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

// ── 饮食记录 ──────────────────────────────────────────────────────────────────

export function searchFoods(keyword = '', category = '') {
  return request.get('/diet/foods/search', { params: { keyword, category } })
}

export function getDietRecords(date) {
  return request.get('/diet/records', { params: { record_date: date } })
}

// start/end: yyyy-MM-dd，不传则后端默认取最近 days 天
export function getDietRangeSummary(params = {}) {
  return request.get('/diet/records/range', { params })
}

export function addDietRecord(data) {
  return request.post('/diet/records', data)
}

export function updateDietRecord(id, data) {
  return request.put(`/diet/records/${id}`, data)
}

export function deleteDietRecord(id) {
  return request.delete(`/diet/records/${id}`)
}

// ── 教练端食物库投稿 ──────────────────────────────────────────────────────────

export function submitFood(data) {
  return request.post('/coach/foods', data)
}

export function getMyFoods() {
  return request.get('/coach/foods')
}

export function deleteMyFood(id) {
  return request.delete(`/coach/foods/${id}`)
}

// ── 管理员食物库审核 ──────────────────────────────────────────────────────────

export function getAdminFoods(status) {
  return request.get('/admin/foods', { params: status !== undefined ? { status } : {} })
}

export function approveFood(id) {
  return request.put(`/admin/foods/${id}/approve`)
}

export function rejectFood(id, reject_reason) {
  return request.put(`/admin/foods/${id}/reject`, { reject_reason })
}

