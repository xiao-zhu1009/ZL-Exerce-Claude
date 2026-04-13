// src/api/coachBind.js
// 教练-学员绑定相关接口（用户端 + 管理员端）

import request from '@/utils/request'

// ── 用户端 ────────────────────────────────────────────────
// 教练列表（无需登录）
export function getCoaches(params) {
  return request.get('/coaches', { params })
}

// 申请绑定教练
export function applyBind(data) {
  return request.post('/coach-bind/apply', data)
}

// 查询我的绑定状态（当前教练）
export function getMyCoach() {
  return request.get('/coach-bind/my')
}

// 学员主动解绑
export function unbindCoach(bindId) {
  return request.delete('/coach-bind/me', { params: { bind_id: bindId } })
}

// ── 管理员端 ──────────────────────────────────────────────
// 绑定关系总览统计
export function getBindStats() {
  return request.get('/admin/coach-bind/stats')
}

// 教练维度统计列表
export function getCoachSummary(params) {
  return request.get('/admin/coach-bind/coaches', { params })
}
