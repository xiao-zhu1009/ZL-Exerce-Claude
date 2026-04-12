// src/api/action.js
// 动作库接口：用户端只读、教练端投稿管理
// getActions        → GET    /actions              用户端列表（筛选+分页）
// getActionDetail   → GET    /actions/{id}         用户端详情（触发浏览数+1）
// publishAction     → POST   /coach/actions        教练发布新动作
// getMyActions      → GET    /coach/actions        教练查自己的投稿
// updateMyAction    → PUT    /coach/actions/{id}   教练修改被驳回的动作
// deleteMyAction    → DELETE /coach/actions/{id}   教练删除待审核/已驳回的动作

import request from '@/utils/request'

export function getActions(params = {}) {
  return request.get('/actions', { params })
}

export function getActionDetail(id) {
  return request.get(`/actions/${id}`)
}

export function publishAction(data) {
  return request.post('/coach/actions', data)
}

export function getMyActions() {
  return request.get('/coach/actions')
}

export function updateMyAction(id, data) {
  return request.put(`/coach/actions/${id}`, data)
}

export function deleteMyAction(id) {
  return request.delete(`/coach/actions/${id}`)
}
